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
import IotaNext from './iota-next'
import _chunk from 'lodash/chunk'
import BigNumber from 'bignumber.js'
import { convertUnits } from '@iota/unit-converter'
import _uniqWith from 'lodash/uniqWith'
import _uniqBy from 'lodash/uniqBy'
import _isEqual from 'lodash/isEqual'
import { Soon } from 'soonaverse'
import _flatten from 'lodash/flatten'
import Web3 from 'web3'
import * as Web3Bip39 from 'bip39'
import { hdkey as ethereumjsHdkey } from 'ethereumjs-wallet'
import * as ethereumjsUtils from 'ethereumjs-util'
const tokenAbi = require('./TokenERC20.json')

const soon = new Soon(true)

let IotaObj = Iota

const V2_FLAG = 'TanglePayV2'
const IOTA_NODE_ID = 1
const SMR_NODE_ID = 101
const IotaSDK = {
    IOTA_NODE_ID,
    IOTA_MI: 1000000, // 1mi = 1000000i
    convertUnits(value, fromUnit, toUnit) {
        return convertUnits(value, fromUnit, toUnit)
    },
    changeIota(nodeId) {
        if (nodeId == SMR_NODE_ID) {
            IotaObj = IotaNext
            IotaObj.setIotaBip44BasePath("m/44'/4219'")
        } else {
            IotaObj = Iota
        }
    },
    // type:1.iota, 2.web3,
    // filterMenuList:['assets','apps','staking','me']
    // filterAssetsList: ['stake', 'soonaverse']
    _nodes: [
        {
            id: IOTA_NODE_ID,
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
        },
        {
            id: SMR_NODE_ID,
            // url: 'https://api.alphanet.iotaledger.net',
            url: 'https://api.testnet.shimmer.network',
            explorer: 'https://explorer.shimmer.network/testnet',
            name: 'Shimmer Beta',
            enName: 'Shimmer Beta',
            deName: 'Shimmer Beta',
            zhName: 'Shimmer 测试網絡',
            type: 3,
            mqtt: 'wss://api.testnet.shimmer.network:443/api/mqtt/v1',
            network: 'shimmer',
            bech32HRP: 'rms',
            token: 'RMS',
            filterMenuList: ['apps', 'staking'],
            filterAssetsList: ['stake', 'soonaverse'],
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
        if (lang && lang > 0) {
            this._nodes.forEach((e) => {
                e.name = e[`${lang}Name`]
            })
        }
    },
    get mnemonicLenList() {
        return this.isWeb3Node ? [12, 24] : [24]
    },
    async getNodes() {
        try {
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
        } catch (error) {
            console.log(error)
        }
    },
    hasStake(nodeId) {
        return !(this.nodes.find((e) => e.id === nodeId)?.filterAssetsList || []).includes('stake')
    },
    // token price
    priceDic: {},
    explorerApiUrl: 'https://explorer-api.iota.org',
    async init(id) {
        this.changeIota(id)
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
                if (this.client?.eth) {
                    this.client.eth.getChainId().catch(() => {
                        Base.globalToast.error(I18n.t('user.nodeError'))
                    })
                }
            } else {
                if (id == IOTA_NODE_ID) {
                    this.client = new IotaObj.SingleNodeClient(curNode.url)
                    this.IndexerPluginClient = null
                } else {
                    this.client = new IotaObj.SingleNodeClient(curNode.url, {
                        powProvider: new IotaObj.LocalPowProvider()
                    })
                    this.IndexerPluginClient = new IotaObj.IndexerPluginClient(this.client)
                }
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
        return IotaObj.Bip39.randomMnemonic()
    },
    async importMnemonic({ mnemonic, name, password }) {
        return new Promise(async (resolve, reject) => {
            if (!this.info) {
                Base.globalToast.error(I18n.t('user.nodeError'))
                reject()
                return
            }
            mnemonic = mnemonic.replace(/ +/g, ' ').toLocaleLowerCase().trim()
            const mnemonicLen = (mnemonic || '').split(' ').length
            if (!mnemonic || !this.mnemonicLenList.includes(mnemonicLen)) {
                Base.globalToast.error(
                    I18n.t('account.mnemonicError').replace(
                        '{len}',
                        this.mnemonicLenList.join(` ${I18n.t('account.or')} `)
                    )
                )
                reject()
            } else {
                let isChecked = false
                try {
                    // Mnemonic is checked with Bip39 library, throw if validation failed.
                    if (this.isWeb3Node) {
                        Web3Bip39.mnemonicToEntropy(mnemonic)
                    } else {
                        IotaObj.Bip39.mnemonicToEntropy(mnemonic)
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
                        const isDuplicate = await this.checkImport(address)
                        if (isDuplicate) {
                            Base.globalToast.error(I18n.t('account.importDuplicate'))
                            reject()
                            return
                        }
                        // const keystore = this.client.eth.accounts.encrypt(privateKey, password)
                        Trace.createWallet(uuid, name, address, this.curNode?.id, this.curNode?.token)
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
                        const baseSeed = IotaObj.Ed25519Seed.fromMnemonic(mnemonic)
                        const addressKeyPair = this.getPair(baseSeed)
                        const indexEd25519Address = new IotaObj.Ed25519Address(addressKeyPair.publicKey)
                        const indexPublicKeyAddress = indexEd25519Address.toAddress()
                        const bech32Address = this.hexToBech32(indexPublicKeyAddress)
                        const isDuplicate = await this.checkImport(bech32Address)
                        if (isDuplicate) {
                            Base.globalToast.error(I18n.t('account.importDuplicate'))
                            reject()
                            return
                        }
                        Trace.createWallet(uuid, name, bech32Address, this.curNode?.id, this.curNode?.token)
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
    async checkImport(address) {
        const list = await this.getWalletList()
        return !!list.find((e) => e.address === address)
    },
    async getWalletList() {
        let list = []
        const key = 'common.walletsList'
        if (Base.isBrowser) {
            list = (await Base.getLocalData(key)) || []
            const bg = window?.chrome?.extension?.getBackgroundPage()
            if (bg) {
                list = bg.getBackgroundData(key) || list
            }
        } else {
            list = (await Base.getSensitiveInfo(key)) || []
        }
        return list
    },
    async getWalletInfo(address) {
        return this.client.address(address)
    },
    bytesToHex(bytes) {
        return IotaObj.Converter.bytesToHex(bytes)
    },
    publicKeyToBech32(publicKey) {
        if (!publicKey) {
            return
        }
        if (typeof publicKey === 'string') {
            publicKey = IotaObj.Converter.hexToBytes(publicKey)
        }
        const indexEd25519Address = new IotaObj.Ed25519Address(publicKey)
        let indexPublicKeyAddress = indexEd25519Address.toAddress()
        const bech32Address = this.hexToBech32(indexPublicKeyAddress)
        return bech32Address
    },
    hexToBech32(address) {
        if (typeof address === 'string') {
            address = IotaObj.Converter.hexToBytes(address)
        }
        return IotaObj.Bech32Helper.toBech32(
            IotaObj.ED25519_ADDRESS_TYPE,
            address,
            this.info?.bech32HRP || this.curNode?.bech32HRP
        )
    },
    bech32ToHex(addressHex) {
        const address = IotaObj.Bech32Helper.fromBech32(addressHex, this.info?.bech32HRP || this.curNode?.bech32HRP)
        return IotaObj.Converter.bytesToHex(address.addressBytes)
    },
    getBatchBech32Address(baseSeed, accountState, STEP) {
        const temAddress = []
        let isFirst = accountState.addressIndex === 0 && !accountState.isInternal
        for (let i = 0; i < STEP; i++) {
            const addressKeyPair = this.getPair(baseSeed, isFirst, accountState)
            isFirst = false
            const indexEd25519Address = new IotaObj.Ed25519Address(addressKeyPair.publicKey)
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
        let list = []
        let outputs = []
        if (this.IndexerPluginClient) {
            outputs = await Promise.all(addressList.map((e) => this.getAllSMROutputIds(e)))
            list = _flatten(outputs)
        } else {
            const res = await Promise.all(
                addressList.map((e) => {
                    return Http.GET(`${this.explorerApiUrl}/search/${this.curNode.network}/${e}`, {
                        isHandlerError: true
                    })
                })
            )
            res.forEach((e, i) => {
                const addressOutputIds = e?.addressOutputIds || []
                const historicAddressOutputIds = e?.historicAddressOutputIds || []
                const ids = [...addressOutputIds, ...historicAddressOutputIds]
                list = [...list, ...ids]
                outputs[i] = ids
            })
        }
        return { list, outputs }
    },
    async getValidAddresses({ seed, password, address, nodeId }) {
        if (!seed) return []
        let addressList = []
        let outputIds = []
        if (this.checkWeb3Node(nodeId)) {
            addressList = [address]
        } else {
            let actionTime = new Date().getTime()
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
            actionTime = new Date().getTime() - actionTime
            const nodeInfo = this.nodes.find((e) => e.id === nodeId) || {}
            Trace.actionLog(60, address, actionTime, Base.curLang, nodeId, nodeInfo.token)
        }
        if (!addressList.includes(address)) {
            addressList.unshift(address)
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
        let actionTime = new Date().getTime()
        if (this.checkWeb3Node(nodeId)) {
            const res = await Promise.all(addressList.map((e) => this.client.eth.getBalance(e)))
            res.forEach((e) => {
                realBalance = realBalance.plus(e)
            })
        } else {
            try {
                let res = []
                if (IotaObj.addressBalance) {
                    res = await Promise.all(addressList.map((e) => IotaObj.addressBalance(this.client, e)))
                } else {
                    res = await Promise.all(addressList.map((e) => this.client.address(e)))
                }
                res.forEach((e) => {
                    realBalance = realBalance.plus(e.balance)
                })
            } catch (error) {
                console.log(error)
            }
        }

        actionTime = new Date().getTime() - actionTime
        Trace.actionLog(10, address, actionTime, Base.curLang, nodeId, token)

        balance = realBalance.div(Math.pow(10, decimal))
        realBalance = Number(realBalance)
        Trace.updateAddressAmount(id, address, realBalance, nodeId, token)
        const contractAssets = await this.getContractAssets(nodeId, address, id)

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
        let path = IotaObj.generateBip44Address(accountState, isFirst)
        const addressSeed = seed.generateSeedFromPath(new IotaObj.Bip32Path(path))
        const addressKeyPair = addressSeed.keyPair()
        return addressKeyPair
    },
    // check isV2
    checkKeyAndIvIsV2(localSeed) {
        const reg = new RegExp(`${V2_FLAG}$`)
        return reg.test(localSeed)
    },
    getKeyAndIvV2(password) {
        const md5 = CryptoJS.MD5(password, 16).toString()
        const kdf1 = CryptoJS.PBKDF2(md5, md5, { keySize: 16, iterations: 1000 })
        const kdf2 = CryptoJS.PBKDF2(kdf1.toString(), kdf1.toString(), { keySize: 16, iterations: 1000 })
        return [kdf1, kdf2]
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
        const reg = new RegExp(`${V2_FLAG}$`)
        let func = reg.test(seed) ? 'getKeyAndIvV2' : 'getKeyAndIv'
        seed = seed.replace(reg, '')
        const [key, iv] = this[func](password)
        let encryptedHexStr = CryptoJS.enc.Hex.parse(seed)
        let srcs = CryptoJS.enc.Base64.stringify(encryptedHexStr)
        let decrypt = CryptoJS.AES.decrypt(srcs, key, { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 })
        let decryptedStr = decrypt.toString(CryptoJS.enc.Utf8)
        return decryptedStr.toString()
    },
    encryptSeed(seed, password) {
        const reg = new RegExp(`${V2_FLAG}$`)
        let func = reg.test(seed) ? 'getKeyAndIvV2' : 'getKeyAndIv'
        seed = seed.replace(reg, '')
        const [key, iv] = this[func](password)
        let srcs = CryptoJS.enc.Utf8.parse(seed)
        let encrypted = CryptoJS.AES.encrypt(srcs, key, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        })
        return encrypted.ciphertext.toString().toUpperCase()
    },
    async checkPassword(seed, password) {
        return new Promise((resolve, reject) => {
            let baseSeed = null
            try {
                baseSeed = this.getSeed(seed, password)
                if (!baseSeed._secretKey.length) {
                    baseSeed = null
                }
            } catch (error) {
                baseSeed = null
            }
            if (!baseSeed) {
                Base.globalToast.error(I18n.t('assets.passwordError'))
                reject()
                return
            }
            resolve(baseSeed)
        })
    },
    getSeed(localSeed, password) {
        let seed = this.decryptSeed(localSeed, password)
        seed = IotaObj.Converter.hexToBytes(seed)
        seed = Uint8Array.from(seed)
        return new IotaObj.Ed25519Seed(seed)
    },
    getLocalSeed(seed, password) {
        const localSeed = Array.from(seed._secretKey || seed)
        const localHex = IotaObj.Converter.bytesToHex(localSeed)
        let localHexNew = this.encryptSeed(`${localHex}${V2_FLAG}`, password)
        localHexNew = `${localHexNew}${V2_FLAG}`
        return localHexNew
    },
    changePassword(old, oldSeed, password) {
        const seed = this.getSeed(oldSeed, old)
        return this.getLocalSeed(seed, password)
    },
    async getGasLimit(configLimit, address, sendAmount) {
        const eth = this.client.eth
        let blockLimit = await eth.getBlock('latest')
        blockLimit = blockLimit?.gasLimit || 0
        configLimit = configLimit || blockLimit || 0
        const gasPrice = await eth.getGasPrice()
        const configFee = new BigNumber(gasPrice).times(configLimit)
        const blockFee = new BigNumber(gasPrice).times(blockLimit)
        let balance = await this.client.eth.getBalance(address)
        balance = new BigNumber(balance)
        sendAmount = new BigNumber(sendAmount)
        const configResidue = Number(balance.minus(sendAmount).minus(configFee))
        const blockResidue = Number(balance.minus(sendAmount).minus(blockFee))
        if (configResidue <= 0) {
            return { gasLimit: -1, gasPrice }
        } else if (blockResidue > 0) {
            return { gasLimit: blockLimit, gasPrice }
        } else {
            let gasLimit = parseInt(Number(balance.minus(sendAmount).div(gasPrice)))
            gasLimit = Math.max(gasLimit, configLimit)
            return { gasLimit, gasPrice }
        }
    },
    getNumberStr(num) {
        num = String(num)
        if (/e-/.test(num)) {
            num = Number(num)
            var m = num.toExponential().match(/\d(?:\.(\d*))?e([+-]\d+)/)
            return num.toFixed(Math.max(0, (m[1] || '').length - m[2]))
        } else if (/e\+/.test(num)) {
            num = Number(num)
            return num.toLocaleString('fullwide', { useGrouping: false })
        }
        return num
    },
    // /************************collect start***********************/
    async getWalletInfo(validAddresses) {
        const addresses = await Promise.all(validAddresses.map((e) => this.client.addressOutputs(e)))
        const addressInfos = await Promise.all(validAddresses.map((e) => this.client.address(e)))
        const total = { outputIds: [] }
        total.balance = new BigNumber(0)
        const decimal = Math.pow(10, IotaSDK.curNode.decimal)
        const arr = validAddresses.map((e, i) => {
            const balance = addressInfos[i]?.balance
            const outputIds = addresses[i]?.outputIds || []
            total.outputIds = [...total.outputIds, ...outputIds]
            total.balance = total.balance.plus(balance)
            return {
                address: e,
                outputIds,
                balance: addressInfos[i]?.balance,
                balanceMIOTA: Number(new BigNumber(balance).div(decimal))
            }
        })
        total.balanceMIOTA = Number(total.balance.div(decimal))
        total.balance = Number(total.balance)
        return [arr, total]
    },
    _collectedList: [],
    _collectingList: [],
    _stopCollect: false,
    _isSend: false,
    async collectByOutputIds(validAddresses, curWallet, callBack) {
        const getIds = async () => {
            const [, total] = await this.getWalletInfo(validAddresses)
            let outputIds = total?.outputIds || []
            const maxLimit = 100
            return outputIds.filter((e) => !this._collectedList.includes(e)).slice(0, maxLimit)
        }
        const collect = async (ids) => {
            this._stopCollect = false
            this._collectingList = []
            if (ids.length === 0) {
                callBack(this._collectedList)
                return
            }
            const outputsRes = await Promise.all(ids.map((e) => this.client.output(e)))
            let amount = BigNumber(0)
            outputsRes.forEach((e, i) => {
                const id = ids[i]
                if (!e.isSpent && e.output.amount > 0) {
                    amount = amount.plus(e.output.amount)
                    this._collectingList.push(id)
                } else {
                    if (this._collectedList.includes(id)) {
                        this._collectedList.push(id)
                    }
                }
            })
            if (this._stopCollect) {
                callBack(this._collectedList)
                return
            }
            this._isSend = true
            try {
                await this.send(curWallet, curWallet.address, Number(amount), { isCollection: true })
                this._collectingList.forEach((e) => {
                    if (!this._collectedList.includes(e)) {
                        this._collectedList.push(e)
                    }
                })
                this._collectingList = []
                this._isSend = false
                const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
                await sleep(2000)
                callBack(this._collectedList)
                const ids = await getIds()
                collect(ids)
            } catch (error) {
                this._collectingList = []
                this._isSend = false
                const ids = await getIds()
                collect(ids)
            }
        }
        if (this._isSend) {
            setTimeout(() => {
                this.collectByOutputIds(validAddresses, curWallet, callBack)
            }, 1000)
        } else {
            const ids = await getIds()
            collect(ids)
        }
    },
    stopCollect() {
        this._stopCollect = true
    },
    /************************collect end**********************/
    async send(fromInfo, toAddress, sendAmount, ext) {
        if (!this.client) {
            return Base.globalToast.error(I18n.t('user.nodeError'))
        }
        const { seed, address, password, nodeId } = fromInfo
        const baseSeed = this.getSeed(seed, password)
        const nodeInfo = this.nodes.find((e) => e.id === nodeId) || {}
        let actionTime = new Date().getTime()
        let traceToken = ''
        if (this.checkWeb3Node(nodeId)) {
            let sendAmountHex = this.getNumberStr(sendAmount)
            sendAmountHex = this.client.utils.toHex(sendAmountHex)
            const eth = this.client.eth

            const nonce = await eth.getTransactionCount(address)
            const { contract, token } = ext || {}
            let res = null
            const privateKey = await this.getPrivateKey(seed, password)
            if (contract) {
                const contractInfo = (nodeInfo.contractList || []).find((e) => e.token === token)
                if (!contractInfo) {
                    return Base.globalToast.error('contract error')
                }
                const web3Contract = new eth.Contract(tokenAbi, contractInfo.contract)
                const contractGasLimit = contractInfo?.gasLimit
                const { gasLimit } = await this.getGasLimit(contractGasLimit, address, 0)
                if (gasLimit === -1) {
                    return Base.globalToast.error(I18n.t('assets.balanceError'))
                }
                // const estimatePrice = this.client.utils
                const signData = {
                    to: contractInfo.contract,
                    value: '0x00',
                    from: address,
                    nonce,
                    gasLimit,
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
                traceToken = token
                Trace.transaction(
                    'pay',
                    res.transactionHash,
                    address,
                    toAddress,
                    this.getNumberStr(sendAmount),
                    nodeId,
                    token
                )
            } else {
                const chainId = await eth.getChainId()
                const nodeGasLimit = nodeInfo?.gasLimit
                const { gasLimit, gasPrice } = await this.getGasLimit(nodeGasLimit, address, sendAmount)
                if (gasLimit === -1) {
                    return Base.globalToast.error(I18n.t('assets.balanceError'))
                }
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
                traceToken = nodeInfo.token
                Trace.transaction(
                    'pay',
                    res.transactionHash,
                    address,
                    toAddress,
                    this.getNumberStr(sendAmount),
                    nodeId,
                    nodeInfo.token
                )
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
            actionTime = new Date().getTime() - actionTime
            Trace.actionLog(40, address, actionTime, Base.curLang, nodeId, traceToken)
            return { ...res, messageId: logData.transactionHash }
        } else {
            const { taggedData } = ext || {}
            const amount = Base.formatNum(BigNumber(sendAmount).div(this.IOTA_MI))
            let sendOut = null
            try {
                sendOut = await IotaObj.sendMultiple(
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
                        key: IotaObj.Converter.utf8ToBytes('TanglePay'), //v1
                        tag: IotaObj.Converter.utf8ToBytes('TanglePay'), //v2
                        data: taggedData
                            ? IotaObj.Converter.utf8ToBytes(taggedData)
                            : IotaObj.Converter.utf8ToBytes(
                                  JSON.stringify({
                                      from: address, //main address
                                      to: toAddress,
                                      amount: sendAmount,
                                      collection: ext?.isCollection ? 1 : 0
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

            Trace.transaction('pay', messageId, address, toAddress, sendAmount, nodeId, nodeInfo.token)
            actionTime = new Date().getTime() - actionTime
            Trace.actionLog(40, address, actionTime, Base.curLang, nodeId, nodeInfo.token)
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
        const nodeInfo = this.nodes.find((e) => e.id === nodeId) || {}
        let actionTime = new Date().getTime()
        if (this.checkWeb3Node(nodeId)) {
            if (this.client?.eth) {
                let list = await this.getPastLogs(address, nodeId)
                actionTime = new Date().getTime() - actionTime
                Trace.actionLog(20, address, actionTime, Base.curLang, nodeId, nodeInfo.token)
                return list
            }
            return []
        } else {
            let allList = []
            if (this.checkSMR(nodeId)) {
                let outputDatas = await Promise.all(outputList.map((e) => this.client.output(e)))
                const blockDatas = await Promise.all(outputDatas.map((e) => this.client.block(e.metadata.blockId)))
                allList = outputDatas.map((e, i) => {
                    const { milestoneTimestampBooked, blockId } = e.metadata
                    const blockData = blockDatas[i]
                    const unlockBlocks = blockData?.payload?.unlocks || []
                    const unlockBlock = unlockBlocks.find((e) => e.signature)
                    return {
                        timestamp: milestoneTimestampBooked,
                        blockId,
                        decimal: nodeInfo.decimal,
                        unlockBlock,
                        bech32Address: address,
                        output: e.output
                    }
                })
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
                milestoneList.forEach((e, i) => {
                    const { isSpent, output, transactionId, outputIndex, messageId } = newOutputDatas[i]
                    const { payload } = transactionFrom[i]
                    const outputAddress = output.address.address
                    let payloadData = payload?.essence?.payload?.data
                    let payloadIndex = payload?.essence?.payload?.index
                    const unlockBlocks = payload?.unlockBlocks || []
                    const unlockBlock = unlockBlocks.find((e) => e.signature)
                    try {
                        payloadIndex = IotaObj.Converter.hexToUtf8(payloadIndex)
                    } catch (error) {
                        payloadIndex = ''
                    }
                    try {
                        if (payloadIndex === 'PARTICIPATE') {
                            payloadData = [...IotaObj.Converter.hexToBytes(payloadData)]
                            payloadData.shift()
                            payloadData = _chunk(payloadData, 33)
                            payloadData = payloadData.map((e) => {
                                e.pop()
                                return IotaObj.Converter.bytesToHex(Uint8Array.from(e))
                            })
                        } else {
                            payloadData = IotaObj.Converter.hexToUtf8(payloadData)
                            payloadData = JSON.parse(payloadData)
                        }
                    } catch (error) {
                        payloadData = payload?.essence?.payload?.data || {}
                    }
                    allList.push({
                        ...e,
                        messageId,
                        decimal: this.curNode?.decimal,
                        isSpent,
                        transactionId,
                        token: this.curNode?.token,
                        address: outputAddress,
                        outputIndex,
                        output,
                        bech32Address: this.hexToBech32(outputAddress),
                        amount: output.amount,
                        inputs: payload?.essence?.inputs,
                        payloadIndex,
                        payloadData,
                        outputs: payload?.essence?.outputs.map((d) => {
                            return {
                                ...d,
                                bech32Address: this.hexToBech32(d.address.address)
                            }
                        }),
                        unlockBlock
                    })
                })
                allList.sort((a, b) => a.timestamp - b.timestamp)
                actionTime = new Date().getTime() - actionTime
                Trace.actionLog(20, address, actionTime, Base.curLang, nodeId, nodeInfo.token)
            }
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
        const apiUrl = this._nodes.find((e) => e.id === 1)?.url
        url = `${apiUrl}/api/plugins/participation/${url}`
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
        if (!/^iota/.test(address)) {
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
        let eventsRes = await this.requestEventsByIds(eventIds)
        let events = []
        eventsRes.forEach((e, i) => {
            if (e?.payload?.type == 1) {
                events.push({
                    ...e,
                    id: eventIds[i]
                })
            }
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
                datas = [...datas, ...IotaObj.Converter.hexToBytes(e.eventId), 0]
            })
            datas.unshift(tokens.length)
        }
        datas = Uint8Array.from(datas)
        const res = await IotaObj.sendMultiple(
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
                key: IotaObj.Converter.utf8ToBytes('PARTICIPATE'),
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
        const { seed, password } = wallet
        if (this.checkWeb3Node(wallet.nodeId)) {
            if (!this.client?.eth) {
                return false
            }
            const privateKey = await this.getPrivateKey(seed, password)
            signRes = await this.client.eth.accounts.sign(content, privateKey)
            signRes = signRes.messageHash
        } else {
            const baseSeed = this.getSeed(seed, password)
            const addressKeyPair = this.getPair(baseSeed)
            signRes = IotaObj.Ed25519.sign(addressKeyPair.privateKey, IotaObj.Converter.utf8ToBytes(content))
        }
        return signRes
    },
    async sign(content, wallet, amount) {
        const { seed, password, address } = wallet
        const baseSeed = this.getSeed(seed, password)
        const res = await IotaObj.sendMultiple(
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
                key: IotaObj.Converter.utf8ToBytes('TanglePay.Sign'),
                data: IotaObj.Converter.utf8ToBytes(content)
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
        const ethAddressList = []
        const iotaAddressList = []
        addressList.forEach((e) => {
            if (/^0x/i.test(e)) {
                ethAddressList.push(e)
            } else {
                iotaAddressList.push(e)
            }
        })
        let actionTime = new Date().getTime()
        const list = _chunk(iotaAddressList, 10)
        let res = await Promise.all(
            list.map((e) => {
                return soon.getNftsByIotaAddress(e)
            })
        )
        res = _flatten(res)
        let ethRes = await Promise.all(
            ethAddressList.map((e) => {
                return soon.getNftsByEthAddress(e)
            })
        )
        ethRes = _flatten(ethRes)
        res = [...res, ...ethRes]

        actionTime = new Date().getTime() - actionTime
        const nodeId = this.curNode?.id
        if (nodeId) {
            Trace.actionLog(50, addressList[0], actionTime, Base.curLang, nodeId, this.curNode?.token)
        }
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
    async importPrivateKey({ privateKey, name, password }) {
        return new Promise(async (resolve, reject) => {
            if (!this.client || !this.isWeb3Node) {
                Base.globalToast.error(I18n.t('user.nodeError'))
                reject()
                return
            }
            privateKey = privateKey.replace(/\ +/g, '').replace(/[\r\n]/g, '')
            if (!/^0x/.test(privateKey)) {
                privateKey = '0x' + privateKey
            }
            try {
                const account = this.client.eth.accounts.privateKeyToAccount(privateKey)
                const address = account.address
                const isDuplicate = await this.checkImport(address)
                if (isDuplicate) {
                    Base.globalToast.error(I18n.t('account.importDuplicate'))
                    reject()
                    return
                }
                const seed = this.getSeedFromPrivateKey(privateKey, password)
                const uuid = Base.guid()
                Trace.createWallet(uuid, name, address)
                resolve({
                    address,
                    name,
                    isSelected: true,
                    password,
                    id: uuid,
                    nodeId: this.curNode?.id,
                    seed: this.getLocalSeed(seed, password),
                    bech32HRP: this.curNode?.bech32HRP
                })
            } catch (error) {
                Base.globalToast.error(String(error))
                reject()
            }
        })
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
            oldList = _uniqBy(oldList, 'transactionHash')
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
    async getPrivateKey(seed, password) {
        let baseSeed = await this.checkPassword(seed, password)
        baseSeed = baseSeed?._secretKey
        let passwordHex = ethereumjsUtils.fromUtf8(password).replace(/^0x/, '')
        if (passwordHex.length % 2) {
            passwordHex += '0'
        }
        let hex = ethereumjsUtils.bufferToHex(baseSeed)
        const re = new RegExp(passwordHex + '$')
        if (re.test(hex)) {
            return hex.replace(re, '')
        } else {
            const hdWallet = ethereumjsHdkey.fromMasterSeed(baseSeed)
            const key = hdWallet.derivePath("m/44'/60'/0'/0/0")
            let privateKey = ethereumjsUtils.bufferToHex(key._hdkey._privateKey)
            return privateKey
        }
    },
    getSeedFromPrivateKey(privateKey, password) {
        let passwordHex = ethereumjsUtils.fromUtf8(password).replace(/^0x/, '')
        if (passwordHex.length % 2) {
            passwordHex += '0'
        }
        const buffer = ethereumjsUtils.toBuffer(`${privateKey}${passwordHex}`)
        return buffer
    },
    async getContractAssets(nodeId, address, walletId) {
        const nodeInfo = this.nodes.find((e) => e.id === nodeId)
        if (!nodeInfo?.contractList?.length) {
            return []
        }
        let actionTime = new Date().getTime()
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
            Trace.updateAddressAmount(walletId, address, e, nodeId, token)
            return {
                token,
                balance: Number(BigNumber(e).div(Math.pow(10, decimals[i]))),
                realBalance: e,
                contract: true,
                decimal: decimals[i]
            }
        })
        actionTime = new Date().getTime() - actionTime
        const traceToken = nodeInfo.contractList.map((e) => e.token).join('-')
        Trace.actionLog(10, address, actionTime, Base.curLang, nodeId, traceToken)
        return balanceList
    },
    /**************** web3 end *******************/
    /**************** SMR start *******************/
    SMR_NODE_ID: 101,
    checkSMR(nodeId) {
        return nodeId == SMR_NODE_ID
    },
    async importSMRBySeed(seed, password) {
        const baseSeed = await this.checkPassword(seed, password)
        const addressKeyPair = this.getPair(baseSeed)
        const indexEd25519Address = new IotaObj.Ed25519Address(addressKeyPair.publicKey)
        const indexPublicKeyAddress = indexEd25519Address.toAddress()
        const bech32Address = this.hexToBech32(indexPublicKeyAddress)
        const isDuplicate = await this.checkImport(bech32Address)
        if (isDuplicate) {
            Base.globalToast.error(I18n.t('account.importDuplicate'))
            reject()
            return
        }
        const uuid = Base.guid()
        const walletsList = await this.getWalletList()
        let len = walletsList.length || 0
        const name = `wallet ${len + 1}`
        Trace.createWallet(uuid, name, bech32Address, this.curNode?.id, this.curNode?.token)
        // encrypt the seed and save to local storage
        return {
            address: bech32Address,
            name,
            isSelected: true,
            password,
            id: uuid,
            nodeId: this.curNode?.id,
            seed: this.getLocalSeed(baseSeed, password),
            bech32HRP: this.info?.bech32HRP
        }
    },
    // gen 4218 ——> gen 4219 ——> 4218 to 4219
    async claimSMR(fromInfo) {
        const { seed, password } = fromInfo
        Base.globalToast.showLoading()
        let res = {}
        let smr4218, smr4218Balance, smr4219
        try {
            const baseSeed = await this.checkPassword(seed, password)
            IotaObj.setIotaBip44BasePath("m/44'/4218'")
            smr4218 = await this.importSMRBySeed(seed, password)
            smr4218Balance = await IotaObj.getBalance(this.client, baseSeed, 0, {
                startIndex: 0,
                zeroCount: 20
            })
            IotaObj.setIotaBip44BasePath("m/44'/4219'")
            smr4219 = await this.importSMRBySeed(seed, password)
            IotaObj.setIotaBip44BasePath("m/44'/4218'")
        } catch (error) {
            res = { code: -1 }
        }
        try {
            Base.globalToast.showLoading()
            await this.send(smr4218, smr4219.address, Number(smr4218Balance))
            res = { code: 200, amount: Number(smr4218Balance), addressInfo: smr4219 }
        } catch (error) {
            res = { code: 1 }
        }
        Base.globalToast.hideLoading()
        IotaObj.setIotaBip44BasePath("m/44'/4219'")
        return res
    },
    async getAllSMROutputIds(addressBech32) {
        if (this.IndexerPluginClient) {
            let response
            let cursor
            let outputIds = []
            do {
                response = await this.IndexerPluginClient.outputs({ addressBech32, cursor })
                outputIds = [...outputIds, ...response.items]
                cursor = response.cursor
            } while (cursor && response.items.length > 0)
            return outputIds
        }
        return []
    }
    /**************** SMR end *******************/
}

export default IotaSDK
