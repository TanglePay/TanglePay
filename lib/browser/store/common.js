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
    totalAssets: {},
    activityRequest: 0, //data sync indicator
    activityData: {}, //transaction history data
    hisList: [], //transtion history data filtered for display
    isRequestAssets: false, // indicator for account sync status
    isRequestHis: false, // indicator for account history sync status
    isRequestStakeHis: false, // indicator for account stake history sync status
    forceRequest: 0, //force data sync indicator

    disTrace: 0, // disable trace.js

    validAddresses: [],

    detailList: [], // wallet info
    detailTotalInfo: {}
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
            Base.curLang = data
            break
        case 'showAssets':
            if (data === undefined || data === null) {
                data = true
            }
            Base.setLocalData('common.showAssets', !!data)
            break
        case 'activityData':
            if (data === undefined) {
                return
            }
            const saveFunc = Base.isBrowser ? 'setLocalData' : 'setSensitiveInfo'
            Base[saveFunc]('common.activityData', data)
            break
        case 'walletsList': {
            let list = (data || []).filter((e) => e?.bech32HRP !== 'atoi')
            list = list.map((e) => {
                if (!e.nodeId) {
                    e.nodeId = IotaSDK.nodes.find((d) => d?.bech32HRP === e?.bech32HRP)?.id
                }
                return e
            })
            let localList = list.map((e) => {
                return { ...e, password: e.password ? `password_${e.address}` : undefined }
            })
            const saveFunc = Base.isBrowser ? 'setLocalData' : 'setSensitiveInfo'
            Base[saveFunc]('common.walletsList', localList)
            return { ...state, [type]: localList }
        }
        case 'disTrace': {
            Base.setLocalData('common.disTrace', data)
            return { ...state, [type]: data }
        }
    }
    return { ...state, [type]: data }
}

