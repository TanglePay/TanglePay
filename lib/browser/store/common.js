import { useContext, useEffect, useState } from 'react'
import { Base, IotaSDK, I18n, Http, Trace } from '../common'
import _get from 'lodash/get'
import { StoreContext } from './context'
import BigNumber from 'bignumber.js'
export const initState = {
    curMainActive: 'assets', //current tab (for browser)
    registerInfo: {}, // for browser
    lang: '',
    showAssets: true,
    curNodeId: 0, // current node (default 0=mainnet)
    walletsList: [], //wallet list，{id,name,address,isSelected}
    // list of stable currencies
    legalList: [
        {
            label: 'USD',
            value: 'USD',
            unit: '$',
            isSelected: true
        }
    ],
    assetsList: [], // list of assets
    price: { IOTA: 1 }, // current exchange rate，{IOTA:1.65}
    totalAssets: {},
    activityRequest: 0, //data sync indicator
    activityData: {}, //transaction history data
    hisList: [], //transtion history data filtered for display
    isRequestAssets: false, // indicator for account sync status
    isRequestHis: false, // indicator for account history sync status
    isRequestStakeHis: false, // indicator for account stake history sync status
    forceRequest: 0 //force data sync indicator
}

export const reducer = (state, action) => {
    let { type, data } = action
    switch (type) {
        case 'lang':
            if (Base.isBrowser) {
                if (!data) {
                    data = 'en'
                }
                I18n.changeLanguage(data)
            } else {
                if (!data) {
                    data = I18n.locale || 'en'
                }
                I18n.locale = data
                Base.setLocalData('common.lang', data)
            }
            break
        case 'showAssets':
            if (data === undefined || data === null) {
                data = true
            }
            Base.setLocalData('common.showAssets', !!data)
            break
        case 'price':
            if (!data) {
                data = { IOTA: 0 }
            }
            Base.setLocalData('common.price', data)
            break
        case 'activityData':
            if (data === undefined) {
                return
            }
            const saveFunc = Base.isBrowser ? 'setLocalData' : 'setSensitiveInfo'
            Base[saveFunc]('common.activityData', data)
            break
        case 'walletsList': {
            const list = data || []
            let localList = list
            if (Base.isBrowser) {
                localList = list.map((e) => {
                    return { ...e, password: undefined }
                })
                const bg = window.chrome?.extension?.getBackgroundPage()
                if (bg) {
                    bg.setBackgroundData('common.walletsList', list)
                }
            }
            const saveFunc = Base.isBrowser ? 'setLocalData' : 'setSensitiveInfo'
            Base[saveFunc]('common.walletsList', localList)
            return { ...state, [type]: list }
        }
    }
    return { ...state, [type]: data }
}

export const useAddWallet = () => {
    const { store, dispatch } = useContext(StoreContext)
    const addWallet = (data) => {
        let walletsList = _get(store, 'common.walletsList')
        walletsList = [
            ...walletsList.map((e) => {
                return { ...e, isSelected: false }
            }),
            { ...data, isSelected: true }
        ]
        dispatch({
            type: 'common.walletsList',
            data: [...walletsList]
        })
    }
    return addWallet
}

export const useSelectWallet = () => {
    const { store, dispatch } = useContext(StoreContext)
    const updateHisList = useUpdateHisList()
    const selectWallet = (id) => {
        let walletsList = _get(store, 'common.walletsList')
        let address = ''
        walletsList.forEach((e) => {
            e.isSelected = e.id === id
            e.id === id && (address = e.address)
        })
        dispatch({
            type: 'common.walletsList',
            data: [...walletsList]
        })
        if (address) {
            // On address switch, read portfolio from local cache
            Base.getLocalData(address).then((res) => {
                res = res || {}
                setAssetsData(res.totalAssets || {}, res.assetsList || [], dispatch)
            })
            // On address switch, read transaction history from local cache
            updateHisList([], address)
        }
    }
    return selectWallet
}

