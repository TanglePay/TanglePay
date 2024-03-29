import { Base } from './base'
import Http from './http'
import CryptoJS from 'crypto-js'
let deviceNo = Base.getDeviceNo()
let clientType = Base.getClientType()
const trace = async (url, params) => {
    if (params?.blockChainCode == 1) {
        params.tokenCode = 'MIOTA'
    }
    const disTrace = await Base.getLocalData('common.disTrace')
    if (disTrace == 1) {
        return
    }
    return Http.POST(url, {
        clientType,
        deviceNo,
        isHandlerError: true,
        ...params
    })
}
const TraceMethod = {
    // Trace.login
    login: async () => {
        const res = await trace('method=user.login')
        let token = res?.token || ''
        Http.token = token
        Base.setLocalData('token', token)
    },
    // Trace.CreateWallet
    createWallet: async (walletIdentify, walletName, address, blockChainCode, tokenCode) => {
        trace('method=wallet.create', {
            walletIdentify,
            walletName,
            address: CryptoJS.MD5(address).toString(),
            blockChainCode,
            tokenCode
        })
    },
    //Trace.addAddress
    addAddress: async (walletIdentify, address, blockChainCode, tokenCode) => {
        trace('method=wallet.addAddress', {
            walletIdentify,
            address: CryptoJS.MD5(address).toString(),
            blockChainCode,
            tokenCode
        })
    },
    // Trace.updateAddressAmount
    updateAddressAmount: async (walletIdentify, address, amount, blockChainCode, tokenCode) => {
        const key = `${address}-${blockChainCode}-${tokenCode}`
        const hasAdd = await Base.getLocalData(key)
        if (!hasAdd) {
            await TraceMethod.addAddress(walletIdentify, address, blockChainCode, tokenCode)
            Base.setLocalData(key)
        }
        trace('method=wallet.updateAddressAmount', {
            walletIdentify,
            address: CryptoJS.MD5(address).toString(),
            amount,
            blockChainCode,
            tokenCode
        })
    },
    // Trace.transaction
    transaction: async (type, transactionNum, fromAddress, toAddress, amount, blockChainCode, tokenCode, domain) => {
        trace('method=transaction.create', {
            domain: domain || '',
            type,
            transactionNum,
            fromAddress: CryptoJS.MD5(fromAddress).toString(),
            toAddress: CryptoJS.MD5(toAddress).toString(),
            amount,
            blockChainCode,
            tokenCode
        })
    },
    // Trace.dappConnect
    dappConnect: async (domain, address, blockChainCode, tokenCode) => {
        trace('method=dapp.create', {
            domain,
            address: CryptoJS.MD5(address).toString(),
            blockChainCode,
            tokenCode
        })
    },
    // action logs
    //type: 10.assets, 20.logs, 30.stake, 40.transaction, 50.nft
    actionLog: async (type, address, costTime, language, blockChainCode, tokenCode) => {
        trace('method=actionLog.create', {
            type,
            address: CryptoJS.MD5(address).toString(),
            costTime,
            language: language || 'en',
            blockChainCode,
            tokenCode
        })
    }
}

export default TraceMethod