export const useRemoveWallet = () => {
    const { store, dispatch } = useContext(StoreContext)
    const removeWallet = (id) => {
        let walletsList = _get(store, 'common.walletsList')
        walletsList = walletsList.filter((e) => e.id !== id)
        dispatch({
            type: 'common.walletsList',
            data: [...walletsList]
        })
    }
    return removeWallet
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
    const changeNode = useChangeNode()
    const updateHisList = useUpdateHisList()
    const selectWallet = async (id) => {
        let walletsList = _get(store, 'common.walletsList')
        const curWallet = walletsList.find((e) => e.id === id)
        if (IotaSDK.curNode?.id !== curWallet?.nodeId) {
            await changeNode(curWallet?.nodeId)
        }
        let address = curWallet?.address
        walletsList.forEach((e) => {
            e.isSelected = e.id === id
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
            updateHisList([], curWallet)
        }
    }
    return selectWallet
}

export const useEditWallet = () => {
    const { store, dispatch } = useContext(StoreContext)
    const editWallet = async (id, data, isChangePassword) => {
        let walletsList = _get(store, 'common.walletsList')
        if (isChangePassword && !data.publicKey) {
            data.publicKey = await IotaSDK.seedToPublicKey({
                localSeed: data.seed,
                password: data.oldPassword,
                nodeId: data.nodeId
            })
        }
        walletsList.forEach((e, i) => {
            if (e.id === id) {
                // reencrypt seed on password change
                if (isChangePassword) {
                    data.seed = IotaSDK.changePassword(data.oldPassword, e.seed, data.password)
                }
                delete data.oldPassword
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

export const useChangeNode = () => {
    const changeNode = async (id) => {
        id = id || 1
        await IotaSDK.init(id)
        const dispatch = Base.globalDispatch
        if (dispatch) {
            let walletsList = await IotaSDK.getWalletList()
            walletsList = walletsList.map((e) => {
                if (IotaSDK.checkWeb3Node(e.nodeId) && IotaSDK.checkWeb3Node(id)) {
                    e.nodeId = id
                }
                if (e.isSelected && e.nodeId !== id) {
                    e.isSelected = false
                }
                return e
            })
            dispatch({
                type: 'common.walletsList',
                data: walletsList
            })
            dispatch({
                type: 'common.curNodeId',
                data: id
            })
            dispatch({
                type: 'common.hisList',
                data: []
            })
        }
        Base.setLocalData('common.curNodeId', id)
    }
    return changeNode
}

export const useGetNodeWallet = () => {
    const { store } = useContext(StoreContext)
    const walletsList = _get(store, 'common.walletsList')
    const curNodeId = _get(store, 'common.curNodeId')
    let curWallet = walletsList.find((e) => e.isSelected && e.nodeId === curNodeId) || {}
    return [curWallet, walletsList]
}

// get current stable currency
export const useGetLegal = () => {
    const { store } = useContext(StoreContext)
    return _get(store, 'common.legalList').find((e) => e.isSelected)
}

// get exchange rate
const getPrice = async (code) => {
    if (IotaSDK.priceDic[code]) {
        return IotaSDK.priceDic[code]
    }
    let codeStr = code
    if (code === 'IOTA') {
        codeStr = 'MIOTA'
    }
    try {
        const res = await Http.GET('method=token.getPrice', {
            code: codeStr,
            isHandlerError: true
        })
        IotaSDK.priceDic[code] = res
    } catch (error) {
        IotaSDK.priceDic[code] = 0
    }
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
    // const curNodeId = _get(store, 'common.curNodeId')
    const updateBalance = async (address, list, curNodeId) => {
        await Promise.all(
            list.map((e) => {
                return getPrice(e.token)
            })
        )
        let total = BigNumber(0)
        const newList = list.map(({ realBalance, token, contract, balance, decimal, isSMRToken }) => {
            const price = IotaSDK.priceDic[token]
            const assets = price && curNodeId !== 2 ? BigNumber(balance).times(price || 0) : 0
            total = total.plus(assets)
            const isSMR = IotaSDK.checkSMR(curNodeId)
            return {
                decimal,
                balance: Base.formatNum(balance),
                realBalance: Number(realBalance),
                unit: curNodeId === 1 ? 'Mi' : isSMR && !isSMRToken ? 'SMR' : '',
                name: token,
                contract,
                assets: Base.formatNum(assets),
                isSMRToken
            }
        })

        const totalAssets = {
            assets: Base.formatNum(total)
        }
        if (IotaSDK?.curNode?.id == curNodeId) {
            Base.setLocalData(address, {
                assetsList: newList,
                totalAssets
            })
            setRequestAssets(true, dispatch)
            setAssetsData(totalAssets, newList, dispatch)
        }
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
    // read from cache if activityList===[]
    const updateHisList = async (activityList, { address, nodeId }) => {
        let tokenList = activityList.map((e) => e.token)
        tokenList = tokenList.filter((e) => !!e)
        await Promise.all(
            tokenList.map((e) => {
                return getPrice(e)
            })
        )
        const price = IotaSDK.priceDic
        const activityData = _get(store, 'common.activityData') || {}
        // if (!activityList || !activityList.length) {
        //     activityList = activityData[address] || []
        // }
        let hisList = []
        const stakeHisList = []
        const isWeb3 = IotaSDK.checkWeb3Node(nodeId)
        const isSMR = IotaSDK.checkSMR(nodeId)
        if (isWeb3) {
            const nodeInfo = IotaSDK.nodes.find((e) => e.id === nodeId)
            activityList.forEach((e) => {
                const { timestamp, transactionHash, token, type, otherAddress, amount, decimal } = e
                const num = new BigNumber(amount).div(Math.pow(10, decimal))
                const assets = num.times(price[token] || 0)
                const obj = {
                    viewUrl: `${nodeInfo.explorer}/tx/${transactionHash}`,
                    id: transactionHash,
                    token,
                    coin: token,
                    timestamp,
                    type,
                    address: otherAddress,
                    num: Base.formatNum(num),
                    decimal: 0,
                    assets: Base.formatNum(assets),
                    amount
                }
                hisList.push(obj)
            })
        } else if (isSMR) {
            const token = IotaSDK.curNode?.token || ''
            const iotaPrice = price ? IotaSDK.priceDic[token] : 0
            const nodeInfo = IotaSDK.nodes.find((e) => e.id === nodeId)
            activityList.forEach((e, i) => {
                const { timestamp, blockId, mergeTransactionId, unlockBlock, decimal, outputs, isSpent, output } = e
                const obj = {
                    viewUrl: `${nodeInfo.explorer}/block/${blockId}`,
                    id: blockId,
                    coin: token,
                    token,
                    timestamp,
                    decimal: decimal || IotaSDK.curNode?.decimal || 0,
                    mergeTransactionId
                }
                const senderPublicKey = unlockBlock?.signature?.publicKey
                const senderAddress = IotaSDK.publicKeyToBech32(senderPublicKey)
                if (isSpent) {
                    //  send
                    const receiverList = outputs.filter((e) =>
                        e.unlockConditions.find(
                            (d) =>
                                d?.address?.pubKeyHash && IotaSDK.hexToBech32(d?.address?.pubKeyHash) !== senderAddress
                        )
                    )
                    const otherOutput = receiverList[0] || {}
                    let otherAddress = (otherOutput?.unlockConditions || []).find((e) => e?.address?.pubKeyHash)
                    otherAddress = otherAddress?.address?.pubKeyHash
                        ? IotaSDK.hexToBech32(otherAddress?.address?.pubKeyHash)
                        : ''
                    Object.assign(obj, {
                        type: 1,
                        num: output?.amount || 0,
                        address: otherAddress,
                        amount: output?.amount || 0
                    })
                } else {
                    // receive
                    Object.assign(obj, {
                        type: 0,
                        num: output?.amount || 0,
                        address: senderAddress,
                        amount: output?.amount || 0
                    })
                }
                // const senderPublicKey = unlockBlock?.signature?.publicKey
                // const senderAddress = IotaSDK.publicKeyToBech32(senderPublicKey)
                // if (senderAddress === address) {
                //     //  send
                //     const receiverList = outputs.filter((e) =>
                //         e.unlockConditions.find(
                //             (d) =>
                //                 d?.address?.pubKeyHash && IotaSDK.hexToBech32(d?.address?.pubKeyHash) !== senderAddress
                //         )
                //     )
                //     const otherOutput = receiverList[receiverList.length-1] || {}
                //     let otherAddress = (otherOutput?.unlockConditions || []).find((e) => e?.address?.pubKeyHash)
                //     otherAddress = IotaSDK.hexToBech32(otherAddress?.address?.pubKeyHash)
                //     Object.assign(obj, {
                //         type: 1,
                //         num: otherOutput?.amount || 0,
                //         address: otherAddress,
                //         amount: otherOutput?.amount || 0
                //     })
                // } else {
                //     // receive
                //     const receiverList = outputs.filter((e) =>
                //         e.unlockConditions.find(
                //             (d) => d?.address?.pubKeyHash && IotaSDK.hexToBech32(d?.address?.pubKeyHash) === address
                //         )
                //     )
                //     const otherOutput = receiverList[receiverList.length-1] || {}
                //     Object.assign(obj, {
                //         type: 0,
                //         num: otherOutput?.amount || 0,
                //         address: senderAddress,
                //         amount: otherOutput?.amount || 0
                //     })
                // }
                const num = new BigNumber(obj.amount || '').div(Math.pow(10, obj.decimal))
                const assets = num.times(iotaPrice)
                hisList.push({
                    ...obj,
                    num: Base.formatNum(num),
                    assets: Base.formatNum(assets)
                })
            })
            // merge start
            const newHisList = {}
            hisList.forEach((e) => {
                const hisData = newHisList[e.mergeTransactionId]
                if (hisData) {
                    const { amount, type, address } = hisData
                    let newAmount = 0
                    if (e.type == type) {
                        newAmount = new BigNumber(amount).plus(e.amount)
                        newHisList[e.mergeTransactionId].amount = Number(newAmount)
                    } else {
                        newAmount = new BigNumber(amount).minus(e.amount)
                        newAmount = Number(newAmount)
                        newHisList[e.mergeTransactionId].type = newAmount > 0 ? type : e.type
                        newHisList[e.mergeTransactionId].amount = Math.abs(newAmount)
                        newHisList[e.mergeTransactionId].address = newAmount > 0 ? address : e.address
                    }
                } else {
                    newHisList[e.mergeTransactionId] = e
                }
            })
            hisList = Object.values(newHisList)
            hisList.forEach((obj) => {
                const num = new BigNumber(obj.amount || '').div(Math.pow(10, obj.decimal))
                const assets = num.times(iotaPrice)
                obj.num = Base.formatNum(num)
                obj.assets = Base.formatNum(assets)
            })
            // merge end
            hisList.sort((a, b) => b.timestamp - a.timestamp)
        } else {
            const token = IotaSDK.curNode?.token || ''
            const iotaPrice = price && nodeId !== 2 ? IotaSDK.priceDic[token] : 0
            const nodeInfo = IotaSDK.nodes.find((e) => e.id === nodeId)
            activityList.forEach((e, i) => {
                let { timestamp, outputs, messageId, payloadIndex, payloadData, decimal, unlockBlock } = e
                const obj = {
                    viewUrl: `${nodeInfo.explorer}/message/${messageId}`,
                    id: messageId,
                    coin: 'Miota',
                    token: 'IOTA',
                    timestamp,
                    decimal: decimal || IotaSDK.curNode?.decimal || 0
                }
                // type：0->receive，1->send，2->stake，3->unstake，4->sign
                // stake
                if (payloadIndex === 'PARTICIPATE') {
                    const amount = outputs[0].amount
                    Object.assign(obj, {
                        type: payloadData?.length ? 2 : 3,
                        num: amount,
                        address,
                        amount
                    })
                    stakeHisList.push({
                        tokens: payloadData,
                        amount: new BigNumber(amount).div(Math.pow(10, decimal)).valueOf(),
                        time: timestamp,
                        address: outputs[0].bech32Address
                    })
                } else if (payloadIndex === 'TanglePay.Sign') {
                    Object.assign(obj, {
                        type: 4,
                        num: 0,
                        address,
                        amount: 0
                    })
                } else if (unlockBlock) {
                    const unlockAddress = IotaSDK.publicKeyToBech32(unlockBlock?.signature?.publicKey)
                    if (unlockAddress === address) {
                        let filterOutputs = outputs.filter((e) => e.bech32Address !== unlockAddress)
                        if (filterOutputs.length === 0) {
                            Object.assign(obj, {
                                type: 0,
                                num: 0,
                                address: address,
                                amount: 0
                            })
                        } else {
                            Object.assign(obj, {
                                type: 1,
                                num: filterOutputs[0]?.amount || 0,
                                address: filterOutputs[0]?.bech32Address,
                                amount: filterOutputs[0]?.amount || 0
                            })
                        }
                    } else {
                        let filterOutputs = outputs.filter((e) => e.bech32Address === address)
                        if (filterOutputs.length === 0) {
                            Object.assign(obj, {
                                type: 0,
                                num: 0,
                                address: unlockAddress,
                                amount: 0
                            })
                        } else {
                            Object.assign(obj, {
                                type: 0,
                                num: filterOutputs[0]?.amount || 0,
                                address: unlockAddress,
                                amount: filterOutputs[0]?.amount || 0
                            })
                        }
                    }
                }
                const num = new BigNumber(obj.amount || '').div(Math.pow(10, obj.decimal))
                const assets = num.times(iotaPrice)
                // if (!(payloadIndex === 'TanglePay' && payloadData?.collection == 1)) {
                hisList.push({
                    ...obj,
                    num: Base.formatNum(num),
                    assets: Base.formatNum(assets)
                })
                // }
            })
            // const sendList = await IotaSDK.getSendList(address)
            // sendList.forEach((e) => {
            //     const assetsStr = Base.formatNum(new BigNumber(e.num || '').times(iotaPrice))
            //     const numStr = Base.formatNum(e.num)
            //     // refer to local storage if the balance is 0
            //     hisList.push({ ...e, num: numStr, assets: assetsStr })
            // })
            hisList.sort((a, b) => b.timestamp - a.timestamp)
            // need restake status
            let needRestake = false
            for (let k = 0; k < hisList.length; k++) {
                const { type } = hisList[k]
                if (type == 2) {
                    break
                } else if (type != 0) {
                    needRestake = true
                    break
                }
            }
            dispatch({
                type: 'staking.needRestake',
                data: needRestake
            })
        }
        const lastData = hisList[0]
        if (
            Base.globalTemData.isGetMqttMessage &&
            lastData?.type === 0 &&
            lastData?.timestamp &&
            lastData?.address !== address &&
            new Date().getTime() / 1000 - lastData?.timestamp <= 600
        ) {
            // prompt users when receiving transfers from mqtt messages
            Base.globalTemData.isGetMqttMessage = false
            Trace.transaction(
                'receive',
                lastData.id,
                lastData.address,
                address,
                lastData.amount,
                nodeId,
                lastData.token
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
                } else if (preInfo && !tLen) {
                    e.type = 3
                    e.tokens = [...preInfo.tokens]
                } else {
                    e.type = 1
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
    useEffect(async () => {
        setRequestAssets(false, dispatch)
        setRequestHis(false, dispatch)
        setRequestStakeHis(false, dispatch)
        if (!curWallet.seed || curWallet.nodeId !== IotaSDK?.curNode?.id) {
            setRequestAssets(true, dispatch)
            setRequestHis(true, dispatch)
            setRequestStakeHis(true, dispatch)
            setAssetsData({}, [], dispatch)
            dispatch({
                type: 'common.validAddresses',
                data: []
            })
            dispatch({
                type: 'common.hisList',
                data: []
            })
            dispatch({
                type: 'staking.historyList',
                data: []
            })
            dispatch({
                type: 'staking.stakedRewards',
                data: {}
            })
            return
        }
        // if (!price || !price.hasOwnProperty('IOTA')) {
        //     return
        // }
        let newCurWallet = curWallet
        const curAddress = newCurWallet.address
        const cacheValidList = await Base.getLocalData(`valid.addresses.${curAddress}`)
        if (!cacheValidList?.length || !newCurWallet.password) {
            newCurWallet = await IotaSDK.inputPassword(curWallet)
        }
        if (IotaSDK.checkWeb3Node(newCurWallet.nodeId)) {
            IotaSDK?.client?.eth && (IotaSDK.client.eth.defaultAccount = curAddress)
        }
        IotaSDK.getValidAddresses(newCurWallet).then(({ addressList, outputIds, smrOutputIds }) => {
            // if(requestAddress !== newCurWallet.address){
            //     return;
            // }
            //validAddresses
            if (newCurWallet.nodeId == IotaSDK?.curNode?.id) {
                dispatch({
                    type: 'common.validAddresses',
                    data: addressList
                })
            }
            // Sync balance
            IotaSDK.getBalance(newCurWallet, addressList)
                .then((list) => {
                    if (newCurWallet.nodeId == IotaSDK?.curNode?.id) {
                        updateBalance(curAddress, list, newCurWallet.nodeId)
                    }
                })
                .catch(() => {
                    setRequestAssets(true, dispatch)
                    setAssetsData({}, [], dispatch)
                })

            // Sync transaction history
            if (IotaSDK.checkWeb3Node(newCurWallet.nodeId)) {
                IotaSDK.getHisList([], newCurWallet)
                    .then((activityList) => {
                        if (newCurWallet.nodeId == IotaSDK?.curNode?.id) {
                            updateHisList(activityList, newCurWallet)
                        }
                    })
                    .catch(() => {
                        updateHisList([], newCurWallet)
                    })
            } else {
                // IotaSDK.getAllOutputIds(addressList).then((outputList) => {
                IotaSDK.getHisList(outputIds, newCurWallet, smrOutputIds)
                    .then((activityList) => {
                        if (newCurWallet.nodeId == IotaSDK?.curNode?.id) {
                            updateHisList(activityList, newCurWallet)
                        }
                    })
                    .catch(() => {
                        updateHisList([], newCurWallet)
                    })
                // })
                // Sync stake rewards
                IotaSDK.getAddressListRewards(addressList)
                    .then((dic) => {
                        if (newCurWallet.nodeId == IotaSDK?.curNode?.id) {
                            dispatch({
                                type: 'staking.stakedRewards',
                                data: dic
                            })
                        }
                    })
                    .catch(() => {
                        dispatch({
                            type: 'staking.stakedRewards',
                            data: {}
                        })
                    })
            }
        })
    }, [curWallet.address + curWallet.nodeId, store.common.forceRequest])
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

// get wallet info
export const useGetWalletInfo = () => {
    const { store, dispatch } = useContext(StoreContext)
    const validAddresses = _get(store, 'common.validAddresses') || []
    const detailList = _get(store, 'common.detailList') || []
    const detailTotalInfo = _get(store, 'common.detailTotalInfo') || {}
    const [loading, setLoading] = useState(false)
    // const [list, setList] = useState([])
    // const [totalInfo, setTotalInfo] = useState({})
    const getInfo = async () => {
        const client = IotaSDK.client
        if (client) {
            const [arr, total] = await IotaSDK.getWalletInfo(validAddresses)
            // setTotalInfo(total)
            // setList(arr)
            dispatch({
                type: 'common.detailList',
                data: arr
            })
            dispatch({
                type: 'common.detailTotalInfo',
                data: total
            })
            setLoading(false)
        }
    }
    useEffect(() => {
        setLoading(true)
        getInfo()
    }, [JSON.stringify(validAddresses)])
    return [detailList, detailTotalInfo, loading, getInfo]
}

// collect
export const useCollect = () => {
    const { store } = useContext(StoreContext)
    const start = (curWallet, setList) => {
        const validAddresses = _get(store, 'common.validAddresses') || []
        IotaSDK.collectByOutputIds(validAddresses, curWallet, (arr) => {
            setList(arr)
        })
    }
    const stop = () => {
        IotaSDK.stopCollect()
    }
    return [start, stop]
}
