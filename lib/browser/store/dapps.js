import { useContext, useEffect, useRef } from 'react'
import { API_URL } from '../common'
import { StoreContext } from './context'
import _uniqWith from 'lodash/uniqWith'
import _isEqual from 'lodash/isEqual'
import { Base } from '../common'
import _get from 'lodash/get'
export const initState = {
    list: [],
    keywords: []
}
export const reducer = (state, action) => {
    let { type, data } = action
    return { ...state, [type]: data }
}

export const useGetDappsConfig = (curWallet) => {
    const { _, dispatch } = useContext(StoreContext)
    const dappsJson = useRef()
    const handleDapps = ([res, switchConfig]) => {
        // const dapps = {
        //     Soonaverse: {
        //         icon: 'Soonaverse',
        //         desc: 'An all-in-one feeless platform for community engagement and DAO creation. Build, vote, earn, learn and let the best ideas win.',
        //         url: 'https://soonaverse.com/',
        //         tags: ['All', 'NFT'],
        //         support: [1, 2, 3, 4, 5, 6, 7, 8, 101, 102]
        //     },
        //     Iotabee: {
        //         icon: 'Iotabee',
        //         desc: 'Iotabee is the swap to create liquidity and trade tokens on IOTA, Shimmer, Shimmer EVM and other EVM chains like BSC.',
        //         url: 'https://iotabee.com/',
        //         tags: ['All', 'Swap'],
        //         support: [1, 2, 3, 4, 5, 6, 7, 8, 101, 102]
        //     },
        //     Simplex: {
        //         icon: 'Simplex',
        //         desc: 'Fiat gateway. Buy IOTA with VISA and Mastercard.',
        //         url: 'https://tanglepay.com/simplex.html?crypto=MIOTA',
        //         tags: ['All'],
        //         support: [1, 2, 3, 4, 5, 6, 7, 8, 101, 102]
        //     }
        // }
        const dapps = { ...res?.dapps } || {}
        for (const i in dapps) {
            if (Object.hasOwnProperty.call(dapps, i)) {
                const obj = dapps[i]
                if (!obj.support || !obj.support.includes(curWallet.nodeId)) {
                    delete dapps[i]
                }
            }
        }
        const keywords = res?.keywords || []
        if (switchConfig.buyIota != 1) {
            delete dapps.Simplex
        }
        dispatch({
            type: 'dapps.list',
            data: dapps
        })
        dispatch({
            type: 'dapps.keywords',
            data: keywords
        })
        Base.setLocalData('local.dapps.list', res.dapps)
        Base.setLocalData('local.dapps.keywords', res.keywords)
    }
    useEffect(() => {
        if (dappsJson.current && dappsJson.current.length > 0) {
            handleDapps(dappsJson.current)
        } else {
            if (curWallet.nodeId) {
                Promise.all([
                    fetch(`${API_URL}/dapps.config.json?v=${new Date().getTime()}`).then((res) => res.json()),
                    fetch(`${API_URL}/switchConfig.json?v=${new Date().getTime()}`).then((res) => res.json())
                ])
                    .then(([res, switchConfig]) => {
                        dappsJson.current = [res, switchConfig]
                        handleDapps(dappsJson.current)
                    })
                    .catch((err) => {
                        console.log(err)
                        Promise.all([
                            Base.getLocalData('local.dapps.list'),
                            Base.getLocalData('local.dapps.keywords')
                        ]).then(([dapps, keywords]) => {
                            dappsJson.current = [
                                {
                                    dapps,
                                    keywords
                                },
                                {}
                            ]
                            handleDapps(dappsJson.current)
                        })
                    })
            }
        }
    }, [curWallet.nodeId])
}