export const useEditWallet = () => {
    const { store, dispatch } = useContext(StoreContext)
    const editWallet = (id, data, isChangePassword) => {
        let walletsList = _get(store, 'common.walletsList')
        walletsList.forEach((e, i) => {
            if (e.id === id) {
                // reencrypt seed on password change
                if (isChangePassword) {
                    data.seed = IotaSDK.changePassword(e.password, e.seed, data.password)
                }
                walletsList[i] = { ...e, ...data }
            }
        })
        dispatch({
            type: 'common.walletsList',
            data: [...walletsList]
        })
    }
    return editWallet
}

export const useChangeNode = (dispatch) => {
    const changeNode = async (id) => {
        id = id || 1
        await IotaSDK.init(id)
        dispatch({
            type: 'common.curNodeId',
            data: id
        })
        Base.setLocalData('common.curNodeId', id)
    }
    return changeNode
}

export const useGetNodeWallet = () => {
    const [curWallet, setCurWallet] = useState({})
    const [canUseWalletsList, setCanUseWalletsList] = useState([])
    const { store } = useContext(StoreContext)
    const walletsList = _get(store, 'common.walletsList')
    const curNodeId = _get(store, 'common.curNodeId')
    useEffect(() => {
        if (IotaSDK.info) {
            const curList = IotaSDK.getWalletList(walletsList)
            // if (curList.length > 0 && curList.filter((e) => e.isSelected).length === 0) {
            //     curList[0].isSelected = true
            // }
            setCanUseWalletsList(curList)
            setCurWallet(curList.find((e) => e.isSelected) || {})
        }
    }, [curNodeId, walletsList])
    return [curWallet, canUseWalletsList]
}

// get current stable currency
export const useGetLegal = () => {
    const { store } = useContext(StoreContext)
    return _get(store, 'common.legalList').find((e) => e.isSelected)
}

// get exchange rate
export const useGetPrice = () => {
    const { store, dispatch } = useContext(StoreContext)
    const getPrice = async () => {
        try {
            const res = await Http.GET('method=token.getPrice', {
                code: 'MIOTA'
            })
            dispatch({
                type: 'common.price',
                data: {
                    IOTA: res
                }
            })
        } catch (error) {
            console.log(error)
        }
    }
    return [_get(store, 'common.price'), getPrice]
}

// request for asset sync
const setRequestAssets = (isRequestAssets, dispatch) => {
    dispatch({
        type: 'common.isRequestAssets',
        data: isRequestAssets
    })
}

const setAssetsData = (totalAssets, list, dispatch) => {
    dispatch({
        type: 'common.totalAssets',
        data: totalAssets
    })
    dispatch({
        type: 'common.assetsList',
        data: list
    })
}

export const useUpdateBalance = () => {
    const { store, dispatch } = useContext(StoreContext)
    const curNodeId = _get(store, 'common.curNodeId')
    const updateBalance = (balance, address) => {
        const price = curNodeId !== 2 ? _get(store, 'common.price') || {} : { IOTA: 0 }
        const balanceMi = new BigNumber(balance).div(IotaSDK.IOTA_MI)
        const assets = price.IOTA ? balanceMi.times(new BigNumber(price.IOTA || 0)) : 0
        const list = [
            {
                balance: Base.formatNum(balanceMi),
                realBalance: Number(balance),
                unit: 'Mi',
                name: 'IOTA',
                assets: Base.formatNum(assets)
            }
        ]
        const totalAssets = {
            iotaBalance: Base.formatNum(balanceMi),
            realIotaBalance: Number(balance),
            iotaUnit: 'Mi',
            assets: Base.formatNum(assets),
            realAssets: Number(assets)
        }
        Base.setLocalData(address, {
            assetsList: list,
            totalAssets
        })
        setRequestAssets(true, dispatch)
        setAssetsData(totalAssets, list, dispatch)
    }
    return updateBalance
}

const setRequestHis = (isRequestHis, dispatch) => {
    dispatch({
        type: 'common.isRequestHis',
        data: isRequestHis
    })
}
const setRequestStakeHis = (isRequestStakeHis, dispatch) => {
    dispatch({
        type: 'common.isRequestStakeHis',
        data: isRequestStakeHis
    })
}

