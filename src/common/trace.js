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
    // Trace.updateAddressAmount
    updateAddressAmount: async (walletIdentify, address, amount, blockChainCode, tokenCode) => {
        trace('method=wallet.updateAddressAmount', {
            walletIdentify,
            address: CryptoJS.MD5(address).toString(),
            amount,
            blockChainCode,
            tokenCode
        })
    },
    // Trace.transaction
    transaction: async (type, transactionNum, fromAddress, toAddress, amount, blockChainCode, tokenCode) => {
        trace('method=transaction.create', {
            type,
            transactionNum,
            fromAddress: CryptoJS.MD5(fromAddress).toString(),
            toAddress: CryptoJS.MD5(toAddress).toString(),
            amount,
            blockChainCode,
            tokenCode
        })
    }
}

export default TraceMethod
