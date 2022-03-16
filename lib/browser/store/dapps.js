import { useContext, useEffect } from 'react'
import { API_URL } from '../common'
import { StoreContext } from './context'
import _uniqWith from 'lodash/uniqWith'
import _isEqual from 'lodash/isEqual'
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
        fetch(`${API_URL}/dapps.config.json`)
            .then((res) => res.json())
            .then((res) => {
                console.log(res, '---')
                const dapps = res?.dapps || []
                const keywords = res?.keywords || []
                dispatch({
                    type: 'dapps.list',
                    data: dapps
                })
                dispatch({
                    type: 'dapps.keywords',
                    data: keywords
                })
            })
            .catch((err) => console.log(err))
    }, [])
}