const useUpdateHisList = () => {
    const { store, dispatch } = useContext(StoreContext)
    const curNodeId = _get(store, 'common.curNodeId')
    // read from cache if activityList===[]
    const updateHisList = async (activityList, address) => {
        const price = curNodeId !== 2 ? _get(store, 'common.price') || {} : { IOTA: 0 }
        const activityData = _get(store, 'common.activityData') || {}
        if (!activityList || !activityList.length) {
            activityList = activityData[address] || []
        }
        const stakeHisList = []
        const hisList = []
        let preOutputIndex = null
        let preTransactionId = null
        const iotaPrice = new BigNumber(price.IOTA || 0)
        activityList.forEach((e, i) => {
            let { outputIndex, transactionId, inputs, timestamp, outputs, messageId, payloadIndex, payloadData } = e
            const obj = {
                id: messageId,
                coin: 'IOTA',
                timestamp
            }
            // type：0-》receive，1-》send，2-》stake，3-》unstake
            // stake
            if (payloadIndex === 'PARTICIPATE') {
                const amount = outputs[0].amount
                Object.assign(obj, {
                    type: payloadData?.length ? 2 : 3,
                    num: amount,
                    address: address
                })
                stakeHisList.push({
                    tokens: payloadData,
                    amount: new BigNumber(amount).div(IotaSDK.IOTA_MI).valueOf(),
                    time: timestamp,
                    address: outputs[0].bech32Address
                })
            } else if (payloadIndex === 'TanglePay') {
                const { from, to, amount } = payloadData
                Object.assign(obj, {
                    type: from === address ? 1 : 0,
                    num: amount,
                    address: from === address ? to : from
                })
            } else {
                const outputsLen = outputs.length
                if (outputsLen === 1) {
                    // balance = 0 after send
                    Object.assign(obj, {
                        type: 0,
                        num: outputs[0].amount,
                        address: outputs[0].bech32Address,
                        fromUnknown: true
                    })
                } else {
                    // balance != 0 after send
                    inputs = inputs || []
                    // Send or receive is judged by matching the outpuIndex of last message and transaction index of current, combining with a few other factors
                    const inputData = inputs.find((e) => e.transactionId === preTransactionId) || inputs[0] || {}
                    const transactionOutputIndex = inputData?.transactionOutputIndex || 0
                    const otherData = outputs[1 - outputIndex] || outputs[0]
                    const selfData = outputs[outputIndex] || outputs[0]
                    obj.address = otherData?.bech32Address || ''
                    if (transactionOutputIndex !== preOutputIndex) {
                        // receive record
                        Object.assign(obj, {
                            type: 0,
                            num: selfData.amount
                        })
                    } else {
                        // send record
                        Object.assign(obj, {
                            type: 1,
                            num: otherData.amount
                        })
                    }
                    preOutputIndex = outputIndex
                    preTransactionId = transactionId
                }
            }
            const num = new BigNumber(obj.num || '').div(IotaSDK.IOTA_MI)
            const assets = num.times(iotaPrice)
            hisList.push({
                ...obj,
                num: Base.formatNum(num),
                assets: Base.formatNum(assets)
            })
        })
        const sendList = await IotaSDK.getSendList(address)
        sendList.forEach((e) => {
            const assetsStr = Base.formatNum(new BigNumber(e.num || '').times(iotaPrice))
            const numStr = Base.formatNum(e.num)
            // refer to local storage if the balance is 0
            hisList.push({ ...e, num: numStr, assets: assetsStr })
        })
        hisList.sort((a, b) => b.timestamp - a.timestamp)
        const lastData = hisList[0]
        if (Base.globalTemData.isGetMqttMessage && lastData?.type === 0) {
            // prompt users when receiving transfers from mqtt messages
            Base.globalTemData.isGetMqttMessage = false
            Trace.transaction(
                'receive',
                lastData.id,
                lastData.address,
                address,
                new BigNumber(lastData.num || '').times(IotaSDK.IOTA_MI).valueOf()
            )
            Base.globalToast.success(I18n.t('assets.receivedSucc').replace('{num}', lastData.num))
        }
        dispatch({
            type: 'common.activityData',
            data: { ...activityData, [address]: [...activityList] }
        })
        dispatch({
            type: 'common.hisList',
            data: hisList
        })

        // stake history
        const eventids = []
        stakeHisList.forEach(({ tokens }) => {
            tokens.forEach((e) => {
                if (!eventids.includes(e)) {
                    eventids.push(e)
                }
            })
        })
        IotaSDK.requestEventsByIds(eventids).then((res) => {
            const tokenDic = {}
            eventids.forEach((e, i) => {
                tokenDic[e] = _get(res[i], 'payload.symbol')
            })
            stakeHisList.forEach((e) => {
                e.tokens = e.tokens.map((d) => {
                    return { eventId: d, token: tokenDic[d], address: e.address }
                })
            })
            stakeHisList.sort((a, b) => a.timestamp - b.timestamp)
            let preInfo = null
            stakeHisList.forEach((e) => {
                const { tokens } = e
                const tLen = tokens.length
                const pLen = preInfo?.tokens?.length
                if (preInfo === null && tLen) {
                    e.type = 1
                } else if (pLen && tLen > 0) {
                    const preEventId = preInfo.tokens.map((e) => e.eventId)[0]
                    const findEvt = tokens.find((e) => e.eventId === preEventId)
                    if (pLen === tLen && findEvt) {
                        e.type = 2
                    } else {
                        e.type = 4
                    }
                } else if (preInfo) {
                    e.type = 3
                    e.tokens = [...preInfo.tokens]
                }
                preInfo = { ...e }
            })

            dispatch({
                type: 'staking.historyList',
                data: stakeHisList
            })
            setRequestStakeHis(true, dispatch)
        })
        // stake end

        setRequestHis(true, dispatch)
    }
    return updateHisList
}

