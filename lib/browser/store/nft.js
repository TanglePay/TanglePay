import { useContext, useEffect, useState, useRef } from 'react'
import { API_URL, Http } from '../common'
import { StoreContext } from './context'
import { Base } from '../common'
import { Soon } from 'soonaverse'
import _get from 'lodash/get'
import _chunk from 'lodash/chunk'
import _flatten from 'lodash/flatten'
import { useGetNodeWallet } from './common'
const soon = new Soon(true)
export const initState = {
    list: [],
    isRequestNft: false
}
export const reducer = (state, action) => {
    let { type, data } = action
    return { ...state, [type]: data }
}

export const useGetNftList = () => {
    const [curWallet] = useGetNodeWallet()
    const { store, dispatch } = useContext(StoreContext)
    const validAddresses = _get(store, 'common.validAddresses')
    const [config, setConfig] = useState({ list: [], bigAssets: [] })
    const addressRef = useRef(curWallet.address)
    useEffect(() => {
        fetch(`${API_URL}/nft.json?v=${new Date().getTime()}`)
            .then((res) => res.json())
            .then((res) => {
                setConfig(res)
            })
            .catch((err) => console.log(err))
    }, [])
    useEffect(async () => {
        addressRef.current = curWallet?.address
        dispatch({
            type: 'nft.list',
            data: (await Base.getLocalData(`${curWallet?.address}.nft.list`)) || []
        })
    }, [curWallet?.address])
    useEffect(() => {
        const request = async (address) => {
            if (!address) {
                dispatch({
                    type: 'nft.list',
                    data: []
                })
            } else {
                if (!config?.list?.length) {
                    dispatch({
                        type: 'nft.list',
                        data: []
                    })
                    return
                }
                let configList = JSON.parse(JSON.stringify(config.list)).map((e) => {
                    return {
                        ...e,
                        list: []
                    }
                })
                const noDataList = configList.filter((e) => e.link || e.list.length > 0)
                if (validAddresses.length === 0) {
                    dispatch({
                        type: 'nft.isRequestNft',
                        data: true
                    })
                    dispatch({
                        type: 'nft.list',
                        data: noDataList
                    })
                    return
                }
                dispatch({
                    type: 'nft.isRequestNft',
                    data: false
                })
                const list = _chunk(validAddresses, 10)
                let res = await Promise.all(
                    list.map((e) => {
                        return soon.getNftsByIotaAddress(e)
                    })
                )

                res = _flatten(res)

                // const bigAssets = JSON.parse(JSON.stringify(config.bigAssets || []));
                const ipfsMediaObj = {}
                res.forEach((e) => {
                    let { space, media, ipfsMedia } = e
                    if (!ipfsMediaObj[ipfsMedia]) {
                        ipfsMediaObj[ipfsMedia] = {
                            id: ipfsMedia,
                            url: media
                        }
                    }
                    let configItem = configList.find((e) => e.space == space)
                    if (!configItem) {
                        configItem = configList.find((e) => e.space == '0')
                    }
                    configItem.list.push({
                        ...e
                        // isPreview: bigAssets.includes(space)
                    })
                })
                configList = configList.filter((e) => e.link || e.list.length > 0)
                let ipfsMediaList = Object.values(ipfsMediaObj)
                ipfsMediaList = _chunk(ipfsMediaList, 5)
                let thumbnailList = await Promise.all(
                    ipfsMediaList.map((e) => {
                        return Http.POST('method=ntfImage.getImages', {
                            data: e
                        })
                    })
                )
                thumbnailList = _flatten(thumbnailList)
                configList.forEach(({ list }) => {
                    list.forEach((e) => {
                        const thumbnailItem = thumbnailList.find((d) => d.id === e.ipfsMedia)
                        if (thumbnailItem) {
                            const { thumbnailImage, imageType } = thumbnailItem
                            e.thumbnailImage = thumbnailImage
                            e.imageType = imageType
                        }
                    })
                })
                dispatch({
                    type: 'nft.list',
                    data: configList
                })
                Base.setLocalData(`${address}.nft.list`, configList)
                dispatch({
                    type: 'nft.isRequestNft',
                    data: true
                })
            }
        }
        request(addressRef.current)
    }, [JSON.stringify(validAddresses), JSON.stringify(config)])
}
