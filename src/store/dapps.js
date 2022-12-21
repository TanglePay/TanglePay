import { useContext, useEffect } from 'react'
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

export const useGetDappsConfig = () => {
    const { _, dispatch } = useContext(StoreContext)
    useEffect(() => {
        Promise.all([
            fetch(`${API_URL}/dapps.config.json?v=${new Date().getTime()}`).then((res) => res.json()),
            fetch(`${API_URL}/switchConfig.json?v=${new Date().getTime()}`).then((res) => res.json())
        ])
            .then(([res, switchConfig]) => {
                const dapps = res?.dapps || []
                const keywords = res?.keywords || []
                if (switchConfig.buyIota == 1) {
                    dapps.Simplex = {
                        icon: 'Simplex',
                        desc: 'Fiat gateway. Buy IOTA with VISA and Mastercard.',
                        url: 'https://tanglepay.com/simplex.html?crypto=MIOTA',
                        tags: ['All']
                    }
                }
                dispatch({
                    type: 'dapps.list',
                    data: dapps
                })
                dispatch({
                    type: 'dapps.keywords',
                    data: keywords
                })
                Base.setLocalData('local.dapps.list', dapps)
                Base.setLocalData('local.dapps.keywords', keywords)
            })
            .catch((err) => {
                console.log(err)
                Promise.all([Base.getLocalData('local.dapps.list'), Base.getLocalData('local.dapps.keywords')]).then(
                    ([dapps, keywords]) => {
                        dispatch({
                            type: 'dapps.list',
                            data: dapps
                        })
                        dispatch({
                            type: 'dapps.keywords',
                            data: keywords
                        })
                    }
                )
            })
    }, [])
}