// Asset list only supports IOTA，data structure includes balance, transaction history
export const useGetAssetsList = (curWallet) => {
    const { store, dispatch } = useContext(StoreContext)
    const updateBalance = useUpdateBalance()
    const updateHisList = useUpdateHisList()
    const [price, getPrice] = useGetPrice()
    useEffect(() => {
        getPrice()
    }, [])
    useEffect(async () => {
        setRequestAssets(false, dispatch)
        setRequestHis(false, dispatch)
        setRequestStakeHis(false, dispatch)
        if (!curWallet.seed) {
            setRequestAssets(true, dispatch)
            setRequestHis(true, dispatch)
            setRequestStakeHis(true, dispatch)
            setAssetsData({}, [], dispatch)
            dispatch({
                type: 'common.hisList',
                data: []
            })
            dispatch({
                type: 'staking.historyList',
                data: []
            })
            return
        }
        if (!price || !price.hasOwnProperty('IOTA')) {
            return
        }
        let newCurWallet = curWallet
        if (Base.isBrowser) {
            newCurWallet = await IotaSDK.inputPassword(curWallet)
        }
        const [addressList, outputList] = await IotaSDK.getValidAddresses(newCurWallet)
        // Sync balance
        IotaSDK.getBalance(newCurWallet, addressList)
            .then((balance) => {
                updateBalance(balance, newCurWallet.address)
            })
            .catch(() => {
                setRequestAssets(true, dispatch)
                setAssetsData({}, [], dispatch)
            })
        // Sync transaction history
        const address = newCurWallet.address
        IotaSDK.getHisList(outputList)
            .then((activityList) => {
                updateHisList(activityList, address)
            })
            .catch(() => {
                updateHisList([], address)
            })
    }, [price, curWallet.address, store.common.forceRequest])
}

// Display devnet url when it is being selected
export const useCreateCheck = (callBack) => {
    const { store } = useContext(StoreContext)
    const [, canUseWalletsList] = useGetNodeWallet()
    const curNodeId = _get(store, 'common.curNodeId')
    useEffect(() => {
        let len = canUseWalletsList.length || 0
        callBack && callBack(`wallet ${len + 1}`)
    }, [canUseWalletsList])
    useEffect(() => {
        if (curNodeId === 2) {
            const nodeUrl = (IotaSDK.nodes.find((e) => e.id === curNodeId) || {}).url
            nodeUrl && Base.globalToast.show(`${I18n.t('user.network')} : ${nodeUrl}`)
        }
    }, [curNodeId])
}
