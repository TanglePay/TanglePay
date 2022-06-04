import { MqttClient } from '@iota/mqtt.js'
import I18n from '../lang'
import { Base } from '../base'
import Http, { API_URL } from '../http'
import Trace from '../trace'
import _sumBy from 'lodash/sumBy'
import _get from 'lodash/get'
import _debounce from 'lodash/debounce'
import CryptoJS from 'crypto-js'
import Iota from './iota'
import _chunk from 'lodash/chunk'
import BigNumber from 'bignumber.js'
import { convertUnits } from '@iota/unit-converter'
import _uniqWith from 'lodash/uniqWith'
import _isEqual from 'lodash/isEqual'
import { Soon } from 'soonaverse'
import _flatten from 'lodash/flatten'
import Web3 from 'web3'
import * as Web3Bip39 from 'bip39'
import { hdkey as ethereumjsHdkey } from 'ethereumjs-wallet'
import * as ethereumjsUtils from 'ethereumjs-util'
const tokenAbi = require('./TokenERC20.json')

const soon = new Soon(true)
const {
    Bech32Helper,
    Bip32Path,
    Bip39,
    Converter,
    Ed25519Address,
    Ed25519Seed,
    ED25519_ADDRESS_TYPE,
    generateBip44Address,
    SingleNodeClient,
    sendMultiple,
    Ed25519
} = Iota
const IotaSDK = {
    IOTA_MI: 1000000, // 1mi = 1000000i
    convertUnits(value, fromUnit, toUnit) {
        return convertUnits(value, fromUnit, toUnit)
    },
    // type:1.iota, 2.web3,
    // filterMenuList:['assets','apps','staking','me']
    // filterAssetsList: ['stake', 'soonaverse']
    _nodes: [
        {
            id: 1,
            url: 'https://chrysalis-nodes.iota.org',
            explorer: 'https://thetangle.org',
            name: 'IOTA Mainnet',
            enName: 'IOTA Mainnet',
            deName: 'IOTA Mainnet',
            zhName: 'IOTA 主網',
            type: 1,
            mqtt: 'wss://chrysalis-nodes.iota.org:443/mqtt',
            network: 'mainnet',
            bech32HRP: 'iota',
            token: 'IOTA',
            filterMenuList: [],
            filterAssetsList: [],
            decimal: 6
        }
        // {
        //     id: 2,
        //     url: 'https://api.lb-0.h.chrysalis-devnet.iota.cafe',
        //     name: I18n.t('account.devnet'),
        //     type: 1,
        //     mqtt: 'wss://api.lb-0.h.chrysalis-devnet.iota.cafe:443/mqtt',
        //     network: 'devnet',
        //     bech32HRP: 'atoi',
        //     token: 'IOTA',
        //     filterMenuList: [],
        //     filterAssetsList: [],
        //     decimal: 6
        // },
        // {
        //     "id": 5,
        //     "url": "https://evm.wasp.sc.iota.org/",
        //     "explorer": "https://explorer.wasp.sc.iota.org",
        //     "name": "IOTA EVM",
        //     "enName": "IOTA EVM",
        //     "deName": "IOTA EVM",
        //     "zhName": "IOTA EVM",
        //     "type": 2,
        //     "network": "iota-evm",
        //     "bech32HRP": "iota",
        //     "token": "IOTA",
        //     "filterMenuList": ["apps", "staking"],
        //     "filterAssetsList": ["stake", "soonaverse"],
        //     "contractList": [
        //         {
        //             "contract": "0x903fE58170A44CF0D0eb5900d26cDedEA802635C",
        //             "token": "TPT",
        //             "gasLimit": 0,
        //             "maxPriorityFeePerGas": 0,
        //             "isShowZero":true
        //         }
        //     ],
        //     "decimal": 18,
        //     "gasLimit": 0
        // }
    ],
    get nodes() {
        return this._nodes
    },
    _contracAssetsShowDic: {},
    get contracAssetsShowDic() {
        return this._contracAssetsShowDic
    },
    changeNodesLang(lang) {
        this._nodes.forEach((e) => {
            e.name = e[`${lang}Name`]
        })
    },
    get mnemonicLen() {
        return this.isWeb3Node ? 12 : 24
    },
    async getNodes() {
        let res = await fetch(`${API_URL}/evm.json?v=${new Date().getTime()}`)
        res = await res.json()
        const _nodes = this._nodes
        res.forEach((e) => {
            if (_nodes.find((d) => d.id !== e.id)) {
                _nodes.push(e)
            }
            e.contractList.forEach((d) => {
                if (d.isShowZero) {
                    this._contracAssetsShowDic[d.contract] = true
                }
            })
        })
        this._nodes = _nodes
    },
    hasStake(nodeId) {
        return !(this.nodes.find((e) => e.id === nodeId)?.filterAssetsList || []).includes('stake')
    },
    // token price
    priceDic: {},
    explorerApiUrl: 'https://explorer-api.iota.org',
    async init(id) {
        Base.globalToast.showLoading()
        try {
            const curNode = this.nodes.find((e) => e.id === id) || this.nodes[0]
            this.curNode = curNode
            if (this.web3Subscription) {
                clearTimeout(this.web3Subscription)
                this.web3Subscription = null
            }
            if (this.mqttClient && this.subscriptionId) {
                this.mqttClient.unsubscribe(this.subscriptionId)
                this.subscriptionId = null
            }
            if (this.isWeb3Node) {
                this.client = new Web3(curNode.url)
                this.info = this.client
                window.xxxx = this.client
            } else {
                this.client = new SingleNodeClient(curNode.url)
                this.info = await this.client.info()
                this.mqttClient = new MqttClient(curNode.mqtt)
            }
            Base.globalToast.hideLoading()
        } catch (error) {
            console.log(error)
            Base.globalToast.hideLoading()
            Base.globalToast.error(I18n.t('user.nodeError'))
        }
    },
    // refresh assets & activity list
    refreshAssets() {
        if (Base.globalDispatch) {
            Base.globalDispatch({
                type: 'common.forceRequest',
                data: Math.random()
            })
        }
    },
    async setMqtt(address) {
        /// mqtt listener
        if (this.subscriptionId && this.mqttClient) {
            this.mqttClient.unsubscribe(this.subscriptionId)
            this.subscriptionId = null
        }
        if (this.web3Subscription) {
            clearTimeout(this.web3Subscription)
            this.web3Subscription = null
        }
        if (address) {
            const self = this
            if (this.isWeb3Node) {
                if (this.client?.eth) {
                    const topics = this.getWeb3Topics(address)
                    let preBlock = await this.client.eth.getBlockNumber()
                    const getData = async () => {
                        let latest = await this.client.eth.getBlockNumber()
                        const res = await Promise.all(
                            topics.map((e) => {
                                return this.client.eth.getPastLogs({
                                    topics: e,
                                    fromBlock: preBlock,
                                    toBlock: latest
                                })
                            })
                        )
                        preBlock = latest
                        const list = _flatten(res)
                        if (list.length > 0) {
                            await this.setPastLogs(address, this.curNode?.id, list)
                            Base.globalTemData.isGetMqttMessage = true
                            self.refreshAssets()
                        }
                        this.web3Subscription = setTimeout(getData, 5000)
                    }
                    getData()
                }
            } else {
                if (this.mqttClient) {
                    this.subscriptionId = this.mqttClient.addressOutputs(
                        address,
                        _debounce(async () => {
                            try {
                                Base.globalTemData.isGetMqttMessage = true
                                self.refreshAssets()
                                // SyncAccounts
                                // Data are tagged with isGetMqttMessage for subsequent processing and differentiates against manual refresh
                            } catch (error) {
                                console.log(error)
                            }
                        }),
                        1000
                    )
                }
            }
        }
    },
    getMnemonic() {
        if (this.isWeb3Node) {
            return Web3Bip39.generateMnemonic()
        }
        return Bip39.randomMnemonic()
    },
    async importMnemonic({ mnemonic, name, password }) {
        return new Promise((resolve, reject) => {
            if (!this.info) {
                Base.globalToast.error(I18n.t('user.nodeError'))
                reject()
            }
            mnemonic = mnemonic.replace(/ +/g, ' ').toLocaleLowerCase().trim()
            if (!mnemonic || mnemonic.split(' ').length !== this.mnemonicLen) {
                Base.globalToast.error(I18n.t('account.mnemonicError').replace('{len}', this.mnemonicLen))
                reject()
            } else {
                let isChecked = false
                try {
                    // Mnemonic is checked with Bip39 library, throw if validation failed.
                    if (this.isWeb3Node) {
                        Web3Bip39.mnemonicToEntropy(mnemonic)
                    } else {
                        Bip39.mnemonicToEntropy(mnemonic)
                    }
                    isChecked = true
                } catch (error) {
                    let err = error.toString()
                    // Localization for common error code
                    if (err.includes('The mnemonic contains a word not in the wordlist')) {
                        const word = err.split(' ').pop()
                        err = I18n.t('account.mnemonicWordError').replace('{word}', word)
                    } else {
                        err = I18n.t('account.mnemonicOtherError')
                    }
                    Base.globalToast.error(err)
                    reject()
                }
                if (isChecked) {
                    const uuid = Base.guid()
                    // evm
                    if (this.isWeb3Node) {
                        const baseSeed = Web3Bip39.mnemonicToSeedSync(mnemonic)
                        const hdWallet = ethereumjsHdkey.fromMasterSeed(baseSeed)
                        const key = hdWallet.derivePath("m/44'/60'/0'/0/0")
                        // let privateKey = ethereumjsUtils.bufferToHex(key._hdkey._privateKey)
                        // let publicKey = ethereumjsUtils.bufferToHex(key._hdkey._publicKey)
                        let address = ethereumjsUtils.pubToAddress(key._hdkey._publicKey, true)
                        address = ethereumjsUtils.toChecksumAddress(ethereumjsUtils.bufferToHex(address))
                        // const keystore = this.client.eth.accounts.encrypt(privateKey, password)
                        Trace.createWallet(uuid, name, address)
                        resolve({
                            address,
                            name,
                            isSelected: true,
                            password,
                            id: uuid,
                            nodeId: this.curNode?.id,
                            seed: this.getLocalSeed(baseSeed, password),
                            bech32HRP: this.curNode?.bech32HRP
                            // keystore
                        })
                    } else {
                        // calculate seed
                        const baseSeed = Ed25519Seed.fromMnemonic(mnemonic)
                        const addressKeyPair = this.getPair(baseSeed)
                        const indexEd25519Address = new Ed25519Address(addressKeyPair.publicKey)
                        const indexPublicKeyAddress = indexEd25519Address.toAddress()
                        const bech32Address = this.hexToBech32(indexPublicKeyAddress)
                        Trace.createWallet(uuid, name, bech32Address)
                        // encrypt the seed and save to local storage
                        resolve({
                            address: bech32Address,
                            name,
                            isSelected: true,
                            password,
                            id: uuid,
                            nodeId: this.curNode?.id,
                            seed: this.getLocalSeed(baseSeed, password),
                            bech32HRP: this.info?.bech32HRP
                        })
                    }
                }
            }
        })
    },
    async getWalletList() {
        let list = await Base.getLocalData('common.walletsList')
        if (Base.isBrowser) {
            const bg = window?.chrome?.extension?.getBackgroundPage()
            if (bg) {
                list = bg.getBackgroundData('common.walletsList') || list
            }
        }
        return list
    },
    async getWalletInfo(address) {
        return this.client.address(address)
    },
    hexToBech32(address) {
        if (typeof address === 'string') {
            address = Converter.hexToBytes(address)
        }
        return Bech32Helper.toBech32(ED25519_ADDRESS_TYPE, address, this.info?.bech32HRP)
    },
    bech32ToHex(addressHex) {
        const address = Bech32Helper.fromBech32(addressHex, this.info?.bech32HRP)
        return Converter.bytesToHex(address.addressBytes)
    },
    getBatchBech32Address(baseSeed, accountState, STEP) {
        const temAddress = []
        let isFirst = accountState.addressIndex === 0 && !accountState.isInternal
        for (let i = 0; i < STEP; i++) {
            const addressKeyPair = this.getPair(baseSeed, isFirst, accountState)
            isFirst = false
            const indexEd25519Address = new Ed25519Address(addressKeyPair.publicKey)
            const indexPublicKeyAddress = indexEd25519Address.toAddress()
            const address = this.hexToBech32(indexPublicKeyAddress)
            temAddress.push(address)
        }
        return temAddress
    },
    // get all outputids
    async getAllOutputIds(addressList) {
        if (!this.info || this.isWeb3Node) {
            return []
        }
        const res = await Promise.all(
            addressList.map((e) => {
                return Http.GET(`${this.explorerApiUrl}/search/${this.curNode.network}/${e}`, {
                    isHandlerError: true
                })
            })
        )
        let list = []
        let outputs = []
        res.forEach((e, i) => {
            const addressOutputIds = e?.addressOutputIds || []
            const historicAddressOutputIds = e?.historicAddressOutputIds || []
            const ids = [...addressOutputIds, ...historicAddressOutputIds]
            list = [...list, ...ids]
            outputs[i] = ids
        })
        return { list, outputs }
    },
    async getValidAddresses({ seed, password, address, nodeId }) {
        if (!seed) return []
        let addressList = []
        let outputIds = []
        if (this.checkWeb3Node(nodeId)) {
            addressList = [address]
        } else {
            let num = 0
            const accountState = {
                accountIndex: 0,
                addressIndex: 0,
                isInternal: false
            }
            const baseSeed = this.getSeed(seed, password)
            const getAddressList = async (accountState) => {
                if (!this.info || this.isWeb3Node) {
                    return
                }
                const LIMIT = 1
                const temAddress = this.getBatchBech32Address(baseSeed, accountState, 20)
                // const addressOutputs = await Promise.all(
                //     temAddress.map((e) => this.client.addressOutputs(e, undefined, true))
                // )
                // let flag = false
                // temAddress.forEach((e, i) => {
                //     const { outputIds } = addressOutputs[i]
                //     if (!!outputIds.length) {
                //         if (!addressList.includes(e)) {
                //             addressList.push(e)
                //         }
                //         flag = true
                //     }
                // })
                let flag = false
                let addressOutputs = await this.getAllOutputIds(temAddress)
                addressOutputs = addressOutputs?.outputs || []
                temAddress.forEach((e, i) => {
                    if (addressOutputs[i].length > 0) {
                        if (!addressList.includes(e)) {
                            addressList.push(e)
                        }
                        addressOutputs[i].forEach((c) => {
                            if (!outputIds.includes(c)) {
                                outputIds.push(c)
                            }
                        })
                        flag = true
                    }
                })
                if (!flag) {
                    num++
                }
                if (num < LIMIT) {
                    await getAddressList(accountState)
                }
            }
            await getAddressList(accountState)
        }
        return { addressList, requestAddress: address, outputIds }
    },
    async getBalanceAddress({ seed, password }) {
        const accountState = {
            accountIndex: 0,
            addressIndex: 0,
            isInternal: false
        }
        const baseSeed = this.getSeed(seed, password)
        const getAddressList = async (accountState) => {
            if (!this.info || this.isWeb3Node) {
                return []
            }
            const temAddress = this.getBatchBech32Address(baseSeed, accountState, 5)
            const addressInfos = await Promise.all(temAddress.map((e) => this.client.address(e)))
            const info = addressInfos.find((e) => e.balance > 0)
            if (info) {
                return this.hexToBech32(info.address)
            } else {
                return await getAddressList(accountState)
            }
        }
        return await getAddressList(accountState)
    },
    async getBalance({ id, address, nodeId }, addressList) {
        if (!this.client) {
            return 0
        }
        const node = IotaSDK.nodes.find((e) => e.id === nodeId)
        const token = node?.token
        const decimal = node?.decimal
        let realBalance = BigNumber(0)
        let balance = BigNumber(0)
        if (this.checkWeb3Node(nodeId)) {
            const res = await Promise.all(addressList.map((e) => this.client.eth.getBalance(e)))
            res.forEach((e) => {
                realBalance = realBalance.plus(e)
            })
        } else {
            const res = await Promise.all(addressList.map((e) => this.client.address(e)))
            res.forEach((e) => {
                realBalance = realBalance.plus(e.balance)
            })
        }
        balance = realBalance.div(Math.pow(10, decimal))
        realBalance = Number(realBalance)
        Trace.updateAddressAmount(id, address, realBalance)
        const contractAssets = await this.getContractAssets(nodeId, address)

        const balanceList = [
            {
                realBalance,
                balance: Number(balance),
                decimal,
                token
            },

            ...contractAssets
        ]
        return balanceList
    },
    getPair(seed, isFirst = true, accountState) {
        accountState = accountState || {
            accountIndex: 0,
            addressIndex: 0,
            isInternal: false
        }
        const path = generateBip44Address(accountState, isFirst)
        const addressSeed = seed.generateSeedFromPath(new Bip32Path(path))
        const addressKeyPair = addressSeed.keyPair()
        return addressKeyPair
    },
    getKeyAndIv(password) {
        let key = CryptoJS.MD5(password, 16).toString().toLocaleUpperCase()
        let iv = CryptoJS.MD5(password.slice(0, parseInt(password.length / 2)))
            .toString()
            .toLocaleUpperCase()
        key = CryptoJS.enc.Utf8.parse(key)
        iv = CryptoJS.enc.Utf8.parse(iv)
        return [key, iv]
    },
    decryptSeed(seed, password) {
        const [key, iv] = this.getKeyAndIv(password)
        let encryptedHexStr = CryptoJS.enc.Hex.parse(seed)
        let srcs = CryptoJS.enc.Base64.stringify(encryptedHexStr)
        let decrypt = CryptoJS.AES.decrypt(srcs, key, { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 })
        let decryptedStr = decrypt.toString(CryptoJS.enc.Utf8)
        return decryptedStr.toString()
    },
    encryptSeed(seed, password) {
        const [key, iv] = this.getKeyAndIv(password)
        let srcs = CryptoJS.enc.Utf8.parse(seed)
        let encrypted = CryptoJS.AES.encrypt(srcs, key, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        })
        return encrypted.ciphertext.toString().toUpperCase()
    },
    getSeed(localSeed, password) {
        let seed = this.decryptSeed(localSeed, password)
        seed = Converter.hexToBytes(seed)
        seed = Uint8Array.from(seed)
        return new Ed25519Seed(seed)
    },
    getLocalSeed(seed, password) {
        const localSeed = Array.from(seed._secretKey || seed)
        const localHex = Converter.bytesToHex(localSeed)
        const localHexNew = this.encryptSeed(localHex, password)
        return localHexNew
    },
    changePassword(old, oldSeed, password) {
        const seed = this.getSeed(oldSeed, old)
        return this.getLocalSeed(seed, password)
    },
    async send(fromInfo, toAddress, sendAmount, ext) {
        if (!this.client) {
            return Base.globalToast.error(I18n.t('user.nodeError'))
        }
        const { seed, address, password, nodeId } = fromInfo
        const baseSeed = this.getSeed(seed, password)
        if (this.checkWeb3Node(nodeId)) {
            const sendAmountHex = this.client.utils.toHex(new BigNumber(sendAmount))
            const eth = this.client.eth
            const nodeInfo = this.nodes.find((e) => e.id === nodeId) || []
            let blockGasLimit = await eth.getBlock('latest')
            blockGasLimit = blockGasLimit?.gasLimit || 0
            const gasLimit = nodeInfo?.gasLimit || blockGasLimit || 0
            const gasPrice = await eth.getGasPrice()
            const nonce = await eth.getTransactionCount(address)
            const { contract, token } = ext || {}
            let res = null
            if (contract) {
                const contractInfo = (nodeInfo.contractList || []).find((e) => e.token === token)
                if (!contractInfo) {
                    return Base.globalToast.error('contract error')
                }
                const web3Contract = new eth.Contract(tokenAbi, contractInfo.contract)
                window.web3Contract = web3Contract

                const privateKey = this.getPrivateKey(seed, password)
                const signData = {
                    to: contractInfo.contract,
                    value: '0x00',
                    from: address,
                    nonce,
                    gasLimit: contractInfo?.gasLimit || blockGasLimit || 0,
                    data: web3Contract.methods.transfer(toAddress, sendAmountHex).encodeABI()
                }
                if (contractInfo?.maxPriorityFeePerGas) {
                    signData.maxPriorityFeePerGas = contractInfo?.maxPriorityFeePerGas
                }
                try {
                    const signed = await eth.accounts.signTransaction(signData, privateKey)
                    res = await eth.sendSignedTransaction(signed.rawTransaction)
                } catch (error) {
                    throw error
                }
                Trace.transaction('pay', res.transactionHash, address, toAddress, sendAmountHex)
            } else {
                const privateKey = this.getPrivateKey(seed, password)
                const chainId = await eth.getChainId()
                try {
                    const signed = await eth.accounts.signTransaction(
                        {
                            to: toAddress,
                            value: sendAmountHex,
                            from: address,
                            chainId,
                            nonce,
                            gasLimit,
                            gasPrice
                        },
                        privateKey
                    )
                    res = await eth.sendSignedTransaction(signed.rawTransaction)
                } catch (error) {
                    console.log(error)
                    throw error
                }
                Trace.transaction('pay', res.transactionHash, address, toAddress, sendAmountHex)
            }
            const logInfo = res?.logs?.[0]
            const logData = {
                address: logInfo?.address || '0x0000000000000000000000000000000000001010',
                blockHash: res.blockHash,
                blockNumber: res.blockNumber,
                data: logInfo?.data || this.fill64Len(sendAmountHex),
                id: logInfo?.id || res.transactionHash,
                logIndex: logInfo?.logIndex || res.transactionIndex,
                removed: logInfo?.removed || res.status,
                topics: logInfo?.topics || [
                    '0xe6497e3ee548a3372136af2fcb0696db31fc6cf20260707645068bd3fe97f3c4',
                    '0x0000000000000000000000000000000000000000000000000000000000001010',
                    this.fillAddress(res?.from),
                    this.fillAddress(res?.to)
                ],
                transactionHash: logInfo?.transactionHash || res.transactionHash,
                transactionIndex: logInfo?.transactionIndex || res.transactionIndex
            }
            this.setPastLogs(address, nodeId, [logData]).then(() => {
                this.refreshAssets()
            })
            return { ...res, messageId: logData.transactionHash }
        } else {
            const amount = Base.formatNum(BigNumber(sendAmount).div(this.IOTA_MI))
            let sendOut = null
            try {
                sendOut = await sendMultiple(
                    this.client,
                    baseSeed,
                    0,
                    [
                        {
                            addressBech32: toAddress,
                            amount: sendAmount,
                            isDustAllowance: false
                        }
                    ],
                    {
                        key: Converter.utf8ToBytes('TanglePay'),
                        data: Converter.utf8ToBytes(
                            JSON.stringify({
                                from: address, //main address
                                to: toAddress,
                                amount: sendAmount
                            })
                        )
                    },
                    {
                        startIndex: 0,
                        zeroCount: 20
                    }
                )
            } catch (error) {
                throw error
            }
            const { messageId } = sendOut
            // Save transfer output when the balance remindar is 0
            // Context: in IOTA sdk, when remaining balance is 0, it transfer operation is not included in the messages sent to Tangle.
            const outputs = _get(sendOut, 'message.payload.essence.outputs') || []
            if (outputs.length === 1) {
                this.setSendList(address, {
                    id: messageId,
                    coin: 'IOTA',
                    num: amount,
                    type: 1,
                    timestamp: parseInt(new Date().getTime() / 1000),
                    address: toAddress
                })
            }

            Trace.transaction('pay', messageId, address, toAddress, sendAmount)
            return sendOut
        }
    },
    // Save transfer output when the balance remindar is 0
    // The data structure is identical to what being used in main/assets/list/ActivityList
    async setSendList(address, data) {
        const localSendList = (await Base.getLocalData(`${address}.localSendList`)) || []
        localSendList.push(data)
        Base.setLocalData(`${address}.localSendList`, localSendList)
    },
    // Get transfer out object
    async getSendList(address) {
        const localSendList = (await Base.getLocalData(`${address}.localSendList`)) || []
        return localSendList
    },
    async requestQueue(list) {
        const requestFunc = async () => {
            if (list.length > 0) {
                const request = list.shift()
                try {
                    return await request
                } catch (error) {
                    return await requestFunc()
                }
            }
            return null
        }
        return await requestFunc()
    },
    // handle output 404
    async outputData(outputId) {
        const res = await this.requestQueue([
            // this.client.output(outputId),
            Http.GET(`${this.explorerApiUrl}/output/${this.curNode.network}/${outputId}`, {
                isHandlerError: true
            })
        ])
        return res?.output ? res?.output : res
    },
    // handle message 404 ？
    async messageMetadata(messageId) {
        const res = await this.requestQueue([
            // this.client.messageMetadata(messageId),
            Http.GET(`${this.explorerApiUrl}/message/${this.curNode.network}/${messageId}`, {
                isHandlerError: true
            })
        ])
        return res?.metadata ? res?.metadata : res
    },
    // handle milestone 404
    async milestone(milestoneIndex) {
        const res = await this.requestQueue([
            // this.client.milestone(milestoneIndex),
            Http.GET(`${this.explorerApiUrl}/milestone/${this.curNode.network}/${milestoneIndex}`, {
                isHandlerError: true
            })
        ])
        return res?.milestone ? res?.milestone : res
    },
    // handle transactionId 404
    async transactionIncludedMessage(transactionId) {
        const res = await this.requestQueue([
            // this.client.transactionIncludedMessage(transactionId),
            Http.GET(`${this.explorerApiUrl}/search/${this.curNode.network}/${transactionId}`, {
                isHandlerError: true
            })
        ])
        return res?.message?.payload ? res?.message : res
    },
    async getHisList(outputList, { address, nodeId }) {
        if (!this.client) {
            return Base.globalToast.error(I18n.t('user.nodeError'))
        }
        if (this.checkWeb3Node(nodeId)) {
            if (this.client?.eth) {
                let list = await this.getPastLogs(address, nodeId)
                return list
            }
            return []
        } else {
            const outputDatas = await Promise.all(outputList.map((e) => this.outputData(e)))
            let metadataList = await Promise.all(outputDatas.map((e) => this.messageMetadata(e.messageId)))
            const newMetadataList = []
            const newOutputDatas = []
            metadataList.forEach((e, i) => {
                if (e) {
                    newMetadataList.push(e)
                    newOutputDatas.push(outputDatas[i])
                }
            })
            const milestoneList = await Promise.all(
                newMetadataList.map((e) => this.milestone(e.referencedByMilestoneIndex))
            )
            const transactionFrom = await Promise.all(
                newOutputDatas.map((e) => this.transactionIncludedMessage(e.transactionId))
            )
            const allList = []
            milestoneList.forEach((e, i) => {
                const { isSpent, output, transactionId, outputIndex } = newOutputDatas[i]
                const { payload } = transactionFrom[i]
                const address = output.address.address
                let payloadData = payload?.essence?.payload?.data
                let payloadIndex = payload?.essence?.payload?.index
                try {
                    payloadIndex = Converter.hexToUtf8(payloadIndex)
                } catch (error) {
                    payloadIndex = ''
                }
                try {
                    if (payloadIndex === 'PARTICIPATE') {
                        payloadData = [...Converter.hexToBytes(payloadData)]
                        payloadData.shift()
                        payloadData = _chunk(payloadData, 33)
                        payloadData = payloadData.map((e) => {
                            e.pop()
                            return Converter.bytesToHex(Uint8Array.from(e))
                        })
                    } else {
                        payloadData = Converter.hexToUtf8(payloadData)
                        payloadData = JSON.parse(payloadData)
                    }
                } catch (error) {
                    payloadData = payload?.essence?.payload?.data || {}
                }
                allList.push({
                    ...e,
                    decimal: this.curNode?.decimal,
                    isSpent,
                    transactionId,
                    token: this.curNode?.token,
                    address,
                    outputIndex,
                    output,
                    bech32Address: this.hexToBech32(address),
                    amount: output.amount,
                    inputs: payload?.essence?.inputs,
                    payloadIndex,
                    payloadData,
                    outputs: payload?.essence?.outputs.map((d) => {
                        return {
                            ...d,
                            bech32Address: this.hexToBech32(d.address.address)
                        }
                    })
                })
            })
            allList.sort((a, b) => a.timestamp - b.timestamp)
            return allList
        }
    },
    set passwordDialog(dialog) {
        this._passwordDialog = dialog
    },
    async inputPassword(curWallet) {
        return new Promise((resolve) => {
            if (curWallet.password) {
                resolve(curWallet)
            } else {
                // prompt password input if it is not available in context
                if (this._passwordDialog) {
                    this._passwordDialog.current.show(curWallet, (data) => {
                        if (data) {
                            resolve(data)
                        }
                    })
                }
            }
        })
    },
    /**************** Staking start *******************/
    async requestParticipation(url) {
        if (!this.client) {
            setTimeout(() => {
                this.requestParticipation(url)
            }, 500)
            return
        }
        url = `${this.client._endpoint}/api/plugins/participation/${url}`
        const res = await Http.GET(url, { isHandlerError: true })
        return res?.data
    },
    async getParticipationTokens(address) {
        const res = (await Base.getLocalData(`stake.${address}`)) || []
        return res
    },
    async getAddressRewards(address) {
        if (!this.client) {
            return {}
        }
        if (!this.hasStake(this.curNode?.id)) {
            return {}
        }
        const data = await this.requestParticipation(`addresses/${address}`)
        const rewards = data?.rewards || {}
        for (const i in rewards) {
            rewards[i].address = address
        }
        return rewards
    },
    async getAddressListRewards(addressList) {
        addressList = _uniqWith(addressList, _isEqual)
        const resList = await Promise.all(
            addressList.map((e) => {
                return this.getAddressRewards(e)
            })
        )
        const dic = {}
        if (resList.length > 0) {
            resList.forEach((e) => {
                for (const i in e) {
                    if (dic[i]) {
                        dic[i].amount += e[i].amount
                    } else {
                        dic[i] = { ...e[i] }
                    }
                }
            })
        }
        return dic
    },
    async requestEventsByIds(eventIds) {
        const events = await Promise.all(
            eventIds.map((e) => {
                return this.requestParticipation(`events/${e}`)
            })
        )
        return events
    },
    async getParticipationEvents() {
        if (!this.client) {
            setTimeout(() => {
                this.getParticipationEvents()
            }, 500)
            return
        }
        if (!this.hasStake(this.curNode?.id)) {
            return []
        }
        const data = await this.requestParticipation(`events`)

        const eventIds = data?.eventIds || []
        const events = await this.requestEventsByIds(eventIds)
        events.forEach((e, i) => {
            e.id = eventIds[i]
        })
        if (events.length === 0) {
            return []
        }
        events.sort((a, b) => a.milestoneIndexStart - b.milestoneIndexStart)
        let milestoneValue = _get(events, '0.milestoneIndexStart') // base milestone
        let timeData = await this.milestone(milestoneValue)
        if (!timeData?.timestamp) {
            milestoneValue = this.info.latestMilestoneIndex
            timeData = await this.milestone(milestoneValue) // base milestone
        }
        const timestamp = timeData.timestamp || ''
        const list = []
        const turnTime = (milestone) => {
            const value = (milestone - milestoneValue) * 10
            return parseInt(timestamp + value)
        }
        events.forEach((e) => {
            const { milestoneIndexStart, milestoneIndexEnd, milestoneIndexCommence, payload } = e
            const { requiredMinimumRewards = 0, denominator = 0, numerator = 1 } = payload || {}
            let limit = (requiredMinimumRewards / (milestoneIndexEnd - milestoneIndexStart) / numerator) * denominator
            limit = Math.ceil(limit / this.IOTA_MI)
            list.push({
                ...e,
                limit,
                commenceTime: turnTime(milestoneIndexCommence),
                startTime: turnTime(milestoneIndexStart),
                endTime: turnTime(milestoneIndexEnd)
            })
        })
        return list
    },
    // type：1->stake  2->add amount  3->unstake 4->add airdrop
    async handleStake({ wallet, tokens, amount, type }) {
        try {
            await this.sendParticipateMessage({ wallet, tokens, amount, type })
            // await this.updateParticipateHis(tokens, amount, type);
            const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
            await sleep(2000)
            this.refreshAssets()
            // setTimeout(this.refreshAssets, 2000);
            return { code: 0 }
        } catch (error) {
            console.log(error)
            return { code: 1, msg: error.toString() }
        }

        // refresh assets & activity list
    },
    async sendParticipateMessage({ wallet, tokens, amount, type }) {
        type = parseInt(type)
        const { seed, password } = wallet
        let address = ''
        if (type === 3 && _get(tokens, '0.address')) {
            address = _get(tokens, '0.address')
        } else {
            address = await this.getBalanceAddress({ seed, password })
        }
        const baseSeed = this.getSeed(seed, password)
        let datas = []
        if ([1, 2, 4].includes(type)) {
            tokens.forEach((e) => {
                datas = [...datas, ...Converter.hexToBytes(e.eventId), 0]
            })
            datas.unshift(tokens.length)
        }
        datas = Uint8Array.from(datas)
        const res = await sendMultiple(
            this.client,
            baseSeed,
            0,
            [
                {
                    addressBech32: address,
                    amount,
                    isDustAllowance: false
                }
            ],
            {
                key: Converter.utf8ToBytes('PARTICIPATE'),
                data: datas
            },
            {
                startIndex: 0,
                zeroCount: 20
            }
        )
        return res
    },
    /**************** Staking end *******************/
    /**************** Sign start ********************/
    async iota_sign(wallet, content) {
        if (!wallet || !wallet.address) {
            return false
        }
        let signRes = null
        if (this.checkWeb3Node(wallet.nodeId)) {
            if (!this.client?.eth) {
                return false
            }
            const privateKey = this.getPrivateKey(seed, password)
            signRes = await this.client.eth.accounts.sign(content, privateKey)
        } else {
            const { seed, password } = wallet
            const baseSeed = this.getSeed(seed, password)
            const addressKeyPair = this.getPair(baseSeed)
            signRes = Ed25519.sign(addressKeyPair.privateKey, Converter.utf8ToBytes(content))
        }
        return signRes
    },
    async sign(content, wallet, amount) {
        const { seed, password, address } = wallet
        const baseSeed = this.getSeed(seed, password)
        const res = await sendMultiple(
            this.client,
            baseSeed,
            0,
            [
                {
                    addressBech32: address,
                    amount,
                    isDustAllowance: false
                }
            ],
            {
                key: Converter.utf8ToBytes('TanglePay.Sign'),
                data: Converter.utf8ToBytes(content)
            },
            {
                startIndex: 0,
                zeroCount: 20
            }
        )
        return res
    },
    /**************** Sign end **********************/

    /**************** Nft start *******************/
    async getNfts(addressList) {
        const list = _chunk(addressList, 10)
        let res = await Promise.all(
            list.map((e) => {
                return soon.getNftsByIotaAddress(e)
            })
        )
        res = _flatten(res)
        return res
    },

    /**************** Nft end *******************/

    /**************** web3 start *******************/
    get isWeb3Node() {
        return this.curNode?.type == 2
    },
    checkWeb3Node(nodeId) {
        return this.nodes.find((e) => e.id == nodeId)?.type == 2
    },
    fillAddress(address) {
        address = address.toLocaleLowerCase()
        const padding = new Array(24 + 1).join('0')
        const topic = '0x' + padding + address.slice(2)
        return topic
    },
    fill64Len(value) {
        value = String(value).replace(/0x/, '')
        const len = 64 - value.length
        value = `0x${new Array(len).join('0')}${value}`
        return value
    },
    getWeb3Topics(address) {
        const topic = this.fillAddress(address)
        return [
            // ['0xe6497e3ee548a3372136af2fcb0696db31fc6cf20260707645068bd3fe97f3c4', null, topic, null], // node send
            ['0xe6497e3ee548a3372136af2fcb0696db31fc6cf20260707645068bd3fe97f3c4', null, null, topic],
            // ['0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef', topic, null], // token send
            ['0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef', null, topic]
        ]
    },
    async changeLogData(address, nodeId, list) {
        address = (address || '').toLocaleLowerCase()
        const curNode = this.nodes.find((e) => e.id === nodeId)
        const blocks = await Promise.all(list.map((e) => this.client.eth.getBlock(e.blockNumber)))
        const contractList = curNode?.contractList || []
        let curToken = curNode?.token
        let tokenDecimal = curNode?.decimal
        const token0Contract = contractList.map((e) => {
            return new this.client.eth.Contract(tokenAbi, e.contract)
        })
        let decimals = await Promise.all(
            token0Contract.map((e) => {
                return e.methods.decimals().call()
            })
        )
        const decimalsDic = {}
        decimals.forEach((e, i) => {
            decimalsDic[contractList[i].contract.toLocaleLowerCase()] = e
        })
        list = list.map((e, i) => {
            let topics = e.topics
            const len = topics.length
            topics = topics.map((e, i) => {
                if (i >= len - 2) {
                    return e.replace(/0{24}/, '')
                }
                return e.toLocaleLowerCase()
            })

            const dataAddress = e.address.toLocaleLowerCase()
            // type：0->receive，1->send
            let type = 0
            const contractInfo = contractList.find((e) => e.contract.toLocaleLowerCase() === dataAddress)
            let token = curToken
            let otherAddress = ''
            if (contractInfo) {
                token = contractInfo?.token
                if (topics?.[1] === address) {
                    type = 1
                    otherAddress = topics?.[2] || ''
                } else {
                    type = 0
                    otherAddress = topics?.[1] || ''
                }
            } else {
                if (topics?.[2] === address) {
                    type = 1
                    otherAddress = topics?.[3] || ''
                } else {
                    otherAddress = topics?.[2] || ''
                    type = 0
                }
            }
            const decimal = decimalsDic[dataAddress] || tokenDecimal
            let amount = e.data.replace(/^0x/, '').slice(0, 64)
            amount = this.client.utils.hexToNumberString(`0x${amount}`)
            return { ...e, timestamp: blocks[i].timestamp, amount, token, type, otherAddress, decimal }
        })
        list.sort((a, b) => b.timestamp - a.timestamp)
        return list
    },

    async getPastLogs(address, nodeId) {
        try {
            address = (address || '').toLocaleLowerCase()
            const logsData = (await Base.getLocalData('web3.logs.data')) || {}
            return logsData?.[nodeId]?.[address] || []
        } catch (error) {
            console.log(error)
        }
    },
    async setPastLogs(address, nodeId, list) {
        try {
            address = (address || '').toLocaleLowerCase()
            let oldList = await this.getPastLogs(address, nodeId)
            list = list.filter((e) => {
                return !oldList.includes(e.transactionHash)
            })
            const newList = await this.changeLogData(address, nodeId, list)
            oldList = [...oldList, ...newList]
            oldList.sort((a, b) => b.timestamp - a.timestamp)
            const logsData = (await Base.getLocalData('web3.logs.data')) || {}
            logsData[nodeId] = logsData[nodeId] || {}
            logsData[nodeId][address] = oldList
            await Base.setLocalData('web3.logs.data', logsData)
        } catch (error) {
            console.log(error)
        }
    },
    //get evm privatekey
    getPrivateKey(seed, password) {
        const baseSeed = this.getSeed(seed, password)
        const hdWallet = ethereumjsHdkey.fromMasterSeed(baseSeed?._secretKey)
        const key = hdWallet.derivePath("m/44'/60'/0'/0/0")
        let privateKey = ethereumjsUtils.bufferToHex(key._hdkey._privateKey)
        return privateKey
    },
    async getContractAssets(nodeId, address) {
        const nodeInfo = this.nodes.find((e) => e.id === nodeId)
        if (!nodeInfo?.contractList?.length) {
            return []
        }
        const token0Contract = nodeInfo.contractList.map((e) => {
            return new this.client.eth.Contract(tokenAbi, e.contract)
        })
        const decimals = await Promise.all(
            token0Contract.map((e) => {
                return e.methods.decimals().call()
            })
        )
        // const coinbase = await this.client.eth.getCoinbase()
        let balanceList = await Promise.all(
            token0Contract.map((e) => {
                return e.methods.balanceOf(address).call()
            })
        )
        balanceList = balanceList.map((e, i) => {
            const token = nodeInfo.contractList[i].token
            return {
                token,
                balance: Number(BigNumber(e).div(Math.pow(10, decimals[i]))),
                realBalance: e,
                contract: true,
                decimal: decimals[i]
            }
        })
        return balanceList
    }
    /**************** web3 end *******************/
}

export default IotaSDK
