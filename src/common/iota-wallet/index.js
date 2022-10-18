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
const shimmerTestnet = {
    id: 101,
    explorer: 'https://explorer.shimmer.network/testnet',
    url: 'https://test.shimmer.node.tanglepay.com',
    name: 'Shimmer Beta',
    enName: 'Shimmer Beta',
    deName: 'Shimmer Beta',
    zhName: 'Shimmer 测试網絡',
    type: 3,
    mqtt: 'wss://api.testnet.shimmer.network:443/api/mqtt/v1',
    network: 'testnet',
    bech32HRP: 'rms',
    token: 'RMS',
    filterMenuList: ['staking'],
    filterAssetsList: ['stake', 'soonaverse'],
    decimal: 6,
    explorerApiUrl: 'https://explorer-api.shimmer.network/stardust'
}
const iotaTestnet = {
    id: 2,
    url: 'https://api.lb-0.h.chrysalis-devnet.iota.cafe',
    name: 'IOTA Devnet',
    enName: 'IOTA Devnet',
    deName: 'IOTA Devnet',
    zhName: 'IOTA 测试網絡',
    type: 1,
    mqtt: 'wss://api.lb-0.h.chrysalis-devnet.iota.cafe:443/mqtt',
    network: 'devnet',
    bech32HRP: 'atoi',
    token: 'IOTA',
    filterMenuList: [],
    filterAssetsList: [],
    decimal: 6,
    explorer: 'https://thetangle.org',
    explorerApiUrl: 'https://explorer-api.iota.org'
}
const initNodeList = [
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
        decimal: 6,
        explorerApiUrl: 'https://explorer-api.iota.org'
    },
    {
        id: 102,
        explorer: 'https://explorer.shimmer.network/shimmer',
        url: 'https://mainnet.shimmer.node.tanglepay.com',
        name: 'Shimmer Mainnet',
        enName: 'Shimmer Mainnet',
        deName: 'Shimmer Mainnet',
        zhName: 'Shimmer 主網',
        type: 3,
        mqtt: 'wss://api.mainnet.shimmer.network:443/api/mqtt/v1',
        network: 'shimmer',
        bech32HRP: 'smr',
        token: 'SMR',
        filterMenuList: ['staking'],
        filterAssetsList: ['stake', 'soonaverse'],
        decimal: 6,
        explorerApiUrl: 'https://explorer-api.shimmer.network/stardust'
    },
    {
        id: 5,
        url: 'https://evm.wasp.sc.iota.org/',
        explorer: 'https://explorer.wasp.sc.iota.org',
        name: 'IOTA EVM',
        enName: 'IOTA EVM',
        deName: 'IOTA EVM',
        zhName: 'IOTA EVM',
        type: 2,
        network: 'iota-evm',
        bech32HRP: 'iota-evm',
        token: 'TEST',
        filterMenuList: ['apps', 'staking'],
        filterAssetsList: ['stake'],
        contractList: [
            {
                contract: '0x903fE58170A44CF0D0eb5900d26cDedEA802635C',
                token: 'TPT',
                gasLimit: 0,
                maxPriorityFeePerGas: 0
            }
        ],
        decimal: 18,
        gasLimit: 0
    },
    {
        id: 4,
        url: 'https://bsc-dataseed.binance.org/',
        explorer: 'https://bscscan.com',
        name: 'BSC',
        enName: 'BSC',
        deName: 'BSC',
        zhName: 'BSC',
        type: 2,
        network: 'bsc',
        bech32HRP: 'bsc',
        token: 'BNB',
        filterMenuList: ['apps', 'staking'],
        filterAssetsList: ['stake'],
        contractList: [
            {
                contract: '0x55d398326f99059ff775485246999027b3197955',
                token: 'USDT',
                gasLimit: 21000,
                maxPriorityFeePerGas: 0
            }
        ],
        decimal: 18,
        gasLimit: 21000
    }
]
const IotaSDK = {
    IOTA_NODE_ID,
    checkIota(nodeId) {
        const nodeInfo = this.nodes.find((e) => e.id == nodeId)
        return nodeInfo?.type == 1
    },
    IOTA_MI: 1000000, // 1mi = 1000000i
    convertUnits(value, fromUnit, toUnit) {
        return convertUnits(value, fromUnit, toUnit)
    },
    changeIota(nodeId) {
        if (this.checkSMR(nodeId)) {
            IotaObj = IotaNext
            IotaObj.setIotaBip44BasePath("m/44'/4219'")
        } else {
            IotaObj = Iota
        }
        this.explorerApiUrl = this.nodes.find((e) => e.id == nodeId)?.explorerApiUrl || 'https://explorer-api.iota.org'
    },
    // type:1.iota, 2.web3, 3.shimmer
    // filterMenuList:['assets','apps','staking','me']
    // filterAssetsList: ['stake', 'soonaverse']
    _nodes: [...initNodeList],
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
                e.name = e[`${lang}Name`] || e.name
            })
        }
    },
    get mnemonicLenList() {
        return this.isWeb3Node ? [12, 24] : [24]
    },
    async getDlt(node) {
        return new Promise((resolve, reject) => {
            fetch(`https://dlt.green/api?dns=${node}&id=tanglepay&token=egm9jvee56sfjrohylvs0tkc6quwghyo`)
                .then((res) => res.json())
                .then((res) => {
                    resolve(res)
                })
                .catch((err) => {
                    reject(err)
                })
        })
    },
    async getNodes() {
        try {
            let res = await fetch(`${API_URL}/evm.json?v=${new Date().getTime()}`)
            res = await res.json()
            const _nodes = [...initNodeList]
            res.forEach((e) => {
                const index = _nodes.findIndex((d) => d.id == e.id)
                if (index >= 0) {
                    _nodes[index] = e
                } else {
                    _nodes.push(e)
                }
                ;(e.contractList || []).forEach((d) => {
                    if (d.isShowZero) {
                        this._contracAssetsShowDic[d.contract] = true
                    }
                })
            })

            //advanced start
            const shimmerSupport = await Base.getLocalData('common.shimmerSupport')
            const iotaSupport = await Base.getLocalData('common.iotaSupport')
            if (shimmerSupport == 1 && !_nodes.find((e) => e.id == 101)) {
                _nodes.push(shimmerTestnet)
            }
            if (iotaSupport == 1 && !_nodes.find((e) => e.id == 2)) {
                _nodes.push(iotaTestnet)
            }
            //advanced end

            // check start
            if (Base.getClientType() === 'IOS') {
                const version = Base.getVersion()
                const versionRes = await fetch(`${API_URL}/switchConfig.json?v=${new Date().getTime()}`).then((res) =>
                    res.json()
                )
                const isCheck = version == versionRes.checkVersion
                if (isCheck) {
                    _nodes.forEach((e) => {
                        if (!e.filterMenuList.includes('apps')) {
                            e.filterMenuList.push('apps')
                        }
                        if (!e.filterAssetsList.includes('soonaverse')) {
                            e.filterAssetsList.push('soonaverse')
                        }
                    })
                }
            }
            // check end

            let shimmerInfo = _nodes.find((e) => e.bech32HRP === 'smr')
            if (!shimmerInfo) {
                shimmerInfo = _nodes.find((e) => e.bech32HRP === 'rms')
            }
            if (shimmerInfo) {
                this.SMR_NODE_ID = shimmerInfo.id
            }
            // node router start
            try {
                // const dltList = await Promise.all([this.getDlt('shimmer'), this.getDlt('iota')])
                const dltList = await Promise.all([this.getDlt('shimmer')])
                const iotaList = []
                const shimmerRmsList = []
                const shimmerSmrList = []
                for (const i in dltList[0]) {
                    const info = dltList[0][i]
                    const { ShimmerHornet } = info
                    if (
                        ShimmerHornet.Features.includes('pow') &&
                        ShimmerHornet.BaseToken.name == 'Shimmer' &&
                        ShimmerHornet.isHealthy
                    ) {
                        const bech32Hrp = ShimmerHornet.Protocol.bech32Hrp
                        if (bech32Hrp == 'rms') {
                            shimmerRmsList.push({ ...info, curNodeKey: `dlt.green:${i}` })
                        } else if (bech32Hrp === 'smr') {
                            shimmerSmrList.push({ ...info, curNodeKey: `dlt.green:${i}` })
                        }
                    }
                }
                // iota
                // for (const i in dltList[1]) {
                //     const info = dltList[1][i]
                //     const { IotaHornet } = info
                //     if (
                //         IotaHornet.Features.includes('PoW') &&
                //         IotaHornet.Features.includes('Participation') &&
                //         IotaHornet.bech32Hrp == 'iota' &&
                //         IotaHornet.isHealthy
                //     ) {
                //         iotaList.push({ ...info, curNodeKey: `dlt.green:${i}` })
                //     }
                // }
                const selectNode = async (list) => {
                    list.sort((a, b) => a['dlt.green'].PoolRank - b['dlt.green'].PoolRank)
                    list = list.slice(0, 10)
                    const index = parseInt(Math.random() * list.length)
                    let info = null
                    if (list[index]) {
                        const select = list[index]
                        const Domain = select?.ShimmerHornet?.Domain || select?.IotaHornet?.Domain
                        if (Domain) {
                            const url = `https://${Domain}`
                            let client = null
                            if (select?.ShimmerHornet) {
                                client = new IotaNext.SingleNodeClient(url)
                            } else {
                                client = new Iota.SingleNodeClient(url)
                            }
                            if (client) {
                                const clientInfo = await client.info()
                                if (clientInfo?.status?.isHealthy || clientInfo?.isHealthy) {
                                    info = select
                                }
                            }
                        }
                    }
                    return info
                }
                // shimmer rms
                if (shimmerRmsList.length > 0) {
                    const selectInfo = await selectNode(shimmerRmsList)
                    const info = _nodes.find((e) => e.bech32HRP === 'rms')
                    if (info && selectInfo?.ShimmerHornet) {
                        info.url = `https://${selectInfo.ShimmerHornet.Domain}`
                        info.curNodeKey = selectInfo.curNodeKey
                        info.mqtt = `wss://${selectInfo.ShimmerHornet.Domain}:${selectInfo.ShimmerHornet.Port}/api/mqtt/v1`
                    }
                }
                // shimmer smr
                if (shimmerSmrList.length > 0) {
                    const selectInfo = await selectNode(shimmerSmrList)
                    const info = _nodes.find((e) => e.bech32HRP === 'smr')
                    if (info && selectInfo?.ShimmerHornet) {
                        info.url = `https://${selectInfo.ShimmerHornet.Domain}`
                        info.curNodeKey = selectInfo.curNodeKey
                        info.mqtt = `wss://${selectInfo.ShimmerHornet.Domain}:${selectInfo.ShimmerHornet.Port}/api/mqtt/v1`
                    }
                }
                // iota
                if (iotaList.length > 0) {
                    const selectInfo = await selectNode(iotaList)
                    const info = _nodes.find((e) => e.bech32HRP === 'iota')
                    if (info && selectInfo?.IotaHornet) {
                        info.url = `https://${selectInfo.IotaHornet.Domain}`
                        info.curNodeKey = selectInfo.curNodeKey
                        info.mqtt = `wss://${selectInfo.IotaHornet.Domain}:${selectInfo.IotaHornet.Port}/mqtt`
                    }
                }
            } catch (error) {
                console.log(error, '----')
            }
            // node router end

            this._nodes = _nodes
            const curNodeId = await Base.getLocalData('common.curNodeId')
            if (!_nodes.find((e) => e.id == curNodeId)) {
                Base.setLocalData('common.curNodeId', '')
            }
            Base.setLocalData('tanglePayNodeList', {
                list: _nodes
            })
        } catch (error) {
            console.log(error)
        }
    },
    hasStake(nodeId) {
        return !(this.nodes.find((e) => e.id == nodeId)?.filterAssetsList || []).includes('stake')
    },
    // token price
    priceDic: {},
    explorerApiUrl: 'https://explorer-api.iota.org',
    async init(id) {
        this.changeIota(id)
        Base.globalToast.showLoading()
        const curNode = this.nodes.find((e) => e.id == id) || this.nodes[0]
        try {
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
                        Base.globalToast.error(I18n.t('user.nodeError') + ':' + (curNode.curNodeKey || curNode.name))
                    })
                }
            } else {
                if (this.checkIota(id)) {
                    this.client = new IotaObj.SingleNodeClient(curNode.url)
                    this.IndexerPluginClient = null
                } else {
                    this.client = new IotaObj.SingleNodeClient(curNode.url, {
                        // powProvider: new IotaObj.LocalPowProvider()
                    })
                    this.IndexerPluginClient = new IotaObj.IndexerPluginClient(this.client)
                }
                this.mqttClient = new IotaObj.MqttClient(curNode.mqtt)
                this.info = await this.client.info()
            }
            Base.globalToast.hideLoading()
        } catch (error) {
            console.log(error)
            Base.globalToast.hideLoading()
            Base.globalToast.error(I18n.t('user.nodeError') + ':' + (curNode.curNodeKey || curNode.name))
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
                            self.refreshAssets()
                        }
                        this.web3Subscription = setTimeout(getData, 5000)
                    }
                    getData()
                }
            } else {
                if (this.mqttClient) {
                    if (this.mqttClient?.outputByConditionAndAddress) {
                        this.subscriptionId = this.mqttClient.blocksTransaction((topic, data) => {
                            const sender = (data?.payload?.unlocks || []).find((e) => {
                                const publicKey = e?.signature?.publicKey
                                return publicKey && this.publicKeyToBech32(publicKey) === address
                            })
                            let isReceiver = false
                            if (!sender) {
                                const outputs = data?.payload?.essence?.outputs || []
                                for (let i = 0; i < outputs.length; i++) {
                                    const unlockConditions = outputs[i]?.unlockConditions || []
                                    for (let j = 0; j < unlockConditions.length; j++) {
                                        const pubKeyHash = unlockConditions[j]?.address?.pubKeyHash
                                        if (pubKeyHash && this.hexToBech32(pubKeyHash) === address) {
                                            isReceiver = true
                                            break
                                        }
                                    }
                                    if (isReceiver) {
                                        break
                                    }
                                }
                            }
                            if (sender || isReceiver) {
                                if (Base.globalDispatch) {
                                    Base.globalDispatch({
                                        type: 'common.isRequestAssets',
                                        data: false
                                    })
                                }
                                setTimeout(() => {
                                    self.refreshAssets()
                                }, 8000)
                            }
                        })
                    } else {
                        this.subscriptionId = this.mqttClient.addressOutputs(address, () => {
                            try {
                                if (this.isNeedRestake == 1) {
                                    this.isNeedRestake = 2
                                }
                                if (this.isAwaitStake == 1) {
                                    this.isAwaitStake = 2
                                }
                                self.refreshAssets()
                            } catch (error) {
                                console.log(error)
                            }
                        })
                    }
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
                Base.globalToast.error(
                    I18n.t('user.nodeError') + ':' + (this?.curNode?.curNodeKey || this?.curNode?.name)
                )
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
                        Base.setLocalData(`valid.addresses.${address}`, [address])
                        resolve({
                            address,
                            name,
                            isSelected: true,
                            password,
                            id: uuid,
                            nodeId: this.curNode?.id,
                            seed: this.getLocalSeed(baseSeed, password),
                            bech32HRP: this.curNode?.bech32HRP,
                            // publicKey:ethereumjsUtils.bufferToHex(key._hdkey._publicKey)
                            publicKey: ethereumjsUtils.bufferToHex(
                                ethereumjsUtils.privateToPublic(key._hdkey._privateKey)
                            )
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
                        Base.setLocalData(`valid.addresses.${bech32Address}`, [bech32Address])
                        // encrypt the seed and save to local storage
                        resolve({
                            address: bech32Address,
                            name,
                            isSelected: true,
                            password,
                            id: uuid,
                            nodeId: this.curNode?.id,
                            seed: this.getLocalSeed(baseSeed, password),
                            bech32HRP: this.info?.bech32HRP,
                            publicKey: ethereumjsUtils.bufferToHex(addressKeyPair.publicKey)
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
        } else {
            list = (await Base.getSensitiveInfo(key)) || []
        }
        list = list.filter((d) => this.nodes.find((e) => e.id == d.nodeId))
        return list
    },
    bytesToHex(bytes) {
        return IotaObj.Converter.bytesToHex(bytes)
    },
    async seedToPublicKey({ localSeed, password, nodeId }) {
        if (this.checkWeb3Node(nodeId)) {
            const privateKey = await this.getPrivateKey(localSeed, password)
            const publicKey = ethereumjsUtils.privateToPublic(ethereumjsUtils.toBuffer(privateKey))
            return ethereumjsUtils.bufferToHex(publicKey)
        } else {
            const seed = this.getSeed(localSeed, password)
            const addressKeyPair = IotaSDK.getPair(seed)
            return IotaSDK.bytesToHex(addressKeyPair.publicKey)
        }
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

        let hisRes = []
        let smrOutputIds = []
        if (this.checkSMR(this.curNode?.id)) {
            hisRes = await Promise.all(
                addressList.map((e) => {
                    return Http.GET(`${this.explorerApiUrl}/transactionhistory/${this.curNode.network}/${e}`, {
                        isHandlerError: true,
                        pageSize: 100,
                        sort: 'newest'
                    })
                })
            )
            hisRes.forEach((e, i) => {
                list = []
                const smrHisOutputIds = (e?.items || []).map((e) => e)
                outputs[i] = smrHisOutputIds
                smrOutputIds = [...smrOutputIds, ...smrHisOutputIds]
            })
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
                const smrHisOutputIds = (hisRes[i]?.items || []).map((e) => e)
                smrOutputIds = [...smrOutputIds, ...smrHisOutputIds]
            })
        }
        return { list, outputs, smrOutputIds }
    },
    // cache valid address
    async getValidAddresses({ seed, password, address, nodeId }) {
        let addressList = [address]
        let outputIds = []
        let smrOutputIds = []
        if (seed) {
            if (this.checkWeb3Node(nodeId)) {
                addressList = [address]
            } else {
                let actionTime = new Date().getTime()
                if (!password || /^password_/.test(password)) {
                    const addressList = (await Base.getLocalData(`valid.addresses.${address}`)) || []
                    let addressOutputsRes = await this.getAllOutputIds(addressList)
                    const addressOutputs = addressOutputsRes?.outputs || []

                    addressList.forEach((e, i) => {
                        if (addressOutputs[i].length > 0) {
                            addressOutputs[i].forEach((c) => {
                                if (!outputIds.includes(c)) {
                                    outputIds.push(c)
                                }
                            })
                        }
                    })
                    smrOutputIds = addressOutputsRes?.smrOutputIds || []
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
                        let flag = false
                        let addressOutputsRes = await this.getAllOutputIds(temAddress)
                        let addressOutputs = addressOutputsRes?.outputs || []
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
                        smrOutputIds = addressOutputsRes?.smrOutputIds || []
                        if (!flag) {
                            num++
                        }
                        if (num < LIMIT) {
                            await getAddressList(accountState)
                        }
                    }
                    await getAddressList(accountState)
                    if (!addressList.includes(address)) {
                        addressList.unshift(address)
                    }
                }
                actionTime = new Date().getTime() - actionTime
                const nodeInfo = this.nodes.find((e) => e.id == nodeId) || {}
                Trace.actionLog(60, address, actionTime, Base.curLang, nodeId, nodeInfo.token)
            }
        }
        Base.setLocalData(`valid.addresses.${address}`, addressList)
        return { addressList, requestAddress: address, outputIds, smrOutputIds }
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
            return []
        }
        const node = IotaSDK.nodes.find((e) => e.id == nodeId)
        const token = node?.token
        const decimal = node?.decimal
        let realBalance = BigNumber(0)
        let balance = BigNumber(0)
        let realAvailable = BigNumber(0)
        let available = BigNumber(0)
        let actionTime = new Date().getTime()
        const smrTokens = {}
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
                    realAvailable = realAvailable.plus(e.available || 0)
                    if (e.availableNativeTokens) {
                        for (const i in e.availableNativeTokens) {
                            smrTokens[i] = smrTokens[i] || BigNumber(0)
                            smrTokens[i] = smrTokens[i].plus(e.availableNativeTokens[i])
                        }
                    }
                })
            } catch (error) {
                console.log(error)
            }
        }
        const tokens = Object.keys(smrTokens)
        const foundryList = await Promise.all(tokens.map((e) => this.foundry(e)))
        let availableNativeTokens = []
        tokens.forEach((e, i) => {
            const info = this.handleFoundry(foundryList[i])
            const { decimals, symbol } = info
            let realBalance = smrTokens[e]
            const balance = realBalance.div(Math.pow(10, decimals))
            realBalance = Number(smrTokens[e])
            availableNativeTokens.push({
                tokenId: e,
                realBalance,
                balance: Number(balance),
                decimal: decimals,
                token: symbol,
                isSMRToken: true,
                logoUrl: info.logoUrl
            })
        })

        actionTime = new Date().getTime() - actionTime
        Trace.actionLog(10, address, actionTime, Base.curLang, nodeId, token)

        balance = realBalance.div(Math.pow(10, decimal))
        realBalance = Number(realBalance)
        available = realAvailable.div(Math.pow(10, decimal))
        realAvailable = Number(realAvailable)
        Trace.updateAddressAmount(id, address, realBalance, nodeId, token)
        const contractAssets = await this.getContractAssets(nodeId, address, id)
        const balanceList = [
            {
                realBalance,
                balance: Number(balance),
                decimal,
                token,
                available,
                realAvailable
            },
            ...contractAssets,
            ...availableNativeTokens
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
        let seed = this.getSeed(oldSeed, old)

        // handle importPrivateKey change password start
        let passwordHex = ethereumjsUtils.fromUtf8(old).replace(/^0x/, '')
        if (passwordHex.length % 2) {
            passwordHex += '0'
        }
        let hex = ethereumjsUtils.bufferToHex(seed._secretKey || seed)
        const re = new RegExp(passwordHex + '$')
        if (re.test(hex)) {
            hex = hex.replace(re, '')
            seed = this.getSeedFromPrivateKey(hex, password)
        }
        // handle importPrivateKey change password end

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
        let addresses = []
        let addressInfos = []
        const curNodeId = this.curNode.id
        const isSMR = this.checkSMR(curNodeId)
        const isIOTA = this.checkIota(curNodeId)
        if (isIOTA) {
            addresses = await Promise.all(validAddresses.map((e) => this.client.addressOutputs(e)))
            addressInfos = await Promise.all(validAddresses.map((e) => this.client.address(e)))
        } else if (isSMR && this.IndexerPluginClient) {
            addressInfos = await Promise.all(validAddresses.map((e) => IotaObj.addressBalance(this.client, e)))
            addressInfos.forEach((e, i) => {
                e.balance = e.available
                addresses[i] = addresses[i] || {}
                addresses[i].outputIds = e.availableOutputIds
            })
        }
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
        const unit = isIOTA ? 'MIOTA' : isSMR ? 'SMR' : ''
        total.unit = unit
        return [arr, total]
    },
    _collectedList: [],
    _collectingList: [],
    _stopCollect: false,
    _isSend: false,
    async collectByOutputIds(validAddresses, curWallet, callBack) {
        const isSMR = this.checkSMR(curWallet.nodeId)
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
            let outputsRes = await Promise.all(ids.map((e) => this.client.output(e)))
            let amount = BigNumber(0)
            outputsRes.forEach((e, i) => {
                const id = ids[i]
                if (!isSMR) {
                    if (!e.isSpent && e.output.amount > 0) {
                        amount = amount.plus(e.output.amount)
                        this._collectingList.push(id)
                    } else {
                        if (this._collectedList.includes(id)) {
                            this._collectedList.push(id)
                        }
                    }
                } else {
                    if (IotaObj.checkOutput(e)) {
                        amount = amount.plus(e.output.amount)
                        this._collectingList.push(id)
                    } else {
                        if (this._collectedList.includes(id)) {
                            this._collectedList.push(id)
                        }
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
    async restakeAfterSend(data) {
        return new Promise((resolve, reject) => {
            let nums = 0
            const restakeHandle = setInterval(() => {
                nums++
                if (this.isNeedRestake == 2) {
                    this.isNeedRestake = 3
                    clearInterval(restakeHandle)
                    this.sendParticipateMessage(data)
                        .then((res) => {
                            this.isNeedRestake = null
                            resolve(res)
                        })
                        .catch((err) => {
                            this.isNeedRestake = null
                            reject(err)
                        })
                } else {
                    if (nums > 60) {
                        this.isNeedRestake = null
                        clearInterval(restakeHandle)
                        reject(null)
                    }
                }
            }, 500)
        })
    },
    async send(fromInfo, toAddress, sendAmount, ext) {
        if (!this.client) {
            return Base.globalToast.error(
                I18n.t('user.nodeError') + ':' + (this?.curNode?.curNodeKey || this?.curNode?.name)
            )
        }
        const { seed, address, password, nodeId } = fromInfo
        const baseSeed = this.getSeed(seed, password)
        const nodeInfo = this.nodes.find((e) => e.id == nodeId) || {}
        let actionTime = new Date().getTime()
        let traceToken = ''
        if (this.checkWeb3Node(nodeId)) {
            let sendAmountHex = this.getNumberStr(sendAmount)
            sendAmountHex = this.client.utils.toHex(sendAmountHex)
            const eth = this.client.eth

            const nonce = await eth.getTransactionCount(address)
            const { contract, token, taggedData } = ext || {}
            let res = null
            const privateKey = await this.getPrivateKey(seed, password)
            if (contract || taggedData) {
                const contractInfo = (nodeInfo.contractList || []).find((e) => e.token === token)
                if (!contractInfo) {
                    return Base.globalToast.error('contract error')
                }
                const web3Contract = new eth.Contract(tokenAbi, contractInfo.contract)
                const contractGasLimit = contractInfo?.gasLimit
                const { gasLimit } = await this.getGasLimit(contractGasLimit, address, 0)
                if (gasLimit === -1) {
                    return Base.globalToast.error(
                        I18n.t('assets.evmGasNotSufficient').replace(/{token}/, nodeInfo?.token)
                    )
                }
                // const estimatePrice = this.client.utils
                const signData = {
                    to: contractInfo.contract,
                    value: '0x00',
                    from: address,
                    nonce,
                    gasLimit,
                    data: taggedData || web3Contract.methods.transfer(toAddress, sendAmountHex).encodeABI()
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
                    return Base.globalToast.error(
                        I18n.t('assets.evmGasNotSufficient').replace(/{token}/, nodeInfo?.token)
                    )
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
            let sendOut = null
            let amount = 0
            const { taggedData, tokenId, decimal, token } = ext || {}
            // smr token
            if (tokenId) {
                amount = Base.formatNum(BigNumber(sendAmount).div(Math.pow(10, decimal || 6)))
                try {
                    sendOut = await this.SMRTokenSend(fromInfo, toAddress, sendAmount, ext)
                } catch (error) {
                    throw error
                }
            } else {
                amount = Base.formatNum(BigNumber(sendAmount).div(Math.pow(10, this.curNode.decimal || 6)))
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
            }
            const messageId = sendOut.messageId || sendOut.blockId
            // const blockData = await this.blockData(messageId)
            // if (!blockData) {
            //     throw 'Transaction failed.'
            // }
            // Save transfer output when the balance remindar is 0
            // Context: in IOTA sdk, when remaining balance is 0, it transfer operation is not included in the messages sent to Tangle.
            const outputs =
                _get(sendOut, 'message.payload.essence.outputs') || _get(sendOut, 'block.payload.essence.outputs') || []
            if (outputs.length === 1) {
                this.setSendList(address, {
                    id: messageId,
                    coin: this.checkIota(nodeId) ? 'IOTA' : token,
                    num: amount,
                    type: 1,
                    timestamp: parseInt(new Date().getTime() / 1000),
                    address: toAddress
                })
            }

            Trace.transaction(
                'pay',
                messageId,
                address,
                toAddress,
                sendAmount,
                nodeId,
                tokenId ? token : nodeInfo.token
            )
            actionTime = new Date().getTime() - actionTime
            Trace.actionLog(40, address, actionTime, Base.curLang, nodeId, tokenId ? token : nodeInfo.token)
            // restake start
            const isNoRestake = await Base.getLocalData('common.isNoRestake')
            // awaitTime: await ms
            const { residue, awaitStake } = ext || {}
            if (this.checkIota(nodeId) && !isNoRestake && residue > 0) {
                const participationEvents = await Base.getLocalData('staking.participationEvents')
                const { commencingList = [], upcomingList = [] } = participationEvents || {}
                const tokens = [...commencingList, ...upcomingList].map((e) => {
                    return {
                        eventId: e.id
                    }
                })
                if (tokens.length > 0) {
                    this.isNeedRestake = 1
                    const stakeInfo = {
                        wallet: { ...fromInfo },
                        tokens,
                        amount: residue,
                        type: 1
                    }
                    Base.globalToast.success(I18n.t('assets.sendSuccRestakeTips'))
                    if (awaitStake) {
                        if (Base.isBrowser) {
                            setTimeout(() => {
                                Base.globalToast.showLoading()
                            }, 2000)
                        }
                        try {
                            await this.restakeAfterSend(stakeInfo)
                            Base.globalToast.success(I18n.t('assets.restakeSuccTips'))
                            if (Base.isBrowser) {
                                setTimeout(() => {
                                    Base.globalToast.hideLoading()
                                }, 2000)
                            }
                        } catch (error) {
                            Base.globalToast.hideLoading()
                            console.log(error)
                        }
                    } else {
                        this.restakeAfterSend(stakeInfo)
                            .then((res) => {
                                Base.globalToast.success(I18n.t('assets.restakeSuccTips'))
                                if (Base.isBrowser) {
                                    setTimeout(() => {
                                        Base.globalToast.hideLoading()
                                    }, 2000)
                                }
                            })
                            .catch((error) => {
                                Base.globalToast.hideLoading()
                                console.log(error)
                            })
                    }
                } else {
                    Base.globalToast.success(I18n.t('assets.sendSucc'))
                    setTimeout(() => {
                        Base.globalToast.hideLoading()
                    }, 2000)
                }
            } else {
                if (!ext?.isCollection) {
                    Base.globalToast.success(I18n.t('assets.sendSucc'))
                    setTimeout(() => {
                        Base.globalToast.hideLoading()
                    }, 2000)
                }
            }
            // restake end
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
    // foundry
    async foundry(foundryId) {
        try {
            const localTokensConfig = (await Base.getLocalData('shimmer.tokensConfig')) || {}
            if (localTokensConfig[foundryId]) {
                return localTokensConfig[foundryId]
            }
            let foundryData = await this.IndexerPluginClient.foundry(foundryId)
            const outputId = foundryData.items[0] || ''
            if (!outputId) {
                return {}
            }
            const outputData = await this.client.output(outputId)
            localTokensConfig[foundryId] = outputData
            Base.setLocalData('shimmer.tokensConfig', localTokensConfig)
            return outputData
        } catch (error) {
            return {}
        }

        // explorer api
        // const res = await this.requestQueue([
        //     Http.GET(`${this.explorerApiUrl}/foundry/${this.curNode.network}/${foundryId}`, {
        //         isHandlerError: true
        //     })
        // ])
        // return res?.foundryDetails || {}
    },
    // handle foundry
    handleFoundry(foundryData) {
        const immutableFeatures = foundryData?.output?.immutableFeatures || []
        let info = immutableFeatures.find((e) => !!e.data)
        try {
            info = IotaObj.Converter.hexToUtf8(info.data)
            info = JSON.parse(info)
        } catch (error) {
            info = { decimals: 0, symbol: '' }
        }
        return info
    },
    // handle block 404 ？
    async blockData(messageId) {
        const res = await this.requestQueue([
            Http.GET(`${this.explorerApiUrl}/search/${this.curNode.network}/${messageId}`, {
                isHandlerError: true
            })
        ])
        return res
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
    async milestone(milestoneIndex, returnRes = false) {
        const res = await this.requestQueue([
            // this.client.milestone(milestoneIndex),
            Http.GET(`${this.explorerApiUrl}/milestone/${this.curNode.network}/${milestoneIndex}`, {
                isHandlerError: true
            })
        ])
        if (returnRes) {
            return res
        }
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
    async getHisList(outputList, { address, nodeId }, smrOutputIds) {
        if (!this.client) {
            return Base.globalToast.error(
                I18n.t('user.nodeError') + ':' + (this?.curNode?.curNodeKey || this?.curNode?.name)
            )
        }
        const nodeInfo = this.nodes.find((e) => e.id == nodeId) || {}
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
                let outputDatas = await Promise.all(smrOutputIds.map((e) => this.outputData(e.outputId)))
                const blockDatas = await Promise.all(
                    outputDatas.map((e) =>
                        this.blockData(!e.metadata?.isSpent ? e.metadata.blockId : e.metadata?.transactionId)
                    )
                )
                let blockIds = []
                allList = outputDatas.map((e, i) => {
                    const { blockId, isSpent, transactionId, outputIndex } = e.metadata
                    const isOldisSpent = blockIds.includes(blockId)
                    blockIds.push(blockId)
                    const blockData = blockDatas[i]?.transactionBlock || blockDatas[i]?.block || {}
                    const unlockBlocks = blockData?.payload?.unlocks || []
                    const unlockBlock = unlockBlocks.find((e) => e.signature)
                    return {
                        // isSpent: isOldisSpent ? false : isSpent,
                        isSpent: smrOutputIds[i].isSpent,
                        timestamp: smrOutputIds[i].milestoneTimestamp,
                        blockId: isSpent ? transactionId : blockId,
                        decimal: nodeInfo.decimal,
                        unlockBlock,
                        bech32Address: address,
                        outputs: blockData?.payload?.essence?.outputs || [],
                        output: e.output,
                        mergeTransactionId: smrOutputIds[i].milestoneIndex,
                        transactionId,
                        transactionOutputIndex: outputIndex,
                        outputSpent: isSpent
                    }
                })
                allList = allList.filter((e) => {
                    return !(!e.outputSpent && e.output.unlockConditions.find((d) => d.type != 0))
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
            // if (curWallet.password) {
            //     resolve(curWallet)
            // } else {
            // prompt password input if it is not available in context
            if (this._passwordDialog) {
                this._passwordDialog.current.show(curWallet, (data) => {
                    if (data) {
                        resolve(data)
                    }
                })
            }
            // }
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
        const apiUrl = this._nodes.find((e) => e.id == 1)?.url
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
        return new Promise(async (resolve, reject) => {
            this.sendParticipateMessage({ wallet, tokens, amount, type })
                .then(() => {
                    this.isAwaitStake = 1
                    let nums = 0
                    const awaitTakeHandle = setInterval(() => {
                        nums++
                        if (this.isAwaitStake == 2) {
                            this.isAwaitStake = null
                            clearInterval(awaitTakeHandle)
                            resolve({ code: 0 })
                        } else {
                            if (nums > 60) {
                                this.isAwaitStake = null
                                clearInterval(awaitTakeHandle)
                                resolve({ code: 0 })
                            }
                        }
                    }, 500)
                })
                .catch((err) => {
                    resolve({ code: 1, msg: err.toString() })
                })
        })
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
            signRes = signRes.signature
        } else {
            const baseSeed = this.getSeed(seed, password)
            const addressKeyPair = this.getPair(baseSeed)
            signRes = IotaObj.Ed25519.sign(addressKeyPair.privateKey, IotaObj.Converter.utf8ToBytes(content))
            signRes = `0x${IotaObj.Converter.bytesToHex(signRes)}`
        }
        return signRes
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
                Base.globalToast.error(
                    I18n.t('user.nodeError') + ':' + (this?.curNode?.curNodeKey || this?.curNode?.name)
                )
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
                Base.setLocalData(`valid.addresses.${address}`, [address])

                const publicKey = ethereumjsUtils.privateToPublic(ethereumjsUtils.toBuffer(privateKey))
                resolve({
                    address,
                    name,
                    isSelected: true,
                    password,
                    id: uuid,
                    nodeId: this.curNode?.id,
                    seed: this.getLocalSeed(seed, password),
                    bech32HRP: this.curNode?.bech32HRP,
                    publicKey: ethereumjsUtils.bufferToHex(publicKey)
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
        const curNode = this.nodes.find((e) => e.id == nodeId)
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
        const nodeInfo = this.nodes.find((e) => e.id == nodeId)
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
        const nodeInfo = this.nodes.find((e) => e.id == nodeId)
        return nodeInfo?.type == 3
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
            bech32HRP: this.info?.bech32HRP,
            publicKey: ethereumjsUtils.bufferToHex(addressKeyPair.publicKey)
        }
    },
    // check claim
    async checkClaimSMR(fromInfo) {
        const { seed, password, nodeId, address } = fromInfo
        const isClaim = await Base.getLocalData(`claim.smr.${address}`)
        if (!isClaim) {
            if (this.checkIota(nodeId)) {
                try {
                    const baseSeed = this.getSeed(seed, password)
                    IotaNext.setIotaBip44BasePath("m/44'/4218'")
                    const addressKeyPair = this.getPair(baseSeed)
                    const indexEd25519Address = new IotaNext.Ed25519Address(addressKeyPair.publicKey)
                    const indexPublicKeyAddress = indexEd25519Address.toAddress()
                    const nodeInfo =
                        this.curNode.id == this.IOTA_NODE_ID
                            ? initNodeList.find((e) => this.checkSMR(e.id))
                            : shimmerTestnet
                    const addressBech32 = IotaNext.Bech32Helper.toBech32(
                        IotaNext.ED25519_ADDRESS_TYPE,
                        indexPublicKeyAddress,
                        nodeInfo.bech32HRP
                    )

                    const client = new IotaNext.SingleNodeClient(nodeInfo.url)
                    const IndexerPluginClient = new IotaNext.IndexerPluginClient(client)
                    const res = await IndexerPluginClient.outputs({ addressBech32 })
                    const isHasClaim = !res?.items?.length
                    if (isHasClaim) {
                        Base.setLocalData(`claim.smr.${address}`, 1)
                    }
                    return isHasClaim
                } catch (error) {
                    return false
                }
            } else {
                return false
            }
        }
        return true
    },
    // gen 4218 ——> gen 4219 ——> 4218 to 4219
    async claimSMR(fromInfo) {
        const { seed, password } = fromInfo
        Base.globalToast.showLoading()
        let res = {}
        let smr4218, smr4218Balance, smr4219
        try {
            await this.checkPassword(seed, password)
            IotaObj.setIotaBip44BasePath("m/44'/4218'")
            smr4218 = await this.importSMRBySeed(seed, password)
            const validAddresses = await this.getValidAddresses({
                seed,
                password,
                address: smr4218.address,
                nodeId: this.curNode.id
            })
            const addressList = validAddresses.addressList
            const smr4218BalanceRes = await Promise.all(addressList.map((e) => IotaObj.addressBalance(this.client, e)))
            smr4218Balance = BigNumber(0)
            smr4218BalanceRes.forEach((e) => {
                smr4218Balance = smr4218Balance.plus(e.available)
            })
            IotaObj.setIotaBip44BasePath("m/44'/4219'")
            smr4219 = await this.importSMRBySeed(seed, password)
            IotaObj.setIotaBip44BasePath("m/44'/4218'")
        } catch (error) {
            console.log(error, '----')
            res = { code: -1 }
            Base.globalToast.hideLoading()
        }
        if (res.code !== -1) {
            try {
                // Base.globalToast.showLoading()
                const bigNumber = BigNumber(smr4218Balance).div(Math.pow(10, this.curNode.decimal))
                await this.send(smr4218, smr4219.address, Number(smr4218Balance))
                res = { code: 200, amount: Number(bigNumber), addressInfo: smr4219 }
            } catch (error) {
                console.log(error, '-----')
                res = { code: 1 }
            }
            Base.globalToast.hideLoading()
        }
        IotaObj.setIotaBip44BasePath("m/44'/4219'")
        return res
    },
    async SMRTokenSend(fromInfo, toAddress, sendAmount, ext) {
        const { seed, password, address } = fromInfo
        const baseSeed = this.getSeed(seed, password)
        const { tokenId, token, taggedData, realBalance, mainBalance } = ext
        let SMRFinished = false
        let finished = false
        let outputSMRBalance = BigNumber(0) //
        const inputsAndSignatureKeyPairs = []
        let initialAddressState = {
            accountIndex: 0,
            addressIndex: 0,
            isInternal: false
        }
        let otherTokensOutput = null
        let otherTokensStorageDeposit = 0
        let remainderSMROutput = null
        let remainderOutput = null
        let receiverOutput = {
            address: `0x${this.bech32ToHex(toAddress)}`,
            addressType: 0, // ED25519_ADDRESS_TYPE
            amount: '',
            type: 3, // BASIC_OUTPUT_TYPE
            nativeTokens: [
                {
                    id: tokenId,
                    amount: `0x${BigNumber(sendAmount).toString(16)}`
                }
            ],
            unlockConditions: [
                {
                    type: 0, // ADDRESS_UNLOCK_CONDITION_TYPE
                    address: IotaObj.Bech32Helper.addressFromBech32(toAddress, this.info.protocol.bech32Hrp)
                }
            ]
        }
        const receiverStorageDeposit = IotaObj.TransactionHelper.getStorageDeposit(
            receiverOutput,
            this.info.protocol.rentStructure
        )
        receiverOutput.amount = receiverStorageDeposit.toString()
        let remainderStorageDeposit = 0
        let outputBalance = BigNumber(receiverOutput.amount * -1)
        let zeroBalance = 0
        const getAddressOutputIds = async () => {
            const path = IotaObj.generateBip44Address(initialAddressState)
            const addressSeed = baseSeed.generateSeedFromPath(new IotaObj.Bip32Path(path))
            const addressKeyPair = addressSeed.keyPair()
            const ed25519Address = new IotaObj.Ed25519Address(addressKeyPair.publicKey)
            const addressBytes = ed25519Address.toAddress()
            const bech32Address = this.hexToBech32(addressBytes)
            const addressOutputIds = await this.IndexerPluginClient.outputs({ addressBech32: bech32Address })
            return { addressOutputIds, addressKeyPair, bech32Address }
        }
        const pushInput = (addressKeyPair, addressOutput) => {
            const input = {
                type: 0, // UTXO_INPUT_TYPE
                transactionId: addressOutput.metadata.transactionId,
                transactionOutputIndex: addressOutput.metadata.outputIndex
            }
            inputsAndSignatureKeyPairs.push({
                input,
                addressKeyPair,
                consumingOutput: addressOutput.output
            })
        }
        const setOutput = (outputBalance, bech32Address) => {
            if (outputBalance.gte(0)) {
                if (outputBalance.gt(0)) {
                    remainderOutput = {
                        address: `0x${this.bech32ToHex(bech32Address)}`,
                        addressType: 0, // ED25519_ADDRESS_TYPE
                        type: 3, //BASIC_OUTPUT_TYPE
                        amount: outputBalance.toString(),
                        unlockConditions: [
                            {
                                type: 0, // ADDRESS_UNLOCK_CONDITION_TYPE
                                address: IotaObj.Bech32Helper.addressFromBech32(
                                    bech32Address,
                                    this.info.protocol.bech32Hrp
                                )
                            }
                        ]
                    }
                } else {
                    remainderOutput = null
                }
                finished = true
            } else {
                finished = false
            }
        }
        try {
            do {
                const { addressOutputIds, addressKeyPair, bech32Address } = await getAddressOutputIds()
                if (addressOutputIds.items.length > 0) {
                    for (const outputId of addressOutputIds.items) {
                        const addressOutput = await this.client.output(outputId)
                        if (!addressOutput.metadata.isSpent) {
                            if (BigNumber(addressOutput.output.amount).eq(0)) {
                                zeroBalance++
                            } else {
                                const outputType = addressOutput?.output?.type
                                const addressUnlockCondition = addressOutput.output.unlockConditions.find(
                                    (u) => u.type != 0 // ADDRESS_UNLOCK_CONDITION_TYPE
                                )
                                //BASIC_OUTPUT_TYPE
                                if (outputType == 3 && !addressUnlockCondition) {
                                    const nativeTokens = addressOutput?.output?.nativeTokens || []
                                    const curToken = nativeTokens.find((e) => e.id === tokenId)
                                    if (curToken) {
                                        if (!SMRFinished) {
                                            outputSMRBalance = outputSMRBalance.plus(curToken.amount)
                                            pushInput(addressKeyPair, addressOutput)
                                            outputBalance = outputBalance.plus(addressOutput.output.amount)
                                            if (nativeTokens.length > 1) {
                                                const otherNativeTokens = nativeTokens.filter((e) => e.id !== tokenId)
                                                otherTokensOutput = otherTokensOutput || {
                                                    address: `0x${this.bech32ToHex(bech32Address)}`,
                                                    addressType: 0, // ED25519_ADDRESS_TYPE
                                                    type: 3, //BASIC_OUTPUT_TYPE
                                                    amount: '',
                                                    nativeTokens: [],
                                                    unlockConditions: [
                                                        {
                                                            type: 0, // ADDRESS_UNLOCK_CONDITION_TYPE
                                                            address: IotaObj.Bech32Helper.addressFromBech32(
                                                                bech32Address,
                                                                this.info.protocol.bech32Hrp
                                                            )
                                                        }
                                                    ]
                                                }
                                                otherNativeTokens.forEach((t) => {
                                                    if (!otherTokensOutput.nativeTokens.includes(t.id)) {
                                                        otherTokensOutput.nativeTokens.push({
                                                            ...t
                                                        })
                                                    } else {
                                                        const tData = otherTokensOutput.nativeTokens.find(
                                                            (k) => k.id == t.id
                                                        )
                                                        tData.amount = BigNumber(tData.amount).plus(t.amount)
                                                        tData.amount = `0x${tData.amount.toString(16)}`
                                                    }
                                                })
                                                const newOtherTokensStorageDeposit =
                                                    IotaObj.TransactionHelper.getStorageDeposit(
                                                        otherTokensOutput,
                                                        this.info.protocol.rentStructure
                                                    ).toString()
                                                otherTokensOutput.amount = newOtherTokensStorageDeposit
                                                outputBalance = outputBalance
                                                    .plus(otherTokensStorageDeposit)
                                                    .minus(newOtherTokensStorageDeposit)
                                                setOutput(outputBalance, bech32Address)
                                                otherTokensStorageDeposit = newOtherTokensStorageDeposit
                                            }
                                            if (outputSMRBalance.minus(sendAmount).gte(0)) {
                                                if (outputSMRBalance.minus(sendAmount).gt(0)) {
                                                    const addressUnlockCondition =
                                                        addressOutput.output.unlockConditions.find(
                                                            (u) => u.type === 0 // ADDRESS_UNLOCK_CONDITION_TYPE
                                                        )
                                                    if (
                                                        addressUnlockCondition &&
                                                        addressUnlockCondition.address.type === 0 // ED25519_ADDRESS_TYPE
                                                    ) {
                                                        remainderSMROutput = {
                                                            address: `0x${this.bech32ToHex(bech32Address)}`,
                                                            addressType: 0, // ED25519_ADDRESS_TYPE
                                                            type: 3, //BASIC_OUTPUT_TYPE
                                                            amount: '',
                                                            nativeTokens: [
                                                                {
                                                                    id: tokenId,
                                                                    amount: `0x${outputSMRBalance
                                                                        .minus(sendAmount)
                                                                        .toString(16)}`
                                                                }
                                                            ],
                                                            unlockConditions: [
                                                                {
                                                                    type: 0, // ADDRESS_UNLOCK_CONDITION_TYPE
                                                                    address: IotaObj.Bech32Helper.addressFromBech32(
                                                                        bech32Address,
                                                                        this.info.protocol.bech32Hrp
                                                                    )
                                                                }
                                                            ]
                                                        }
                                                        remainderStorageDeposit =
                                                            IotaObj.TransactionHelper.getStorageDeposit(
                                                                remainderSMROutput,
                                                                this.info.protocol.rentStructure
                                                            )
                                                        remainderSMROutput.amount = remainderStorageDeposit.toString()
                                                        outputBalance = outputBalance.minus(remainderSMROutput.amount)
                                                        setOutput(outputBalance, bech32Address)
                                                    }
                                                } else {
                                                    setOutput(outputBalance, bech32Address)
                                                }
                                                SMRFinished = true
                                            } else {
                                                setOutput(outputBalance, bech32Address)
                                            }
                                        }
                                    } else if (nativeTokens.length === 0 && !finished) {
                                        pushInput(addressKeyPair, addressOutput)
                                        outputBalance = outputBalance.plus(addressOutput.output.amount)
                                        setOutput(outputBalance, bech32Address)
                                    }
                                }
                            }
                        }
                    }
                } else {
                    zeroBalance++
                }
            } while ((!SMRFinished || !finished) && zeroBalance <= 20)
            const outputs = [receiverOutput]
            if (remainderOutput) {
                outputs.push(remainderOutput)
            }
            if (remainderSMROutput) {
                outputs.push(remainderSMROutput)
            }
            if (otherTokensOutput) {
                outputs.push(otherTokensOutput)
            }
            if (outputBalance.lt(0)) {
                let str = I18n.t('assets.sendErrorInsufficient')
                str = str
                    .replace(/{token}/g, token)
                    .replace(/{amount}/g, sendAmount)
                    .replace(
                        /{deposit}/g,
                        Number(receiverStorageDeposit.toString()) +
                            Number(remainderStorageDeposit.toString() + Number(otherTokensStorageDeposit))
                    )
                    .replace(/{balance1}/g, realBalance)
                    .replace(/{balance2}/g, mainBalance)
                    .replace(/{balance3}/g, Number(outputBalance))
                throw new Error(str)
            }
            const res = await IotaObj.sendAdvanced(this.client, inputsAndSignatureKeyPairs, outputs, {
                tag: IotaObj.Converter.utf8ToBytes('TanglePay'),
                data: taggedData
                    ? IotaObj.Converter.utf8ToBytes(taggedData)
                    : IotaObj.Converter.utf8ToBytes(
                          JSON.stringify({
                              from: address, //main address
                              to: toAddress,
                              amount: sendAmount,
                              collection: 0
                          })
                      )
            })
            return res
        } catch (error) {
            throw error
        }
    },
    async getUnlockOutputData(addressList) {
        const res = await Promise.all(addressList.map((e) => IotaObj.addressBalance(this.client, e)))
        let outputDatas = []
        res.map((e) => {
            outputDatas = [...outputDatas, ...e.outputDatas]
        })
        return { outputDatas }
    },
    async SMRUNlock({ output, transactionId, unlockAddress, transactionOutputIndex, curWallet, amount }) {
        const { seed, password, address } = curWallet
        await this.checkPassword(seed, password)
        const baseSeed = this.getSeed(seed, password)
        const input = {
            type: 0, // UTXO_INPUT_TYPE
            transactionId: transactionId,
            transactionOutputIndex
        }
        const addressKeyPair = this.getPair(baseSeed)
        let inputsAndSignatureKeyPairs = [
            {
                input,
                addressKeyPair,
                consumingOutput: output
            }
        ]
        let sendAmount = output.amount
        const sendOutput = {
            address: `0x${this.bech32ToHex(address)}`,
            addressType: 0, // ED25519_ADDRESS_TYPE
            amount: sendAmount,
            type: 3, // BASIC_OUTPUT_TYPE
            nativeTokens: output.nativeTokens || [],
            unlockConditions: [
                {
                    type: 0, // ADDRESS_UNLOCK_CONDITION_TYPE
                    address: IotaObj.Bech32Helper.addressFromBech32(address, this.info.protocol.bech32Hrp)
                }
            ]
        }
        let outputs = [sendOutput]
        if (output?.nativeTokens?.length) {
            sendAmount = IotaObj.TransactionHelper.getStorageDeposit(sendOutput, this.info.protocol.rentStructure)
            sendAmount = sendAmount.toString()
            sendOutput.amount = sendAmount
            outputs = [
                sendOutput,
                {
                    address: `0x${this.bech32ToHex(unlockAddress)}`,
                    amount: output.amount,
                    addressType: 0
                }
            ]
            let initialAddressState = {
                accountIndex: 0,
                addressIndex: 0,
                isInternal: false
            }
            const smrCalc = await IotaObj.calculateInputs(
                this.client,
                baseSeed,
                initialAddressState,
                IotaObj.generateBip44Address,
                outputs,
                20
            )
            inputsAndSignatureKeyPairs = [...inputsAndSignatureKeyPairs, ...smrCalc]
            if (outputs.length >= 3) {
                outputs[2].amount = BigNumber(outputs[2].amount).plus(output.amount)
            } else {
                outputs.push({
                    address: `0x${this.bech32ToHex(address)}`,
                    amount: output.amount,
                    addressType: 0
                })
            }
        }
        const res = await IotaObj.sendAdvanced(this.client, inputsAndSignatureKeyPairs, outputs, {
            tag: IotaObj.Converter.utf8ToBytes('TanglePay'),
            data: IotaObj.Converter.utf8ToBytes(
                JSON.stringify({
                    from: address,
                    to: address,
                    amount,
                    unlock: 1
                })
            )
        })
        return res
    }
    /**************** SMR end *******************/
}

export default IotaSDK
