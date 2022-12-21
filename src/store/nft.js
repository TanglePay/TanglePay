import { useContext, useEffect, useState, useRef } from 'react'
import { API_URL, Http, IotaSDK } from '../common'
import { StoreContext } from './context'
import { Base } from '../common'
import _get from 'lodash/get'
import _chunk from 'lodash/chunk'
import _flatten from 'lodash/flatten'
import { useGetNodeWallet } from './common'
export const initState = {
    list: [],
    isRequestNft: false,
    forceRequest: 0 //force data sync indicator
}
export const reducer = (state, action) => {
    let { type, data } = action
    return { ...state, [type]: data }
}

export const useGetNftList = () => {
    const [curWallet] = useGetNodeWallet()
    const { store, dispatch } = useContext(StoreContext)
    const validAddresses = _get(store, 'common.validAddresses')
    const forceRequest = _get(store, 'nft.forceRequest')
    const [config, setConfig] = useState({ list: [], bigAssets: [], ipfsOrigins: [] })
    const addressRef = useRef(curWallet.address)
    useEffect(() => {
        fetch(`${API_URL}/nft.json?v=${new Date().getTime()}`)
            .then((res) => res.json())
            .then((res) => {
                Base.setLocalData('local.nft.json', res)
                setConfig(res)
            })
            .catch((err) => {
                console.log(err)
                Base.getLocalData('local.nft.json').then((localRes) => {
                    if (localRes) {
                        setConfig(localRes)
                    }
                })
            })
    }, [])
    useEffect(async () => {
        addressRef.current = curWallet?.address
        const localList = (await Base.getLocalData(`${curWallet?.address}.nft.list`)) || []
        if (localList?.length) {
            dispatch({
                type: 'nft.isRequestNft',
                data: true
            })
            dispatch({
                type: 'nft.list',
                data: localList
            })
        }
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
                const localList = await Base.getLocalData(`${curWallet?.address}.nft.list`)
                if (!localList?.length) {
                    dispatch({
                        type: 'nft.isRequestNft',
                        data: false
                    })
                }

                const res = await IotaSDK.getNfts(validAddresses, config?.ipfsOrigins)
                // const bigAssets = JSON.parse(JSON.stringify(config.bigAssets || []));
                const ipfsMediaObj = {}
                const iotaBeeCollectionId = configList.find((e) => e.isIotaBeeChristmas)?.space
                const iotaBeeIpfs = configList.find((e) => e.isIotaBeeChristmas)?.ipfs || []
                res.forEach((e) => {
                    let { space, collectionId, media, ipfsMedia, isIpfs } = e
                    if (iotaBeeCollectionId === collectionId) {
                        const origin = iotaBeeIpfs[parseInt(Math.random() * iotaBeeIpfs.length)]
                        let [http, str] = (e.uri || '').split('//')
                        str = str.split('/')
                        str[0] = origin.split('//')[1]
                        const newUri = http + '//' + str.join('/')
                        e.uri = newUri
                        e.ipfsMedia = newUri
                        e.media = e.ipfsMedia
                    }
                    if (!isIpfs) {
                        if (!ipfsMediaObj[ipfsMedia]) {
                            ipfsMediaObj[ipfsMedia] = {
                                id: ipfsMedia,
                                url: media
                            }
                        }
                    }
                    let configItem = configList.find((e) => e.space == space)
                    if (!configItem) {
                        if (iotaBeeCollectionId && iotaBeeCollectionId === collectionId) {
                            configItem = configList.find((e) => e.space == iotaBeeCollectionId)
                        } else {
                            configItem = configList.find((e) => e.space == '0')
                        }
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
                            data: e,
                            isHandlerError: true
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
    }, [JSON.stringify(validAddresses), JSON.stringify(config), forceRequest])
}
