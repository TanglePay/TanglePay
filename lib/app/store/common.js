import { useContext, useEffect, useState } from 'react'
import { Base, IotaSDK, I18n, Http, Trace } from '../common'
import _get from 'lodash/get'
import { StoreContext } from './context'
import BigNumber from 'bignumber.js'
import { init } from '../domain'
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
    detailTotalInfo: {},
    biometrics: false, //for mobile open bio or not
    pwdInput: false, // Whether the password has been entered
    bioPrompt: false,
    unlockConditions: [], // receive
    unlockConditionsSend: [], // send

    lockedList: [],

    checkClaim: false,

    isPinSet: false, // user if set pin yet
    pinHash: undefined,
    canShowDappDialog: false
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
                return state
            }
            const saveFunc = Base.isBrowser ? 'setLocalData' : 'setSensitiveInfo'
            Base[saveFunc]('common.activityData', data)
            break
        case 'walletsList': {
            // let list = (data || []).filter((e) => e?.bech32HRP !== 'atoi')
            let list = data || []
            list = list.map((e) => {
                if (!e.nodeId) {
                    e.nodeId = IotaSDK.nodes.find((d) => d?.bech32HRP === e?.bech32HRP)?.id
                }
                return e
            })
            let localList = list.map((e) => {
                return { ...e, password: e.password ? `password_${e.address}` : undefined }
            })
            setTimeout(() => {
                init(localList.length).catch((e) => console.log(e))
            }, 100)
            const saveFunc = Base.isBrowser ? 'setLocalData' : 'setSensitiveInfo'
            Base[saveFunc]('common.walletsList', localList)
            return { ...state, [type]: localList }
        }
        case 'disTrace': {
            Base.setLocalData('common.disTrace', data)
            return { ...state, [type]: data }
        }
        case 'biometrics': {
            Base.setLocalData('common.biometrics', !!data)
            break
        }
        case 'pwdInput': {
            Base.setLocalData('common.pwdInput', !!data)
            break
        }
        case 'bioPrompt':
            if (Base.isBrowser) {
            } else {
                if (!data) {
                    data = false
                }
                Base.setLocalData('common.bioPrompt', data)
            }
            break
        case 'curPwd':
            if (Base.isBrowser) {
            } else {
                // Base.setLocalData('common.curPwd', !!data)
            }
            break
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
    const updateUnlockConditions = useUpdateUnlockConditions()
    const selectWallet = async (id) => {
        let walletsList = _get(store, 'common.walletsList')
        const curWallet = walletsList.find((e) => e.id === id)
        if (IotaSDK.curNode?.id != curWallet?.nodeId) {
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
            updateUnlockConditions([], curWallet)
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
                if (e.isSelected && e.nodeId != id) {
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
    let curWallet = walletsList.find((e) => e.isSelected && e.nodeId == curNodeId) || {}
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
        if (res?.status == 1000) {
            IotaSDK.priceDic[code] = 0
        } else {
            IotaSDK.priceDic[code] = res
        }
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
        const newList = list.map(({ available, realAvailable, realBalance, token, contract, balance, decimal, isSMRToken, tokenId, logoUrl, standard }) => {
            const price = IotaSDK.priceDic[token]
            const assets = price && curNodeId != 2 ? BigNumber(balance).times(price || 0) : 0
            total = total.plus(assets)
            const isSMR = IotaSDK.checkSMR(curNodeId)
            return {
                decimal,
                balance: Base.formatNum(balance),
                realBalance: Number(realBalance),
                // unit: IotaSDK.checkIota(curNodeId) ? 'Mi' : isSMR && !isSMRToken ? 'SMR' : '',
                unit: IotaSDK.checkIota(curNodeId) ? 'Mi' : isSMR && !isSMRToken && !IotaSDK.isIotaStardust(curNodeId) ? 'SMR' : '',
                name: token,
                contract,
                assets: Base.formatNum(assets),
                isSMRToken,
                tokenId,
                available: Base.formatNum(available),
                realAvailable: Number(realAvailable),
                logoUrl,
                standard
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
        } else {
            setAssetsData({}, [], dispatch)
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
        const nowTime = parseInt(new Date().getTime() / 1000)
        if (isWeb3) {
            const nodeInfo = IotaSDK.nodes.find((e) => e.id == nodeId)
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
                    contractDetail: e.contractDetail ? {
                        ...e.contractDetail,
                        assets: Base.formatNum(new BigNumber(e.contractDetail.value).times(price[e.contractDetail.unit] || 0))
                    }: null,
                    assets: Base.formatNum(assets),
                    amount,
                    unit: ''
                }
                hisList.push(obj)
            })
        } else if (isSMR) {
            let validAddressList = (await Base.getLocalData(`valid.addresses.${address}`)) || [address]
            validAddressList = validAddressList?.length > 0 ? validAddressList : [address]
            activityList = activityList.filter((e) => {
                let unlock = e.output.unlockConditions.find((d) => d.type != 0)
                //TIMELOCK_UNLOCK_CONDITION_TYPE、EXPIRATION_UNLOCK_CONDITION_TYPE
                if (unlock && ((unlock.type == 2 && nowTime > unlock.unixTime) || (unlock.type == 3 && nowTime > unlock.unixTime))) {
                    e.timestamp = unlock.unixTime
                    unlock = null
                }
                return !(!e.outputSpent && unlock)
            })

            const token = IotaSDK.curNode?.token || ''
            await getPrice(token)
            const iotaPrice = price ? IotaSDK.priceDic[token] : 0
            const nodeInfo = IotaSDK.nodes.find((e) => e.id == nodeId)

            // token info start
            const tokenIds = []
            activityList.forEach((e) => {
                ;(e.outputs || []).forEach((d) => {
                    ;(d.nativeTokens || []).forEach((g) => {
                        if (!tokenIds.includes(g.id)) {
                            tokenIds.push(g.id)
                        }
                    })
                })
            })
            const foundryList = await Promise.all(tokenIds.map((e) => IotaSDK.foundry(e)))
            const tokenDic = {}
            tokenIds.forEach((e, i) => {
                let { decimals, symbol, logoUrl } = IotaSDK.handleFoundry(foundryList[i])
                symbol = (symbol || '').toLocaleUpperCase()
                tokenDic[e] = { decimals, symbol, logoUrl }
            })
            // token info end
            // let originalMergeTransaction = {}
            let tokenMergeTransactionIds = []
            activityList.forEach((e, i) => {
                const { timestamp, blockId, outputBlockId, mergeTransactionId, unlockBlock, decimal, outputs, outputSpent, output, payloadData } = e
                let isSpent = e.isSpent
                let unlockConditions = []
                outputs.forEach((e) => {
                    unlockConditions = [...unlockConditions, ...(e.unlockConditions || [])]
                })
                const obj = {
                    viewUrl: outputSpent ? `${nodeInfo.explorer}/transaction/${blockId}` : `${nodeInfo.explorer}/block/${blockId}`,
                    id: blockId,
                    coin: IotaSDK.isIotaStardust(nodeId) ? 'IOTA' : 'SMR',
                    token,
                    timestamp,
                    decimal: decimal || IotaSDK.curNode?.decimal || 0,
                    mergeTransactionId,
                    unit: '',
                    isSpent,
                    payloadData,
                    unlockConditions
                }
                if ((output?.unlockConditions || []).find((d) => d.type == 2 || d.type == 3)) {
                    obj.mergeTransactionId = `${obj.mergeTransactionId}_time`
                }
                obj.unlockConditions = obj.unlockConditions.slice(0, 100)
                const senderPublicKey = unlockBlock?.signature?.publicKey
                const senderAddress = IotaSDK.publicKeyToBech32(senderPublicKey)
                // type：0->receive, 1->send, 2->stake, 3->unstake, 4->sign, 5->receive smr token, 6->send smr token, 7->receive smr nft, 8->send smr nft,
                if (isSpent) {
                    //  send
                    // let otherAddress = ''
                    // outputs.forEach((e) => {
                    //     e.unlockConditions.forEach((d) => {
                    //         let pubKeyHash = d?.address?.pubKeyHash || d?.returnAddress?.pubKeyHash
                    //         pubKeyHash = pubKeyHash ? IotaSDK.hexToBech32(pubKeyHash) : ''
                    //         if (pubKeyHash && pubKeyHash !== senderAddress && !otherAddress) {
                    //             otherAddress = pubKeyHash
                    //         }
                    //     })
                    // })
                    // if (!otherAddress) {
                    //     otherAddress = senderAddress
                    // }

                    Object.assign(obj, {
                        type: 1,
                        num: output?.amount || 0,
                        address: senderAddress,
                        amount: output?.amount || 0
                    })
                } else {
                    // receive
                    // let otherAddress = senderAddress
                    // if (validAddressList.includes(senderAddress)) {
                    //     outputs.forEach((e) => {
                    //         e.unlockConditions.forEach((d) => {
                    //             let pubKeyHash = d?.address?.pubKeyHash || d?.returnAddress?.pubKeyHash
                    //             pubKeyHash = pubKeyHash ? IotaSDK.hexToBech32(pubKeyHash) : ''
                    //             if (pubKeyHash && pubKeyHash !== senderAddress && !otherAddress) {
                    //                 otherAddress = pubKeyHash
                    //             }
                    //         })
                    //     })
                    // }

                    Object.assign(obj, {
                        type: 0,
                        num: output?.amount || 0,
                        address: senderAddress,
                        amount: output?.amount || 0
                    })
                }
                // shimmer token
                const isToken = e.output?.nativeTokens && e.output?.nativeTokens?.length
                let newObj = null
                if (isToken) {
                    newObj = JSON.parse(JSON.stringify(obj))
                    let num = BigNumber(output?.nativeTokens?.[0]?.amount || 0)
                    num = Number(num)
                    const id = output?.nativeTokens?.[0]?.id || ''
                    const symbol = tokenDic[id]?.symbol || ''
                    const decimals = tokenDic[id]?.decimals || 0
                    Object.assign(newObj, {
                        type: newObj.type == 0 ? 5 : 6,
                        num,
                        amount: num,
                        coin: symbol,
                        token: symbol,
                        decimal: decimals,
                        mergeTransactionId: `${newObj.mergeTransactionId}_${id}`
                        // originalMergeTransactionId:mergeTransactionId,
                    })
                    tokenMergeTransactionIds.push(mergeTransactionId)
                    // if(obj.type == 6){
                    //     originalMergeTransaction[mergeTransactionId] = true
                    // }
                }

                // shimmer nft
                const isNft = !!e.output?.nftId
                if (isNft) {
                    let info = (e?.output?.immutableFeatures || []).find((d) => {
                        return d.type == 2
                    })
                    if (info && info.data) {
                        newObj = JSON.parse(JSON.stringify(obj))
                        try {
                            info = IotaSDK.hexToUtf8(info.data)
                            info = JSON.parse(info)
                            let num = 1
                            const symbol = info.name
                            const decimals = 0
                            Object.assign(newObj, {
                                type: newObj.type == 0 ? 7 : 8,
                                num,
                                amount: num,
                                coin: symbol,
                                token: symbol,
                                decimal: decimals,
                                mergeTransactionId: `${mergeTransactionId}_nft`
                            })
                            tokenMergeTransactionIds.push(mergeTransactionId)
                        } catch (error) {
                            console.log(error)
                            newObj = null
                        }
                    }
                }

                if (newObj) {
                    hisList.push({
                        ...newObj
                    })
                } else {
                    hisList.push({
                        ...obj
                    })
                }
            })
            // merge start
            const newHisList = {}
            hisList.forEach((e) => {
                // if(!originalMergeTransaction[e.mergeTransactionId]){
                if (!tokenMergeTransactionIds.includes(e.mergeTransactionId)) {
                    const hisData = newHisList[e.mergeTransactionId]
                    if (hisData) {
                        let { amount, type, unlockConditions } = hisData
                        unlockConditions = unlockConditions || []
                        let newAmount = 0
                        if (e.type == type) {
                            newAmount = new BigNumber(amount).plus(e.amount)
                            newHisList[e.mergeTransactionId].amount = Number(newAmount)
                            // newHisList[e.mergeTransactionId].payloadData = e.payloadData
                        } else {
                            newAmount = new BigNumber(amount).minus(e.amount)
                            newAmount = Number(newAmount)
                            newHisList[e.mergeTransactionId].type = newAmount > 0 ? type : e.type
                            newHisList[e.mergeTransactionId].amount = Math.abs(newAmount)
                            newHisList[e.mergeTransactionId].payloadData = newAmount > 0 ? hisData.payloadData : e.payloadData
                        }
                        newHisList[e.mergeTransactionId].unlockConditions = [...(newHisList[e.mergeTransactionId].unlockConditions || []), ...unlockConditions]
                        newHisList[e.mergeTransactionId].unlockConditions = newHisList[e.mergeTransactionId].unlockConditions.slice(0, 100)
                    } else {
                        newHisList[e.mergeTransactionId] = { ...e }
                    }
                }
                // }
            })
            hisList = Object.values(newHisList)
            hisList.forEach((e) => {
                const { unlockConditions } = e
                let otherAddress = ''
                unlockConditions.forEach((d) => {
                    let pubKeyHash = d?.address?.pubKeyHash || d?.returnAddress?.pubKeyHash
                    pubKeyHash = pubKeyHash ? IotaSDK.hexToBech32(pubKeyHash) : ''
                    if (pubKeyHash && !validAddressList.includes(pubKeyHash) && !otherAddress) {
                        otherAddress = pubKeyHash
                    }
                })
                if (otherAddress) {
                    e.address = otherAddress
                }
            })
            // log(hisList)
            hisList.forEach((e) => {
                if (validAddressList.includes(e.address)) {
                    const { to, from } = e.payloadData || {}
                    if ([0, 5, 7].includes(e.type)) {
                        if (to && from) {
                            e.type = e.type + 1
                            e.address = from
                        }
                    } else {
                        if (to && from) {
                            e.type = e.type - 1
                            e.address = to
                        }
                    }
                }
            })
            hisList = hisList.filter((e) => Number(e.amount) > 0)
            hisList.forEach((obj) => {
                const num = new BigNumber(obj.amount || '').div(Math.pow(10, obj.decimal))
                const iotaPrice = price ? IotaSDK.priceDic[obj.token || obj.token.toLocaleUpperCase()] : 0
                const assets = num.times(iotaPrice)
                obj.num = Base.formatNum(num)
                obj.assets = Base.formatNum(assets)
            })
            // merge end
            hisList.sort((a, b) => b.timestamp - a.timestamp)

            // adjust id using objectHash
            hisList.forEach((e) => {
                e.id = e.coin == 'SOON' ? IotaSDK.objectHash(e) : e.id
            })
        } else {
            const token = IotaSDK.curNode?.token || ''
            const iotaPrice = price && nodeId != 2 ? IotaSDK.priceDic[token] : 0
            const nodeInfo = IotaSDK.nodes.find((e) => e.id == nodeId)
            activityList.forEach((e, i) => {
                let { timestamp, outputs, messageId, payloadIndex, payloadData, decimal, unlockBlock } = e
                const obj = {
                    viewUrl: `${nodeInfo.explorer}/message/${messageId}`,
                    id: messageId,
                    coin: 'Miota',
                    token: 'IOTA',
                    timestamp,
                    decimal: decimal || IotaSDK.curNode?.decimal || 0,
                    unit: 'Mi'
                }
                // type：0->receive, 1->send, 2->stake, 3->unstake, 4->sign, 5->receive smr token, 6->send smr token,
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

        if (lastData?.timestamp && new Date().getTime() / 1000 - lastData?.timestamp <= 600) {
            let localTipsData = await Base.getLocalData('localTipsData')
            localTipsData = localTipsData || {}
            if (!localTipsData?.[lastData.id] && lastData.num > 0) {
                if (lastData?.type == 0 || lastData?.type === 5) {
                    const str = I18n.t('assets.receivedSucc')
                        .replace('{num}', lastData.num)
                        .replace('{unit}', lastData.unit || '')
                        .replace('{token}', lastData.token)
                    Base.globalToast.success(str)
                }
                localTipsData[lastData.id] = 1
                Base.setLocalData('localTipsData', localTipsData)

                Trace.transaction('receive', lastData.id, lastData.address, address, lastData.amount, nodeId, lastData.token)
            }
        }
        dispatch({
            type: 'common.activityData',
            data: { ...activityData, [address]: [...activityList] }
        })
        const curAddressHis = (await Base.getLocalData(`${nodeId}.${address}.common.hisListv3`)) || []
        const localHis = [...curAddressHis]
        if (hisList.length > 0) {
            hisList.forEach((e) => {
                const index = localHis.findIndex((d) => d.id == e.id)
                if (index === -1) {
                    localHis.push(e)
                } else if(e.contractDetail) {
                    localHis[index] = e
                }
            })
            localHis.sort((a, b) => b.timestamp - a.timestamp)
            Base.setLocalData(`${nodeId}.${address}.common.hisListv3`, localHis)
        }
        dispatch({
            type: 'common.hisList',
            data: localHis
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
            if (stakeHisList.length > 0) {
                Base.setLocalData(`${nodeId}.${address}.staking.historyList`, stakeHisList)
            }
            setRequestStakeHis(true, dispatch)
        })
        // stake end

        setRequestHis(true, dispatch)
    }
    return updateHisList
}

export const useHandleUnlocalConditions = () => {
    const { store, dispatch } = useContext(StoreContext)
    const onDismiss = async (blockId) => {
        let unlockConditionsList = _get(store, 'common.unlockConditions')
        const localDismissList = (await Base.getLocalData('common.unlockConditions.dismiss')) || []
        localDismissList.push(blockId)
        unlockConditionsList = unlockConditionsList.filter((e) => !localDismissList.includes(e.blockId))
        Base.setLocalData('common.unlockConditions.dismiss', localDismissList)
        dispatch({
            type: 'common.unlockConditions',
            data: unlockConditionsList
        })
    }
    const onAccept = async (item) => {
        const res = await IotaSDK.SMRUNlock(item)
        return res
    }
    const onDismissNft = async (nftId) => {
        let unlockConditionsList = _get(store, 'nft.unlockList')
        const localDismissList = (await Base.getLocalData('nft.unlockList.dismiss')) || []
        localDismissList.push(nftId)
        unlockConditionsList = unlockConditionsList.filter((e) => !localDismissList.includes(e.nftId))
        Base.setLocalData('nft.unlockList.dismiss', localDismissList)
        dispatch({
            type: 'nft.unlockList',
            data: unlockConditionsList
        })
    }
    const onAcceptNft = async (item) => {
        const res = await IotaSDK.SMRUNlockNft(item)
        return res
    }
    return { onDismiss, onAccept, onDismissNft, onAcceptNft }
}
const useUpdateUnlockConditions = () => {
    const { store, dispatch } = useContext(StoreContext)
    const updateUnlockConditions = async (outputDatas, { nodeId, address }) => {
        if (IotaSDK.checkSMR(nodeId)) {
            outputDatas = outputDatas.filter((e) => {
                return (e.output?.unlockConditions || []).find((g) => g.type != 0)
            })
            // filter out groupfi
            outputDatas = outputDatas.filter((e) => {
                const tagFeature = (e.output?.features || []).find((g) => g.type == 3)
                if (tagFeature) {
                    const tag = IotaSDK.hexToUtf8(tagFeature.tag)
                    if (tag && tag.startsWith('GROUPFI')) {
                        return false
                    }
                }
                return true
            })
            let unlockConditionsList = []
            let lockedListArr = []
            const nowTime = parseInt(new Date().getTime() / 1000)
            const transactionIds = {}
            const tokenIds = []
            outputDatas.forEach((e) => {
                ;(e.output?.nativeTokens || []).forEach((d) => {
                    if (!tokenIds.includes(d.id)) {
                        tokenIds.push(d.id)
                    }
                })
            })
            const foundryList = await Promise.all(tokenIds.map((e) => IotaSDK.foundry(e)))
            const foundryDataList = {}
            tokenIds.forEach((e, i) => {
                foundryDataList[e] = IotaSDK.handleFoundry(foundryList[i])
            })
            outputDatas.forEach(async (e) => {
                let token = IotaSDK.curNode.token
                let standard = ''
                let deposit = 0
                let depositStr = ''
                let assetsId = ''
                let logoUrl = Base.getIcon(token)
                let decimal = IotaSDK.curNode.decimal
                const { outputIndex, blockId, transactionId } = e.metadata
                const output = e.output
                if (transactionIds[transactionId]) {
                    return
                }
                const nativeTokens = output.nativeTokens || []
                const unlockConditions = output.unlockConditions || []
                const timeConditions = unlockConditions.find((e) => e.type == 3 || e.type == 2)
                const unixTime = timeConditions?.unixTime
                if (!unixTime || unixTime > nowTime) {
                    //STORAGE_DEPOSIT_RETURN_UNLOCK_CONDITION_TYPE
                    const smrUnlockConditionAmount = unlockConditions.find((e) => e.type == 1 && e.amount)?.amount
                    let amount = output.amount
                    if (nativeTokens.length > 0) {
                        const tokenData = nativeTokens[0]
                        assetsId = tokenData.id
                        const foundryData = foundryDataList[assetsId] || {}
                        amount = Number(tokenData.amount)
                        token = (foundryData.symbol || '').toLocaleUpperCase()
                        deposit = output.amount
                        depositStr = Number(BigNumber(deposit).div(Math.pow(10, decimal)))
                        decimal = foundryData.decimals
                        standard = foundryData.standard
                        logoUrl = foundryData.logoUrl || Base.getIcon(assetsId) || ''
                    } else if (smrUnlockConditionAmount) {
                        amount = BigNumber(amount).minus(smrUnlockConditionAmount).valueOf()
                    }

                    transactionIds[transactionId] = 1
                    let unlockAddress = address
                    // if (unlockBlock) {
                    //     unlockAddress = IotaSDK.publicKeyToBech32(unlockBlock?.signature?.publicKey)
                    // }
                    unlockConditions.map((d) => {
                        let pubKeyHash = d.address?.pubKeyHash || d.returnAddress?.pubKeyHash || ''
                        if (pubKeyHash) {
                            pubKeyHash = IotaSDK.hexToBech32(pubKeyHash)
                        }
                        if (pubKeyHash && pubKeyHash !== address) {
                            unlockAddress = pubKeyHash
                        }
                        return {
                            ...d,
                            bech32Address: pubKeyHash
                        }
                    })
                    let timeStr = Base.getTimeStr(unixTime, nowTime)
                    const amountStr = BigNumber(amount).div(Math.pow(10, decimal))
                    const objData = {
                        transactionId,
                        transactionOutputIndex: outputIndex,
                        token,
                        blockId,
                        timeStr,
                        // unlockBlock,
                        amount,
                        amountStr: parseFloat(amountStr),
                        unlockAddress,
                        unlockConditions,
                        output,
                        assetsId,
                        deposit,
                        depositStr,
                        standard,
                        logoUrl
                    }
                    if (timeConditions?.type == 2) {
                        lockedListArr.push(objData)
                    } else {
                        unlockConditionsList.push(objData)
                    }
                }
            })
            const localDismissList = (await Base.getLocalData('common.unlockConditions.dismiss')) || []
            unlockConditionsList = unlockConditionsList.filter((e) => !localDismissList.includes(e.blockId))
            // const unlockConditionsSendList = unlockConditionsList.filter((e) => e.unlockAddress == address)
            const arr = unlockConditionsList.filter((e) => e.unlockAddress != address)
            dispatch({
                type: 'common.unlockConditions',
                data: arr
            })
            if (arr.length > 0) {
                Base.setLocalData(`${nodeId}.${address}.common.unlockConditions`, arr)
            }
            dispatch({
                type: 'common.unlockConditionsSend',
                data: []
            })
            dispatch({
                type: 'common.lockedList',
                data: lockedListArr
            })
            if (lockedListArr.length > 0) {
                Base.setLocalData(`${nodeId}.${address}.common.lockedList`, lockedListArr)
            }
        } else {
            dispatch({
                type: 'common.unlockConditions',
                data: []
            })
            dispatch({
                type: 'common.unlockConditionsSend',
                data: []
            })
            dispatch({
                type: 'common.lockedList',
                data: []
            })
        }
    }
    return updateUnlockConditions
}

// Asset list only supports IOTA，data structure includes balance, transaction history
export const useGetAssetsList = (curWallet) => {
    const { store, dispatch } = useContext(StoreContext)
    const updateBalance = useUpdateBalance()
    const updateHisList = useUpdateHisList()
    const updateUnlockConditions = useUpdateUnlockConditions()
    useEffect(() => {
        const asyncFunc = async () => {
            setRequestAssets(false, dispatch)
            setRequestHis(false, dispatch)
            setRequestStakeHis(false, dispatch)
            if (!curWallet.seed || curWallet.nodeId != IotaSDK?.curNode?.id) {
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
                dispatch({
                    type: 'common.checkClaim',
                    data: false
                })
                dispatch({
                    type: 'common.lockedList',
                    data: []
                })
                dispatch({
                    type: 'common.unlockConditions',
                    data: []
                })
                return
            }

            // get cache data start
            const dispatchCache = async (key, defaultData) => {
                const curKey = `${curWallet.nodeId}.${curWallet.address}.${key}`
                const localData = (await Base.getLocalData(curKey)) || defaultData
                dispatch({
                    type: key,
                    data: localData
                })
            }
            dispatchCache('common.validAddresses', [])
            dispatchCache('common.hisList', [])
            dispatchCache('staking.historyList', [])
            dispatchCache('staking.stakedRewards', {})
            dispatchCache('common.checkClaim', false)
            dispatchCache('common.lockedList', [])
            dispatchCache('common.unlockConditions', [])
            // get cache dta end

            // if (!price || !price.hasOwnProperty('IOTA')) {
            //     return
            // }
            let newCurWallet = curWallet
            const curAddress = newCurWallet.address
            // const cacheValidList = await Base.getLocalData(`${curWallet.nodeId}.${curWallet.address}.common.validAddresses`)
            if (!newCurWallet.password) {
                newCurWallet = await IotaSDK.inputPassword(curWallet)
            }
            if (IotaSDK.checkWeb3Node(newCurWallet.nodeId)) {
                IotaSDK?.client?.eth && (IotaSDK.client.eth.defaultAccount = curAddress)
            }
            setRequestHis(false, dispatch)
            IotaSDK.getValidAddresses(newCurWallet).then(({ addressList, outputIds, smrOutputIds, requestAddress }) => {
                if (requestAddress !== newCurWallet.address) {
                    return
                }
                //validAddresses
                if (newCurWallet.nodeId == IotaSDK?.curNode?.id) {
                    dispatch({
                        type: 'common.validAddresses',
                        data: addressList
                    })
                    if (addressList.length > 0) {
                        Base.setLocalData(`${newCurWallet.nodeId}.${newCurWallet.address}.common.validAddresses`, addressList)
                    }
                }
                // Sync balance
                IotaSDK.getBalance(newCurWallet, addressList)
                    .then((list) => {
                        if (newCurWallet.nodeId == IotaSDK?.curNode?.id) {
                            updateBalance(curAddress, list, newCurWallet.nodeId)
                        } else {
                            setRequestAssets(true, dispatch)
                            setAssetsData({}, [], dispatch)
                        }
                    })
                    .catch(() => {
                        setRequestAssets(true, dispatch)
                        setAssetsData({}, [], dispatch)
                        Base.globalToast.show(I18n.t('assets.getAssetsFail'))
                    })

                // unlock
                if (IotaSDK.checkSMR(newCurWallet.nodeId)) {
                    IotaSDK.getUnlockOutputData(addressList).then(({ outputDatas }) => {
                        updateUnlockConditions(outputDatas, newCurWallet)
                    })
                } else {
                    updateUnlockConditions([], newCurWallet)
                }

                //checkClaim
                // IotaSDK.checkClaimSMR(newCurWallet)
                //     .then((res) => {
                //         dispatch({
                //             type: 'common.checkClaim',
                //             data: res
                //         })
                //     })
                //     .catch((err) => {
                //         dispatch({
                //             type: 'common.checkClaim',
                //             data: false
                //         })
                //     })

                // Sync transaction history
                setRequestHis(false, dispatch)
                if (IotaSDK.checkWeb3Node(newCurWallet.nodeId)) {
                    IotaSDK.getHisList([], newCurWallet)
                        .then((activityList) => {
                            if (newCurWallet.nodeId == IotaSDK?.curNode?.id) {
                                updateHisList(activityList, newCurWallet)
                            }
                        })
                        .catch(() => {
                            // updateHisList([], newCurWallet)
                            // Base.globalToast.show(I18n.t('assets.getActivityFail'))
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
                            // updateHisList([], newCurWallet)
                            // Base.globalToast.show(I18n.t('assets.getActivityFail'))
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
        }
        asyncFunc()
    }, [curWallet.address + curWallet.nodeId, store.common.forceRequest])
}

// Display devnet url when it is being selected
export const useCreateCheck = (callBack) => {
    const { store } = useContext(StoreContext)
    const [, canUseWalletsList] = useGetNodeWallet()
    const curNodeId = _get(store, 'common.curNodeId')
    useEffect(() => {
        let len = canUseWalletsList.length || 0
        callBack && callBack(`account ${len + 1}`)
    }, [canUseWalletsList])
    useEffect(() => {
        if (curNodeId == 2) {
            const nodeUrl = (IotaSDK.nodes.find((e) => e.id == curNodeId) || {}).url
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
