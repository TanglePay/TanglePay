import { useReducer, useEffect, useContext } from 'react'
import * as CommonStore from './common'
import * as StakingStore from './staking'
import * as DappsStore from './dapps'
import * as NftStore from './nft'
import _get from 'lodash/get'
import { StoreContext as Context } from './context'
import { Base } from '../common'
import _isEqual from 'lodash/isEqual'
export const StoreContext = Context

const stores = {
    common: CommonStore,
    staking: StakingStore,
    dapps: DappsStore,
    nft: NftStore
}

let cacheStore = {}

const storeReducer = (store, action) => {
    const { type, data } = action
    // skip processing if the data is not change.
    // only primitives are supported while deep compare of complex objects would fallback to corresponding reducers
    const [module, act] = type.split('.')
    const storeHander = stores[module]
    if (storeHander) {
        store = { ...store, [module]: storeHander.reducer(store[module], { type: act, data }) }
    }
    if (type === 'store') {
        store = data
    }
    cacheStore = store
    return store
}

const initState = {}
for (const i in stores) {
    initState[i] = stores[i].initState
}

export const useStoreReducer = () => {
    const [store, curDispatch] = useReducer(storeReducer, initState)
    const dispatch = ({ type, data }) => {
        if (_isEqual(_get(cacheStore, type), data)) {
            return
        }
        curDispatch({ type, data })
    }
    return [store, dispatch]
}

// get store data
export const useStore = (key) => {
    const { store, dispatch } = useContext(StoreContext)
    const changeData = (val) => {
        dispatch({ type: key, data: val })
    }
    return [key ? _get(store, key) : store, changeData, dispatch]
}
