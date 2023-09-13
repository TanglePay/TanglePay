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
import _flatten from 'lodash/flatten'
import Web3 from 'web3'
import * as Web3Bip39 from 'bip39'
import { hdkey as ethereumjsHdkey } from 'ethereumjs-wallet'
import * as ethereumjsUtils from 'ethereumjs-util'
import AppEth from '@ledgerhq/hw-app-eth'
import AppIota from './hw-app-iota'
import { ethers } from 'ethers'
import TransportLedger from './ledger'
import { Base64 } from '@iota/util.js'
const { TransportWebBLE, TransportWebUSB, TransportWebHID } = TransportLedger

const initTokenAbi = require('../abi/TokenERC20.json')
const nonfungiblePositionManager = require('../abi/NonfungiblePositionManager.json')

let IotaObj = Iota

const MAX_TAG_FEATURE_LENGTH = 64
const MAX_METADATA_FEATURE_LENGTH = 8192

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
    filterAssetsList: ['stake'],
    decimal: 6,
    explorerApiUrl: 'https://explorer-api.shimmer.network/stardust',
    sendTokenV2: true
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
    explorer: 'https://explorer.iota.org/devnet',
    explorerApiUrl: 'https://explorer-api.iota.org'
}
const shimmerEvmTestnet = {
    id: 6,
    url: 'https://json-rpc.evm.testnet.shimmer.network',
    explorer: 'https://explorer.evm.testnet.shimmer.network/',
    name: 'Shimmer Beta',
    enName: 'Shimmer Beta',
    deName: 'Shimmer Beta',
    zhName: 'Shimmer Beta',
    type: 2,
    network: 'shimmer-evm',
    bech32HRP: 'shimmer-evm',
    token: 'RMS',
    filterMenuList: ['staking'],
    filterAssetsList: ['stake'],
    contractList: [
        // {
        //     contract: '0x903fE58170A44CF0D0eb5900d26cDedEA802635C',
        //     token: 'TPT',
        //     gasLimit: 0,
        //     maxPriorityFeePerGas: 0
        // }
    ],
    decimal: 18,
    gasLimit: 0,
    isTest: true
}
const polyganTestnet = {
    id: 8,
    url: 'https://matic-testnet-archive-rpc.bwarelabs.com/',
    explorer: 'https://mumbai.polygonscan.com',
    name: 'Mumbai',
    enName: 'Mumbai',
    deName: 'Mumbai',
    zhName: 'Mumbai',
    type: 2,
    network: 'mumbai',
    bech32HRP: 'mumbai',
    token: 'MATIC',
    filterMenuList: ['staking'],
    filterAssetsList: ['stake'],
    contractList: [],
    decimal: 18,
    gasLimit: 21000,
    isTest: true,
    isHideInAdd: true
}
const initNodeList = [
    {
        id: IOTA_NODE_ID,
        url: 'https://chrysalis-nodes.iota.org',
        explorer: 'https://explorer.iota.org/mainnet',
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
        filterAssetsList: ['stake'],
        decimal: 6,
        explorerApiUrl: 'https://explorer-api.shimmer.network/stardust',
        sendTokenV2: true
    },
    { ...shimmerEvmTestnet },
    { ...iotaTestnet },
    // {
    //     id: 5,
    //     url: 'https://evm.wasp.sc.iota.org/',
    //     explorer: 'https://explorer.wasp.sc.iota.org',
    //     name: 'IOTA EVM',
    //     enName: 'IOTA EVM',
    //     deName: 'IOTA EVM',
    //     zhName: 'IOTA EVM',
    //     type: 2,
    //     network: 'iota-evm',
    //     bech32HRP: 'iota-evm',
    //     token: 'TEST',
    //     filterMenuList: ['staking'],
    //     filterAssetsList: ['stake'],
    //     contractList: [
    //         {
    //             contract: '0x903fE58170A44CF0D0eb5900d26cDedEA802635C',
    //             token: 'TPT',
    //             gasLimit: 0,
    //             maxPriorityFeePerGas: 0
    //         }
    //     ],
    //     decimal: 18,
    //     gasLimit: 0
    // },
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
        filterMenuList: ['staking'],
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
    },
    {
        id: 7,
        url: 'https://polygon-rpc.com/',
        explorer: 'https://polygonscan.com',
        name: 'MATIC',
        enName: 'MATIC',
        deName: 'MATIC',
        zhName: 'MATIC',
        type: 2,
        network: 'matic',
        bech32HRP: 'matic',
        token: 'MATIC',
        filterMenuList: ['staking'],
        filterAssetsList: ['stake'],
        contractList: [],
        decimal: 18,
        gasLimit: 21000
    },
    {
        id: 9,
        url: 'https://mainnet.infura.io/v3/0964612cb7274741bd196b21444a49ea',
        explorer: 'https://etherscan.io',
        name: 'ETH',
        enName: 'ETH',
        deName: 'ETH',
        zhName: 'ETH',
        type: 2,
        network: 'eth',
        bech32HRP: 'eth',
        token: 'ETH',
        filterMenuList: ['staking'],
        filterAssetsList: ['stake'],
        contractList: [],
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
        IotaSDK.IotaObj = IotaObj
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
        // return this.isWeb3Node ? [12, 24] : [24]
        return [12, 24]
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
    async getNodes(callBack) {
        try {
            Base.getLocalData('tanglePayNodeList').then((res) => {
                if (res?.list) {
                    this._nodes = res.list
                    callBack && callBack()
                    callBack = null
                }
            })
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
                    d.isSystem = true
                    this._contracAssetsShowDic[d.contract] = d.isShowZero
                })
            })

            //advanced start
            const shimmerSupport = await Base.getLocalData('common.shimmerSupport')
            const iotaSupport = await Base.getLocalData('common.iotaSupport')
            const polyganSupport = await Base.getLocalData('common.polyganSupport')
            if (shimmerSupport == 1 && !_nodes.find((e) => e.id == 101)) {
                _nodes.push(shimmerTestnet)
            }
            if (parseInt(iotaSupport) !== 0 && !_nodes.find((e) => e.id == 2)) {
                _nodes.push(iotaTestnet)
            }
            if (polyganSupport == 1 && !_nodes.find((e) => e.id == 8)) {
                _nodes.push(polyganTestnet)
            }
            //advanced end

            // check start
            if (Base.getClientType() === 'IOS') {
                const version = Base.getVersion()
                const versionRes = await fetch(`${API_URL}/switchConfig.json?v=${new Date().getTime()}`).then((res) => res.json())
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
                    if (ShimmerHornet.Features.includes('pow') && ShimmerHornet.BaseToken.name == 'Shimmer' && ShimmerHornet.isHealthy) {
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

            let localNodes = (await Base.getLocalData('tanglePayNodeList')) || {}
            localNodes = localNodes?.list || []
            _nodes.forEach((e) => {
                const { id } = e
                const localE = localNodes.find((d) => d.id == id)
                if (localE && localE.contractList?.length > 0) {
                    let eContractList = [...e.contractList]
                    localE.contractList.forEach((c) => {
                        if (!eContractList.find((g) => String(g.contract).toLocaleLowerCase() == String(c.contract).toLocaleLowerCase())) {
                            eContractList.push(c)
                        }
                    })
                    e.contractList = eContractList.filter((c) => !c.isDel)
                }
            })

            this._nodes = _nodes
            const curNodeId = await Base.getLocalData('common.curNodeId')
            if (!_nodes.find((e) => e.id == curNodeId)) {
                Base.setLocalData('common.curNodeId', '')
            }
            Base.setLocalData('tanglePayNodeList', {
                list: _nodes
            })
            callBack && callBack()
            callBack = null
        } catch (error) {
            callBack && callBack()
            callBack = null
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
                Base.globalToast.hideLoading()
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
                const localInfo = Base.getLocalData(`nodeInfo.${id}`)
                if (localInfo) {
                    this.info = localInfo
                    Base.globalToast.hideLoading()
                }
                this.client.info().then((res) => {
                    const curNode = this.nodes.find((e) => e.id === id)
                    if (curNode && (curNode.bech32HRP == res?.bech32HRP || curNode.bech32HRP == res?.protocol?.bech32Hrp)) {
                        this.info = res
                        Base.setLocalData(`nodeInfo.${id}`, this.info)
                    }
                    Base.globalToast.hideLoading()
                })
            }
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
                        try {
                            let latest = await self.client.eth.getBlockNumber()
                            const res = await Promise.all(
                                topics.map((e) => {
                                    return self.client.eth.getPastLogs({
                                        topics: e,
                                        fromBlock: preBlock,
                                        toBlock: latest
                                    })
                                })
                            )
                            preBlock = latest
                            const list = _flatten(res)
                            if (list.length > 0) {
                                await self.setPastLogs(address, this.curNode?.id, list)
                                self.refreshAssets()
                            }
                            self.web3Subscription = setTimeout(getData, 5000)
                        } catch (error) {
                            self.web3Subscription = setTimeout(getData, 5000)
                        }
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
        return IotaObj.Bip39.randomMnemonic(128)
    },
    async importMnemonic({ mnemonic, name, password }) {
        return new Promise(async (resolve, reject) => {
            if (!this.info) {
                Base.globalToast.error(I18n.t('user.nodeError') + ':' + (this?.curNode?.curNodeKey || this?.curNode?.name))
                reject()
                return
            }
            mnemonic = mnemonic.replace(/ +/g, ' ').toLocaleLowerCase().trim()
            const mnemonicLen = (mnemonic || '').split(' ').length
            if (!mnemonic || !this.mnemonicLenList.includes(mnemonicLen)) {
                Base.globalToast.error(I18n.t('account.mnemonicError').replace('{len}', this.mnemonicLenList.join(` ${I18n.t('account.or')} `)))
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
                            publicKey: ethereumjsUtils.bufferToHex(ethereumjsUtils.privateToPublic(key._hdkey._privateKey))
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
    // const path = "44'/60'/0'/0/0" // HD derivation path
    async checkHardwareConnect() {
        const transport = await this.getTransport()
        const nodeId = this.curNode?.id
        if (this.checkIota(nodeId)) {
            const eth = new AppIota(transport)
            await eth.getAppVersion()
        } else if (this.checkWeb3Node(nodeId)) {
            const eth = new AppEth(transport)
            await eth.getAddress(`44'/60'/0'/0/0`)
        }
    },
    //107a:iota,1:atoi,107b:shimmer,1:shimmer_testnet
    getHardwareCoinParams(nodeId) {
        let cointType = ''
        let pathCoinType = ''
        switch (nodeId) {
            case IOTA_NODE_ID:
                cointType = 'iota'
                pathCoinType = '107a'
                break
            case iotaTestnet.id:
                cointType = 'atoi'
                pathCoinType = '1'
                break
            case shimmerTestnet.id:
                cointType = 'shimmer_testnet'
                pathCoinType = '1'
                break
            case this.SMR_NODE_ID:
                cointType = 'shimmer'
                pathCoinType = '107b'
                break
            default:
                break
        }
        return [pathCoinType, cointType]
    },
    async getHardwareAddressInIota(nodeId, index, display = false, count = 1) {
        const [pathCoinType, cointType] = this.getHardwareCoinParams(nodeId, index)
        const getPath = (index) => {
            const path = `2c'/${pathCoinType}'/0'/0'/${index}'`
            return [AppIota._validatePath(path), path]
        }
        try {
            const transport = await this.getTransport()
            const appIota = new AppIota(transport)
            const getAddress = async (index) => {
                const [arr, path] = getPath(index)
                await appIota._setAccount(arr[2], { id: cointType })
                await appIota._generateAddress(arr[3], arr[4], 1, display)
                const addressList = await appIota._getData()
                await appIota._reset()
                const address = this.hexToBech32(addressList.slice(1, 33))
                return { address, path }
            }
            let countList = []
            const list = []
            for (let i = 0; i < count; i++) {
                countList.push(i)
            }
            for (const i of countList) {
                list.push(await getAddress(index + i))
            }
            return list
        } catch (error) {
            throw error
        }
    },
    async getHardwareIotaSign(nodeId, essenceHash, inputs, hasRemainder, isBinaryEssence = false) {
        const transport = await this.getTransport()
        const appIota = new AppIota(transport)
        const [pathCoinType, cointType] = this.getHardwareCoinParams(nodeId, 0)
        const arr = AppIota._validatePath(`2c'/${pathCoinType}'/0'/0'/0'`)
        await appIota._setAccount(arr[2], { id: cointType })
        if (!isBinaryEssence) {
            await appIota._writeDataBuffer(Buffer.from(essenceHash))
            await appIota._prepareSigning(hasRemainder ? 1 : 0, hasRemainder ? 1 : 0, 0x80000000, 0x80000000)
        } else {
            await appIota._writeDataBuffer(Buffer.from(essenceHash))
            await appIota._prepareBlindSigning()
        }
        await appIota._showSigningFlow()
        await appIota._userConfirmEssence()
        await appIota._showSignedSuccessfullyFlow()
        await new Promise((resolve) => setTimeout(resolve, 2000)) // wait 1 second
        await appIota._showMainFlow()

        const ED25519_PUBLIC_KEY_LENGTH = 32
        const ED25519_SIGNATURE_LENGTH = 64
        const unlocks = []
        const deviceResponseToUint8Array = (array, length) => {
            const uint8Array = new Uint8Array(length)
            for (let i = 0; i < length; i++) {
                uint8Array[i] = array[i]
            }
            return uint8Array
        }
        const arrayToHex = (byteArray) => {
            let s = '0x'
            byteArray.forEach(function (byte) {
                s += ('0' + (byte & 0xff).toString(16)).slice(-2)
            })
            return s
        }

        const addressToUnlock = {}
        for (let i = 0; i < inputs.length; i++) {
            const response = await appIota._signSingle(i)
            console.log(response, '-----')
            if (!response.fields.ed25519_public_key) {
                unlocks.push({
                    type: 1, //REFERENCE_UNLOCK_TYPE
                    reference: i
                })
            } else {
                const publicKey = deviceResponseToUint8Array(response.fields.ed25519_public_key, ED25519_PUBLIC_KEY_LENGTH)
                let hexInputAddressPublic = arrayToHex(publicKey)
                if (addressToUnlock[hexInputAddressPublic]) {
                    unlocks.push({
                        type: 1, //REFERENCE_UNLOCK_TYPE
                        reference: addressToUnlock[hexInputAddressPublic].unlockIndex
                    })
                } else {
                    // parse device response to a hexadecimal string
                    const signature = deviceResponseToUint8Array(response.fields.ed25519_signature, ED25519_SIGNATURE_LENGTH)
                    unlocks.push({
                        type: 0, // SIGNATURE_UNLOCK_TYPE
                        signature: {
                            type: 0, // ED25519_SIGNATURE_TYPE
                            publicKey: hexInputAddressPublic,
                            signature: arrayToHex(signature)
                        }
                    })
                    addressToUnlock[hexInputAddressPublic] = {
                        unlockIndex: unlocks.length - 1
                    }
                }
            }
        }
        unlocks.forEach((e) => {
            if (!e.signature) {
                if (!unlocks[e.reference]?.signature) {
                    e.reference = unlocks.findIndex((d) => !!d.signature)
                }
            }
        })
        return unlocks
    },
    async getHardwareAddressList(current = 1, pageSize = 5) {
        try {
            const transport = await this.getTransport()
            const eth = new AppEth(transport)
            const getPath = (index) => {
                return `44'/60'/${index}'/0/0`
            }
            const pathList = []
            for (let i = (current - 1) * pageSize; i < current * pageSize; i++) {
                pathList.push(getPath(i))
            }
            const addressList = []
            for (const e of pathList) {
                addressList.push(await eth.getAddress(e))
            }
            const balanceList = await Promise.all(addressList.map((e) => this.client.eth.getBalance(e.address)))
            const walletList = await this.getWalletList()
            const hardwareAddressList = addressList.map((e, i) => {
                const importItem = walletList.find((d) => d.address == e.address)
                return {
                    ...e,
                    index: (current - 1) * pageSize + i + 1,
                    path: pathList[i],
                    type: 'ledger',
                    balance: balanceList[i],
                    hasImport: !!importItem,
                    id: importItem?.id
                }
            })
            return hardwareAddressList
        } catch (error) {
            throw error
        }
    },
    async importHardware({ address, name, publicKey, path, type }) {
        return new Promise(async (resolve, reject) => {
            const isDuplicate = await this.checkImport(address)
            if (isDuplicate) {
                reject(I18n.t('account.importDuplicate'))
                return
            } else {
                resolve({
                    address,
                    name,
                    isSelected: true,
                    password: publicKey || address,
                    id: Base.guid(),
                    nodeId: this.curNode?.id,
                    seed: this.getLocalSeed(IotaObj.Converter.utf8ToBytes(type), publicKey), //ledger
                    bech32HRP: this.curNode?.bech32HRP,
                    publicKey,
                    type,
                    path
                })
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
        list = list.map((d) => {
            let isHideTest = false
            if (iotaTestnet.id == d.nodeId || shimmerTestnet.id == d.nodeId || polyganTestnet.id == d.nodeId) {
                isHideTest = !this.nodes.find((e) => e.id == d.nodeId)
            }
            return {
                ...d,
                isHideTest
            }
        })
        return list
    },
    bytesToHex(bytes) {
        return IotaObj.Converter.bytesToHex(bytes)
    },
    hexToUtf8(hex) {
        return IotaObj.Converter.hexToUtf8(hex)
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
        return IotaObj.Bech32Helper.toBech32(IotaObj.ED25519_ADDRESS_TYPE, address, this.info?.bech32HRP || this.curNode?.bech32HRP)
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
                        pageSize: 1000,
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
                    // cache shimmer outputDatas
                    let cacheOutputDatas = {}
                    addressList.forEach((e, i) => {
                        cacheOutputDatas[e] = res[i]?.outputDatas || []
                    })
                    Base.setLocalData(`${nodeId}.${address}.shimmerOutputDatas`, cacheOutputDatas)
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
                throw error
            }
        }
        const tokens = Object.keys(smrTokens)
        const foundryList = await Promise.all(tokens.map((e) => this.foundry(e)))
        let availableNativeTokens = []
        tokens.forEach((e, i) => {
            const info = this.handleFoundry(foundryList[i])
            const { decimals, symbol, standard } = info
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
                logoUrl: info.logoUrl,
                standard
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
    // pin related
    async checkPin(pin) {
        const tasks = [Base.getSensitiveInfo('pin.secret'), Base.getSensitiveInfo('pin.hash')]
        try {
            const [encrptedSecret, hashStored] = await Promise.all(tasks)
            const secret = this.decryptSeed(encrptedSecret, pin, true)
            const hash = CryptoJS.SHA256(secret).toString(CryptoJS.enc.Hex)
            return hash == hashStored
        } catch (e) {
            console.log(e)
            return false
        }
    },
    getKeyAndValueOfPasswordSwitch(address) {
        const key = CryptoJS.MD5(address, 16).toString()
        const value = CryptoJS.MD5('' + Math.random() * 100000, 16).toString()
        return [key, value]
    },
    getKeyOfPin(pin, salt) {
        // salt is usually account address
        const pinmd5 = CryptoJS.MD5(pin, 16).toString()
        const saltmd5 = CryptoJS.MD5(salt, 16).toString()
        const key = CryptoJS.PBKDF2(pinmd5, saltmd5, { keySize: 16, iterations: 1000 })
        return key
    },
    async setPin(pin) {
        const secret = this.generateRandomString(16)
        const encrptedSecret = this.encryptSeed(secret, pin, true)
        const secretHash = CryptoJS.SHA256(secret).toString(CryptoJS.enc.Hex)
        const tasks = [Base.setSensitiveInfo('pin.secret', encrptedSecret), Base.setSensitiveInfo('pin.hash', secretHash)]
        try {
            await Promise.all(tasks)
        } catch (e) {
            console.log(e)
            throw e
        }
    },
    generateRandomString(length) {
        // Define the character set
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789?!@#$%^&*()'

        let result = ''

        for (let i = 0; i < length; i++) {
            // Choose a random index from the character set
            const randomIndex = Math.floor(Math.random() * characters.length)

            // Add the character at the random index to the result string
            result += characters[randomIndex]
        }

        return result
    },
    // check isV2
    checkKeyAndIvIsV2(localSeed) {
        const reg = new RegExp(`${V2_FLAG}$`)
        return reg.test(localSeed)
    },
    getKeyAndValueOfPasswordEnable(address) {
        const key = CryptoJS.MD5(address, 16).toString()
        const value = CryptoJS.MD5('' + Math.random() * 100000, 16).toString()
        return [key, value]
    },
    getKeyOfPin(pin, salt) {
        // salt is usually account address
        const pinmd5 = CryptoJS.MD5(pin, 16).toString()
        const saltmd5 = CryptoJS.MD5(salt, 16).toString()
        const key = CryptoJS.PBKDF2(pinmd5, saltmd5, { keySize: 16, iterations: 1000 })
        return key
    },
    // end of pin logic

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
    decryptSeed(seed, password, forceV2 = false) {
        const reg = new RegExp(`${V2_FLAG}$`)
        let func = reg.test(seed) || forceV2 ? 'getKeyAndIvV2' : 'getKeyAndIv'
        seed = seed.replace(reg, '')
        const [key, iv] = this[func](password)
        let encryptedHexStr = CryptoJS.enc.Hex.parse(seed)
        let srcs = CryptoJS.enc.Base64.stringify(encryptedHexStr)
        let decrypt = CryptoJS.AES.decrypt(srcs, key, { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 })
        let decryptedStr = decrypt.toString(CryptoJS.enc.Utf8)
        return decryptedStr.toString()
    },
    encryptSeed(seed, password, forceV2 = false) {
        const reg = new RegExp(`${V2_FLAG}$`)
        let func = reg.test(seed) || forceV2 ? 'getKeyAndIvV2' : 'getKeyAndIv'
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
    async checkPassword(seed, password, isV2 = false) {
        return new Promise((resolve, reject) => {
            let baseSeed = null
            try {
                baseSeed = this.getSeed(seed, password, isV2)
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
    getSeed(localSeed, password, isV2 = false) {
        let seed = this.decryptSeed(localSeed, password, isV2)
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
    async getDefaultGasLimit(to, contract, value, taggedData) {
        if (contract && taggedData) {
            try {
                const { params, inputs } = await this.getAbiParams(contract, taggedData)
                const index = (inputs || []).findIndex((e) => e.type == 'bytes[]')
                if (index > -1) {
                    const list = params?.[index]
                    if (list.length > 0) {
                        const limits = await Promise.all(
                            list.map((c) => {
                                return this.getDefaultGasLimit(to, contract, value, c)
                            })
                        )
                        let total = new BigNumber(0)
                        limits.forEach((a) => {
                            total = total.plus(a)
                        })
                        return total.valueOf()
                    }
                }
            } catch (error) {
                console.log(error)
            }
        }
        const eth = this.client.eth
        window.web3 = this.client
        let blockGasLimitBn = 21000
        try {
            blockGasLimitBn = await eth.estimateGas({ to, value: value || 0 })
            blockGasLimitBn = BigNumber(blockGasLimitBn)
            if (Number(value) > 0) {
                blockGasLimitBn = blockGasLimitBn.plus(1)
            }
            let limit = ''
            if (contract) {
                const block = await eth.getBlock('latest')
                blockGasLimitBn = BigNumber(block.gasLimit)
                const tokenAbi = JSON.parse(JSON.stringify(initTokenAbi))
                if (!taggedData) {
                    const web3Contract = new eth.Contract(tokenAbi, contract)
                    taggedData = web3Contract.methods.transfer(contract, value || 1).encodeABI()
                }
                const params = {
                    to: contract,
                    data: taggedData
                }
                let initialGasLimitBn
                try {
                    initialGasLimitBn = await eth.estimateGas(params)
                } catch (error) {
                    initialGasLimitBn = await eth.estimateGas({})
                }
                initialGasLimitBn = BigNumber(initialGasLimitBn)
                const upperGasLimitBn = blockGasLimitBn.times(0.9)
                const bufferedGasLimitBn = initialGasLimitBn.times(1.5)
                if (initialGasLimitBn.gt(upperGasLimitBn)) {
                    limit = initialGasLimitBn
                } else if (bufferedGasLimitBn.lt(upperGasLimitBn)) {
                    limit = bufferedGasLimitBn
                } else {
                    limit = upperGasLimitBn
                }
                limit = parseInt(limit)
                limit = this.getNumberStr(limit)
            } else {
                limit = blockGasLimitBn.valueOf()
            }
            return limit
        } catch (error) {
            return blockGasLimitBn
        }
    },
    async getGasLimit(configLimit, address, sendAmount, gasMultiple = 1) {
        const eth = this.client.eth
        let blockLimit = await eth.getBlock('latest')
        blockLimit = blockLimit?.gasLimit || 0
        configLimit = configLimit || blockLimit || 0
        let gasPrice = await eth.getGasPrice()
        if (this.curNode.id == 6 || this.curNode.id == 8) {
            gasMultiple = 10
        }
        gasPrice = new BigNumber(gasPrice).times(gasMultiple || 1).integerValue(1)
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
                console.log(error, '============')
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
    // async getAppTransport(){
    //     return new Promise(async (resolve,reject)=>{

    //     })
    // },
    async getTransport() {
        if (!Base.transport) {
            const [hasHID, hasUSB, hasBLE] = await Promise.all([TransportWebHID.isSupported(), TransportWebUSB.isSupported(), TransportWebBLE.isSupported()])
            if (Base.isBrowser) {
                if (hasHID) {
                    Base.transport = await TransportWebHID.create()
                } else if (hasUSB) {
                    Base.transport = await TransportWebUSB.create()
                } else if (hasBLE) {
                    Base.transport = await TransportWebBLE.create()
                }
            } else {
                if (hasBLE) {
                    Base.transport = await TransportWebBLE.create()
                } else if (hasHID) {
                    Base.transport = await TransportWebHID.create()
                } else if (hasUSB) {
                    Base.transport = await TransportWebUSB.create()
                }
            }
        }
        if (!Base.transportListen && Base.transport) {
            Base.transportListen = true
            Base.transport.on('disconnect', () => {
                Base.transport = null
                Base.transportListen = false
            })
        }
        return Base.transport
    },
    handleError(error) {
        let errStr = error.toString()
        if (/this\.init is not a function\./.test(errStr)) {
            errStr = 'out of gas'
        }
        return errStr
    },
    processFeature(output, { metadata, tag }) {
        const { utf8ToHex } = IotaObj.Converter
        const metadataHex = metadata ? utf8ToHex(metadata) : undefined
        const tagHex = tag ? utf8ToHex(tag) : undefined
        if(tagHex && tagHex.length / 2  > MAX_TAG_FEATURE_LENGTH) {
            throw new Error(I18n.t('shimmer.tagExcessError'))
        }
        if(metadataHex && metadataHex.length / 2 > MAX_METADATA_FEATURE_LENGTH) {
            throw new Error(I18n.t('shimmer.metadataExcessError'))
        }
        output.features = [
            ...(metadataHex ? [{
                type: IotaObj.METADATA_FEATURE_TYPE,
                data:  `0x${metadataHex}`
            }] : []),
            ...(tagHex ? [{
                type: 3, // TAG_FEATURE_TYPE
                tag: `0x${tagHex}`
            }] : [])
        ]
        return output
    },
    async send(fromInfo, toAddress, sendAmount, ext) {
        if (!this.client) {
            return Base.globalToast.error(I18n.t('user.nodeError') + ':' + (this?.curNode?.curNodeKey || this?.curNode?.name))
        }
        const { seed, address, password, nodeId } = fromInfo
        const isLedger = fromInfo.type == 'ledger'
        let baseSeed = null
        if (!isLedger) {
            baseSeed = this.getSeed(seed, password)
        }
        const nodeInfo = this.nodes.find((e) => e.id == nodeId) || {}
        let actionTime = new Date().getTime()
        let traceToken = ''
        if (this.checkWeb3Node(nodeId)) {
            if (!/^0x/.test(toAddress)) {
                throw I18n.t('assets.sendError')
            }
            let sendAmountHex = this.getNumberStr(sendAmount)
            sendAmountHex = this.client.utils.toHex(sendAmountHex)
            const eth = this.client.eth

            const nonce = await eth.getTransactionCount(address)
            const { contract, token, taggedData } = ext || {}
            let res = null
            let privateKey = null
            if (!isLedger) {
                privateKey = await this.getPrivateKey(seed, password)
            }
            if (contract || taggedData) {
                const contractInfo = (nodeInfo.contractList || []).find((e) => e.token === token)
                // if (!contractInfo) {
                //     return Base.globalToast.error('contract error')
                // }
                const tokenAbi = JSON.parse(JSON.stringify(initTokenAbi))
                const web3Contract = new eth.Contract(tokenAbi, contract)
                let gasLimit
                let gasPrice
                if (ext.gas) {
                    gasLimit = this.client.utils.toHex(this.getNumberStr(ext.gas))
                    gasPrice = ext.gasPrice ? this.client.utils.toHex(this.getNumberStr(ext.gasPrice)) : await eth.getGasPrice()
                } else {
                    const contractGasLimit = contractInfo?.gasLimit
                    const gasRes = await this.getGasLimit(contractGasLimit, address, taggedData ? sendAmount : 0, ext.gasMultiple)
                    gasLimit = gasRes.gasLimit
                    gasPrice = gasRes.gasPrice
                }
                if (gasLimit === -1) {
                    const str = I18n.t('assets.evmGasNotSufficient').replace(/{token}/, nodeInfo?.token)
                    Base.globalToast.error(str)
                    throw str
                }
                // const estimatePrice = this.client.utils
                const signData = {
                    to: contract || contractInfo?.contract,
                    value: taggedData ? sendAmountHex : '0x00',
                    from: address,
                    nonce,
                    gasLimit,
                    gasPrice,
                    data: taggedData || web3Contract.methods.transfer(toAddress, sendAmountHex).encodeABI()
                }
                if (contractInfo?.maxPriorityFeePerGas) {
                    signData.maxPriorityFeePerGas = contractInfo?.maxPriorityFeePerGas
                }
                try {
                    let signed = null
                    if (isLedger) {
                        const chainId = await eth.getChainId()
                        delete signData.from
                        signData.chainId = chainId
                        const transport = await this.getTransport()
                        const appEth = new AppEth(transport)
                        let unsignedTx = ethers.utils.serializeTransaction(signData).substring(2)
                        const signature = await appEth.signTransaction(fromInfo.path, unsignedTx)
                        signature.r = '0x' + signature.r
                        signature.s = '0x' + signature.s
                        signature.v = parseInt('0x' + signature.v)
                        signature.from = address
                        const rawTransaction = ethers.utils.serializeTransaction(signData, signature)
                        signed = { rawTransaction }
                    } else {
                        signed = await eth.accounts.signTransaction(signData, privateKey)
                    }
                    res = await eth.sendSignedTransaction(signed.rawTransaction)
                    // this._ethReSend = 0
                } catch (error) {
                    if (String(error).includes(`"gasUsed": ${Number(this.client.utils.BN(gasLimit))}`)) {
                        throw 'out of gas'
                    }
                    if (String(error).includes('insufficient funds for')) {
                        throw I18n.t('assets.evmGasNotSufficient').replace(/{token}/, nodeInfo?.token)
                    }
                    // this._ethReSend = this._ethReSend || 0
                    // if (/gas limit/.test(error.toString()) && this._ethReSend <= 6) {
                    //     this._ethReSend++
                    //     return await this.send(fromInfo, toAddress, sendAmount, {
                    //         ...ext,
                    //         gasMultiple: this._ethReSend + 2
                    //     })
                    // } else {
                    //     this._ethReSend = 0
                    throw this.handleError(error)
                    // }
                }
                traceToken = token
                Trace.transaction('pay', res.transactionHash, address, toAddress, this.getNumberStr(sendAmount), nodeId, token, ext.domain)
            } else {
                const chainId = await eth.getChainId()

                let gasLimit
                let gasPrice
                if (ext.gas) {
                    gasLimit = this.client.utils.toHex(this.getNumberStr(ext.gas))
                    gasPrice = ext.gasPrice ? this.client.utils.toHex(this.getNumberStr(ext.gasPrice)) : await eth.getGasPrice()
                } else {
                    const nodeGasLimit = nodeInfo?.gasLimit
                    const gasRes = await this.getGasLimit(nodeGasLimit, address, sendAmount, ext.gasMultiple)
                    gasLimit = gasRes.gasLimit
                    gasPrice = gasRes.gasPrice
                }
                if (gasLimit === -1) {
                    const str = I18n.t('assets.evmGasNotSufficient').replace(/{token}/, nodeInfo?.token)
                    Base.globalToast.error(str)
                    throw str
                }
                try {
                    let transactionObj = {
                        to: toAddress,
                        value: sendAmountHex,
                        chainId,
                        nonce,
                        gasLimit,
                        gasPrice
                    }
                    let signed = null
                    if (isLedger) {
                        transactionObj = { ...transactionObj, data: '0x00' }
                        const transport = await this.getTransport()
                        const appEth = new AppEth(transport)
                        let unsignedTx = ethers.utils.serializeTransaction(transactionObj).substring(2)
                        const signature = await appEth.signTransaction(fromInfo.path, unsignedTx)
                        signature.r = '0x' + signature.r
                        signature.s = '0x' + signature.s
                        signature.v = parseInt('0x' + signature.v)
                        signature.from = address
                        const rawTransaction = ethers.utils.serializeTransaction(transactionObj, signature)
                        signed = { rawTransaction }
                    } else {
                        transactionObj.from = address
                        signed = await eth.accounts.signTransaction(transactionObj, privateKey)
                    }
                    res = await eth.sendSignedTransaction(signed.rawTransaction)
                    // this._ethReSend = 0
                } catch (error) {
                    if (String(error).includes(`"gasUsed": ${Number(this.client.utils.BN(gasLimit))}`)) {
                        throw 'out of gas'
                    }
                    if (String(error).includes('insufficient funds for')) {
                        throw I18n.t('assets.evmGasNotSufficient').replace(/{token}/, nodeInfo?.token)
                    }
                    // this._ethReSend = this._ethReSend || 0
                    // if (/gas limit/.test(error.toString()) && this._ethReSend <= 6) {
                    //     this._ethReSend++
                    //     return await this.send(fromInfo, toAddress, sendAmount, {
                    //         ...ext,
                    //         gasMultiple: this._ethReSend + 2
                    //     })
                    // } else {
                    //     this._ethReSend = 0
                    throw this.handleError(error)
                    // }
                }
                traceToken = nodeInfo.token
                Trace.transaction('pay', res.transactionHash, address, toAddress, this.getNumberStr(sendAmount), nodeId, nodeInfo.token, ext.domain)
            }
            const logInfo = res?.logs?.[0]
            const topics = logInfo?.topics || []
            const initTopics = ['0xe6497e3ee548a3372136af2fcb0696db31fc6cf20260707645068bd3fe97f3c4', '0x0000000000000000000000000000000000000000000000000000000000001010']
            for (let i = 0; i < 4; i++) {
                topics[i] = topics[i] || initTopics[i] || ''
            }
            const logData = {
                address: logInfo?.address || '0x0000000000000000000000000000000000001010',
                blockHash: res.blockHash,
                blockNumber: res.blockNumber,
                data: logInfo?.data || this.fill64Len(sendAmountHex),
                id: logInfo?.id || res.transactionHash,
                logIndex: logInfo?.logIndex || res.transactionIndex,
                removed: logInfo?.removed || res.status,
                topics: topics,
                from: res.from,
                to: res.to,
                transactionHash: logInfo?.transactionHash || res.transactionHash,
                transactionIndex: logInfo?.transactionIndex || res.transactionIndex
            }
            this.setPastLogs(address, nodeId, [logData]).then(() => {
                this.refreshAssets()
            })
            actionTime = new Date().getTime() - actionTime
            Trace.actionLog(40, address, actionTime, Base.curLang, nodeId, traceToken)
            Base.globalToast.success(I18n.t('assets.sendSucc'))
            if (Base.isBrowser) {
                setTimeout(() => {
                    Base.globalToast.hideLoading()
                }, 2000)
            }
            setTimeout(() => {
                this.refreshAssets()
            }, 5000)
            return { ...res, messageId: logData.transactionHash }
        } else {
            if (this.curNode?.bech32HRP) {
                const reg = new RegExp(`^${this.curNode?.bech32HRP}`)
                if (!reg.test(toAddress)) {
                    throw I18n.t('assets.sendError')
                }
            }
            let sendOut = null
            let amount = 0
            let { taggedData, tokenId, nftId, decimal, token, tag, metadata } = ext || {}
            tag = tag || 'TanglePay'
            // smr token
            if (tokenId) {
                amount = Base.formatNum(BigNumber(sendAmount).div(Math.pow(10, decimal || 6)))
                try {
                    const func = this.curNode?.sendTokenV2 ? 'SMRTokenSendV2' : 'SMRTokenSend'
                    sendOut = await this[func](fromInfo, toAddress, sendAmount, ext)
                } catch (error) {
                    throw error
                }
            } else if (nftId) {
                amount = 1
                try {
                    sendOut = await this.SMRNFTSend(fromInfo, toAddress, sendAmount, ext)
                } catch (error) {
                    throw error
                }
            } else {
                amount = Base.formatNum(BigNumber(sendAmount).div(Math.pow(10, this.curNode.decimal || 6)))
                let genAddressFunc = null
                let signatureFunc = null
                let getHardwareBip32Path = null
                if (isLedger) {
                    genAddressFunc = async (index) => {
                        const [{ address, path }] = await this.getHardwareAddressInIota(nodeId, index, false, 1)
                        return { address, path }
                    }
                    signatureFunc = async (essenceHash, inputs, outputs, isBinaryEssence) => {
                        let hasRemainder = false
                        let consumedBalance = new BigNumber(0)
                        for (const output of outputs) {
                            consumedBalance = consumedBalance.plus(output.amount)
                        }
                        if (consumedBalance.isGreaterThan(sendAmount)) {
                            hasRemainder = true
                        }
                        return await this.getHardwareIotaSign(nodeId, essenceHash, inputs, hasRemainder, isBinaryEssence)
                    }
                    getHardwareBip32Path = (path) => {
                        return AppIota._validatePath(path)
                    }
                }
                try {
                    sendOut = await IotaObj.sendMultiple(
                        this.client,
                        baseSeed,
                        0,
                        [
                            this.processFeature({
                                addressBech32: toAddress,
                                amount: sendAmount,
                                isDustAllowance: false,
                            }, { metadata, tag })
                        ],
                        {
                            key: IotaObj.Converter.utf8ToBytes(tag), //v1
                            tag: IotaObj.Converter.utf8ToBytes(tag), //v2
                            data: isLedger
                                ? undefined
                                : taggedData
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
                        },
                        genAddressFunc,
                        signatureFunc,
                        getHardwareBip32Path
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
            const outputs = _get(sendOut, 'message.payload.essence.outputs') || _get(sendOut, 'block.payload.essence.outputs') || []
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
            const traceToken = tokenId ? token : nftId ? nftId : nodeInfo.token
            actionTime = new Date().getTime() - actionTime
            try {
                Trace.transaction('pay', messageId, address, toAddress, sendAmount, nodeId, traceToken, ext.domain)
                Trace.actionLog(40, address, actionTime, Base.curLang, nodeId, traceToken)
            } catch (error) {}
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
            setTimeout(() => {
                this.refreshAssets()
            }, 10000)
            setTimeout(() => {
                this.refreshAssets()
            }, 60000)
            return { ...sendOut, messageId }
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
    async blockData(blockId) {
        let res = await Base.getLocalData(`search.${blockId}`)
        if (!res) {
            try {
                res = await this.requestQueue([
                    Http.GET(`${this.explorerApiUrl}/search/${this.curNode.network}/${blockId}`, {
                        isHandlerError: true
                    })
                ])
                await Base.setLocalData(`search.${blockId}`, res)
            } catch (error) {
                return null
            }
        }
        return res
    },
    // handle output 404
    async outputData(outputId) {
        let res = await Base.getLocalData(`outputId.${outputId}`)
        if (!res) {
            try {
                res = await this.requestQueue([
                    // this.client.output(outputId),
                    Http.GET(`${this.explorerApiUrl}/output/${this.curNode.network}/${outputId}`, {
                        isHandlerError: true
                    })
                ])
                await Base.setLocalData(`outputId.${outputId}`, res)
            } catch (error) {
                return null
            }
        }
        return res?.output ? res?.output : res
    },
    // handle message 404 ？
    async messageMetadata(messageId) {
        let res = await Base.getLocalData(`messageId.${messageId}`)
        if (!res) {
            res = await this.requestQueue([
                // this.client.messageMetadata(messageId),
                Http.GET(`${this.explorerApiUrl}/message/${this.curNode.network}/${messageId}`, {
                    isHandlerError: true
                })
            ])
            await Base.setLocalData(`messageId.${messageId}`, res)
        }
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
        let res = await Base.getLocalData(`search.${transactionId}`)
        if (!res) {
            try {
                res = await this.requestQueue([
                    // this.client.transactionIncludedMessage(transactionId),
                    Http.GET(`${this.explorerApiUrl}/search/${this.curNode.network}/${transactionId}`, {
                        isHandlerError: true
                    })
                ])
                await Base.setLocalData(`search.${transactionId}`, res)
            } catch (error) {
                return null
            }
        }
        return res?.message?.payload ? res?.message : res
    },
    async batchRequest(list, request) {
        const arr = _chunk(list, 30)
        let datas = []
        try {
            for (const a of arr) {
                const res = await Promise.all(a.map((e) => request(e)))
                datas = [...datas, ...res]
            }
        } catch (error) {
            console.log('batchRequest---error---', error)
        }
        return datas
    },
    async getHisList(outputList, { address, nodeId }, smrOutputIds) {
        if (!this.client) {
            return Base.globalToast.error(I18n.t('user.nodeError') + ':' + (this?.curNode?.curNodeKey || this?.curNode?.name))
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
                let outputDatas = await this.batchRequest(
                    smrOutputIds.map((e) => e.outputId),
                    (arg) => this.outputData(arg)
                )
                outputDatas = outputDatas.filter((e) => !!e)
                let blockDatas = await this.batchRequest(
                    outputDatas.map((e) => (!e.metadata?.isSpent ? e.metadata.blockId : e.metadata?.transactionId)),
                    (arg) => this.blockData(arg)
                )
                // let outputDatas = await Promise.all(smrOutputIds.map((e) => this.outputData(e.outputId)))
                // const blockDatas = await Promise.all(outputDatas.map((e) => this.blockData(!e.metadata?.isSpent ? e.metadata.blockId : e.metadata?.transactionId)))
                let blockIds = []
                allList = outputDatas.map((e, i) => {
                    if (!blockDatas[i]) {
                        return null
                    }
                    const { blockId, isSpent, transactionId, outputIndex } = e.metadata
                    const isOldisSpent = blockIds.includes(blockId)
                    blockIds.push(blockId)
                    const blockData = blockDatas[i]?.transactionBlock || blockDatas[i]?.block || {}
                    const unlockBlocks = blockData?.payload?.unlocks || []
                    const unlockBlock = unlockBlocks.find((e) => e.signature)
                    let payloadData = blockData?.payload?.essence?.payload?.data || ''
                    try {
                        payloadData = IotaObj.Converter.hexToUtf8(payloadData)
                        payloadData = JSON.parse(payloadData)
                    } catch (error) {
                        payloadData = {}
                    }
                    return {
                        // isSpent: isOldisSpent ? false : isSpent,
                        isSpent: smrOutputIds[i].isSpent,
                        timestamp: smrOutputIds[i].milestoneTimestamp,
                        blockId: isSpent ? transactionId : blockId,
                        outputBlockId: blockId,
                        decimal: nodeInfo.decimal,
                        unlockBlock,
                        bech32Address: address,
                        outputs: blockData?.payload?.essence?.outputs || [],
                        output: e.output,
                        mergeTransactionId: smrOutputIds[i].milestoneIndex,
                        transactionId,
                        transactionOutputIndex: outputIndex,
                        outputSpent: isSpent,
                        payloadData
                    }
                })
                allList = allList.filter((e) => !!e)
            } else {
                let outputDatas = await this.batchRequest(outputList, (arg) => this.outputData(arg))
                outputDatas = outputDatas.filter((e) => !!e)
                let metadataList = await this.batchRequest(
                    outputDatas.map((e) => e.messageId),
                    (arg) => this.messageMetadata(arg)
                )
                // const outputDatas = await Promise.all(outputList.map((e) => this.outputData(e)))
                // let metadataList = await Promise.all(outputDatas.map((e) => this.messageMetadata(e.messageId)))
                const newMetadataList = []
                const newOutputDatas = []
                metadataList.forEach((e, i) => {
                    if (e) {
                        newMetadataList.push(e)
                        newOutputDatas.push(outputDatas[i])
                    }
                })
                const milestoneList = await this.batchRequest(
                    newMetadataList.map((e) => e.referencedByMilestoneIndex),
                    (arg) => this.milestone(arg)
                )
                const transactionFrom = await this.batchRequest(
                    newOutputDatas.map((e) => e.transactionId),
                    (arg) => this.transactionIncludedMessage(arg)
                )
                // const milestoneList = await Promise.all(newMetadataList.map((e) => this.milestone(e.referencedByMilestoneIndex)))
                // const transactionFrom = await Promise.all(newOutputDatas.map((e) => this.transactionIncludedMessage(e.transactionId)))
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
        const isLedger = wallet.type == 'ledger'
        type = parseInt(type)
        const { seed, password } = wallet
        let address = ''
        if (!isLedger) {
            if (type === 3 && _get(tokens, '0.address')) {
                address = _get(tokens, '0.address')
            } else {
                address = await this.getBalanceAddress({ seed, password })
            }
        } else {
            address = wallet.address
        }
        let baseSeed = null
        if (!isLedger) {
            baseSeed = this.getSeed(seed, password)
        }
        let datas = []
        if ([1, 2, 4].includes(type)) {
            tokens.forEach((e) => {
                datas = [...datas, ...IotaObj.Converter.hexToBytes(e.eventId), 0]
            })
            datas.unshift(tokens.length)
        }
        datas = Uint8Array.from(datas)

        let genAddressFunc = null
        let signatureFunc = null
        let getHardwareBip32Path = null
        const nodeId = wallet.nodeId
        if (isLedger) {
            genAddressFunc = async (index) => {
                const [{ address, path }] = await this.getHardwareAddressInIota(nodeId, index, false, 1)
                return { address, path }
            }
            signatureFunc = async (essenceHash, inputs, outputs, isBinaryEssence) => {
                let hasRemainder = false
                let consumedBalance = new BigNumber(0)
                for (const output of outputs) {
                    consumedBalance = consumedBalance.plus(output.amount)
                }
                if (consumedBalance.isGreaterThan(amount)) {
                    hasRemainder = true
                }
                return await this.getHardwareIotaSign(nodeId, essenceHash, inputs, hasRemainder, isBinaryEssence)
            }
            getHardwareBip32Path = (path) => {
                return AppIota._validatePath(path)
            }
        }
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
            },
            genAddressFunc,
            signatureFunc,
            getHardwareBip32Path
        )
        return res
    },
    /**************** Staking end *******************/
    /**************** Sign start ********************/
    async iota_sign(wallet, content) {
        if (!wallet || !wallet.address) {
            return false
        }
        const isLedger = wallet.type == 'ledger'
        let signRes = null
        if (isLedger) {
            const transport = await this.getTransport()
            if (this.checkWeb3Node(wallet.nodeId)) {
                let appEth = new AppEth(transport)
                const result = await appEth.signPersonalMessage(wallet.path, Buffer.from(content).toString('hex'))
                var v = result['v'] - 27
                v = v.toString(16)
                if (v.length < 2) {
                    v = '0' + v
                }
                return `0x${result['r']}${result['s']}${v}`
            } else {
                const isSMR = this.checkSMR(wallet.nodeId)
                let appIota = new AppIota(transport)
                const [pathCoinType, cointType] = this.getHardwareCoinParams(wallet.nodeId, 0)
                const arr = AppIota._validatePath(`2c'/${pathCoinType}'/0'/0'/0'`)
                await appIota._setAccount(arr[2], { id: cointType })
                if (isSMR) {
                    const addressOutputIds = await this.IndexerPluginClient.outputs({
                        addressBech32: wallet.address
                    })
                    if (addressOutputIds.items.length == 0) {
                        return ''
                    }
                    const addressOutput = await this.client.output(addressOutputIds.items[0])
                    const protocolInfo = await this.client.protocolInfo()
                    // networkId, inputsAndSignatureKeyPairs, outputs, taggedData, signatureFunc, getHardwareBip32Path
                    const signatureFunc = async (essenceHash, inputs, outputs, isBinaryEssence) => {
                        return await this.getHardwareIotaSign(wallet.nodeId, essenceHash, inputs, true, isBinaryEssence)
                    }
                    const getHardwareBip32Path = (path) => {
                        return AppIota._validatePath(path)
                    }
                    const info = await IotaObj.buildTransactionPayload(
                        protocolInfo.networkId,
                        [
                            {
                                input: {
                                    type: 0,
                                    transactionId: addressOutput.metadata.transactionId,
                                    transactionOutputIndex: addressOutput.metadata.outputIndex,
                                    hardwarePath: wallet.path
                                },
                                consumingOutput: addressOutput.output
                            }
                        ],
                        [
                            {
                                amount: '1000000',
                                address: this.bech32ToHex(wallet.address),
                                addressType: 0
                            }
                        ],
                        {
                            tag: IotaObj.Converter.utf8ToBytes('TanglePay-Sign'),
                            data: IotaObj.Converter.utf8ToBytes(content)
                        },
                        signatureFunc,
                        getHardwareBip32Path
                    )
                    return info?.unlocks?.[0]?.signature?.signature
                } else {
                    const res = await Http.GET(`${this.explorerApiUrl}/search/${this.curNode.network}/${wallet.address}`, {
                        isHandlerError: true
                    })
                    const addressOutputIds = res?.addressOutputIds || []
                    console.log(addressOutputIds)
                    if (addressOutputIds.length == 0) {
                        return ''
                    }

                    const addressOutput = await this.client.output(addressOutputIds[0])
                    console.log(addressOutput)
                    // inputsAndSignatureKeyPairs, outputs, indexation, signatureFunc, getHardwareBip32Path
                    // const signatureFunc = async (essenceHash, inputs, outputs, isBinaryEssence) => {
                    //     return await this.getHardwareIotaSign(wallet.nodeId, essenceHash, inputs, true, isBinaryEssence)
                    // }
                    const getHardwareBip32Path = (path) => {
                        return AppIota._validatePath(path)
                    }
                    const signatureFunc = async (essenceHash, inputs, outputs, isBinaryEssence) => {
                        return await this.getHardwareIotaSign(wallet.nodeId, essenceHash, inputs, false, isBinaryEssence)
                    }

                    const info = await IotaObj.buildTransactionPayload(
                        [
                            {
                                input: {
                                    type: 0,
                                    transactionId: addressOutput.transactionId,
                                    transactionOutputIndex: addressOutput.outputIndex,
                                    hardwarePath: wallet.path
                                }
                            }
                        ],
                        [
                            {
                                addressType: 0,
                                address: this.bech32ToHex(wallet.address),
                                amount: '1000000'
                            }
                        ],
                        {
                            key: IotaObj.Converter.utf8ToBytes('TanglePay-Sign'),
                            data: IotaObj.Converter.utf8ToBytes(content)
                        },
                        signatureFunc,
                        getHardwareBip32Path
                    )
                    let sign = info?.unlockBlocks?.[0]?.signature?.signature
                    sign = sign ? `0x${sign}` : ''
                    return sign
                }
            }
        } else {
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
        }
        return signRes
    },
    /**************** Sign end **********************/

    /**************** Nft start *******************/
    async getNfts(addressList) {
        const ethAddressList = []
        const iotaAddressList = []
        const shimmerAddressList = []
        addressList.forEach((e) => {
            if (/^0x/i.test(e)) {
                ethAddressList.push(e)
            } else if (/^iota/i.test(e) || /^atoi/i.test(e)) {
                iotaAddressList.push(e)
            } else if (/^smr/i.test(e) || /^rms/i.test(e)) {
                shimmerAddressList.push(e)
            }
        })
        let actionTime = new Date().getTime()

        let iotaMemberIds = await Promise.all(
            iotaAddressList.map((e) => {
                return fetch(`https://soonaverse.com/api/getMany?collection=member&fieldName=validatedAddress.iota&fieldValue=${e}`)
                    .then((res) => res.json())
                    .catch(() => [])
            })
        )
        iotaMemberIds = _flatten(iotaMemberIds)
        let ethMemberIds = await Promise.all(
            ethAddressList.map((e) => {
                return fetch(`https://soonaverse.com/api/getById?collection=member&uid=${e}`)
                    .then((res) => res.json())
                    .catch(() => null)
            })
        )
        ethMemberIds = ethMemberIds.filter((e) => !!e)

        iotaMemberIds = [...iotaMemberIds, ...ethMemberIds]
        let res = await Promise.all(
            iotaMemberIds.map((e) => {
                return fetch(`https://soonaverse.com/api/getMany?collection=nft&fieldName=owner&fieldValue=${e.uid}`)
                    .then((res) => res.json())
                    .catch(() => [])
            })
        )
        res = _flatten(res)
        res.forEach((e) => {
            e.createTime = e?.createdOn?._seconds
        })
        let shimmerRes = []
        if (this.IndexerPluginClient) {
            const outputs = await Promise.all(
                shimmerAddressList.map((e) => {
                    return this.IndexerPluginClient.nfts({
                        addressBech32: e
                    })
                })
            )
            let outputIds = []
            outputs.forEach((e) => {
                outputIds = [...outputIds, ...e.items]
            })
            const nftInfos = await Promise.all(
                outputIds.map((e) => {
                    return this.client.output(e)
                })
            )
            nftInfos.forEach((e, i) => {
                let info = (e?.output?.immutableFeatures || []).find((d) => {
                    return d.type == 2
                })
                if (info && info.data) {
                    try {
                        info = IotaObj.Converter.hexToUtf8(info.data)
                        info = JSON.parse(info)
                        let nftId = e?.output?.nftId
                        if (nftId == 0) {
                            nftId = IotaObj.TransactionHelper.resolveIdFromOutputId(outputIds[i])
                        }
                        const unlockConditions = e?.output?.unlockConditions || []
                        const immutableFeatures = e?.output?.immutableFeatures || []
                        const isUnlock = IotaObj.checkUnLock(e)
                        const lockData = unlockConditions.find((d) => d.type == 2) //TIMELOCK_UNLOCK_CONDITION_TYPE
                        const expirationData = unlockConditions.find((d) => d.type == 3) // EXPIRATION_UNLOCK_CONDITION_TYPE
                        const lockTime = lockData?.unixTime
                        const expirationTime = expirationData?.unixTime
                        const isExpiration = expirationTime && expirationTime <= new Date().getTime() / 1000
                        let unlockAddress = expirationData?.returnAddress?.pubKeyHash
                        if (lockData) {
                            unlockAddress = immutableFeatures.find((d) => d.type == 1)?.address?.nftId
                            if (!unlockAddress) {
                                unlockAddress = unlockConditions.find((d) => d.type == 0)?.address?.pubKeyHash
                            }
                        }
                        if (unlockAddress) {
                            unlockAddress = this.hexToBech32(unlockAddress)
                        }
                        shimmerRes.push({
                            ...info,
                            nftId: nftId,
                            outputId: outputIds[i],
                            isUnlock,
                            lockType: expirationData?.type || lockData?.type || 0,
                            lockTime,
                            isExpiration,
                            expirationTime,
                            unlockAddress,
                            outputData: e,
                            createTime: e?.metadata?.milestoneTimestampBooked
                        })
                    } catch (error) {}
                }
            })
            shimmerRes.forEach((e) => {
                e.isSMR = true
            })
        }

        res = [...res, ...shimmerRes]

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
                Base.globalToast.error(I18n.t('user.nodeError') + ':' + (this?.curNode?.curNodeKey || this?.curNode?.name))
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
            const tokenAbi = JSON.parse(JSON.stringify(initTokenAbi))
            return new this.client.eth.Contract(tokenAbi, e.contract)
        })
        const decimals = await this.getContractDecimals(contractList, token0Contract)
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
            if (contractInfo) {
                token = contractInfo?.token
            }
            let otherAddress = ''
            if (e.from && e.to) {
                e.from = e.from.toLocaleLowerCase()
                e.to = e.to.toLocaleLowerCase()
                if (e.from == address) {
                    type = 1
                    otherAddress = e.to
                } else {
                    type = 0
                    otherAddress = e.from
                }
            } else {
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
    importContract(contract, token, decimal = null, gasLimit = 21000, maxPriorityFeePerGas = 0) {
        const nodes = this.nodes
        contract = String(contract).toLocaleLowerCase()
        if (this.curNode) {
            this._nodes.forEach((e) => {
                if (e.id == this.curNode.id) {
                    const index = e.contractList.findIndex((c) => c.contract.toLocaleLowerCase() == contract)
                    if (index == -1) {
                        e.contractList.push({
                            contract,
                            token,
                            gasLimit,
                            maxPriorityFeePerGas,
                            decimal
                        })
                    } else {
                        e.contractList[index] = {
                            ...e.contractList[index],
                            contract,
                            token,
                            gasLimit,
                            maxPriorityFeePerGas,
                            decimal
                        }
                    }
                }
            })
            this.curNode = this._nodes.find((e) => e.id == this.curNode.id)
            Base.setLocalData('tanglePayNodeList', {
                list: this._nodes
            })
        }
    },
    getContract(contract) {
        if (this.client.eth) {
            const tokenAbi = JSON.parse(JSON.stringify(initTokenAbi))
            return new this.client.eth.Contract(tokenAbi, contract)
        }
        return null
    },
    getNFTContract(contract) {
        if (this.client.eth) {
            const nonfungiblePositionManagerAbi = JSON.parse(JSON.stringify(nonfungiblePositionManager))
            return new this.client.eth.Contract(nonfungiblePositionManagerAbi, contract)
        }
        return null
    },
    async parseNFTTokenURI(tokenURI) {
        try {
            const base64EncodePrefix = 'data:application/json;base64,'
            if(tokenURI && tokenURI.startsWith(base64EncodePrefix)) {
                return JSON.parse(
                    IotaSDK.hexToUtf8(
                        IotaSDK.bytesToHex(
                            Base64.decode(
                                tokenURI.replace(base64EncodePrefix, '')
                            )
                        )
                    )
                )
            }
            return await fetch(tokenURI).then(res => res.json())
        }catch(error) {
            return null
        }
    },
    async checkNFTOwner(nftContract, tokenId, address) {
        if(!address) {
            return false
        }
        try {
            const owner = await nftContract.methods.ownerOf(tokenId).call()
            if(owner.toLocaleLowerCase() !== address.toLocaleLowerCase()) {
                return false
            }
            return true
        }catch(error) {
            return false
        }
    },
    getOtherContract(list, contract, functionSign) {
        let item = null
        let curContract = null
        for (let i = 0; i < list.length; i++) {
            const abi = list[i]
            const abiContract = new this.client.eth.Contract(abi, contract)
            item = abi.find((e) => e.signature === functionSign)
            if (item) {
                curContract = abiContract
                break
            }
        }
        return [item, curContract]
    },
    async getAbiConfig() {
        try {
            const abiRes = await fetch(`${API_URL}/abi/abi.json?v=${new Date().getTime()}`).then((d) => d.json())
            const { list } = abiRes
            const abiList = await Promise.all(
                list.map((e) => {
                    return fetch(`${API_URL}/abi/${e}.json?v=${new Date().getTime()}`).then((d) => d.json())
                })
            )
            Base.setLocalData('abiList', abiList)
            return abiList
        } catch (error) {
            let list = await Base.getLocalData('abiList')
            if (!list || !list.length) {
                const LpRouterAbi = require('../abi/LpRouter.json')
                const PoolAbi = require('../abi/Pool.json')
                const SwapRouterAbi = require('../abi/SwapRouter.json')
                const FactoryAbi = require('../abi/Factory.json')
                list = [LpRouterAbi, PoolAbi, SwapRouterAbi, FactoryAbi]
            }
            return list
        }
    },
    async getAbiParams(contract, hex) {
        if (!/^0x/.test(hex)) {
            hex = `0x${hex}`
        }
        let web3Contract = this.getContract(contract)
        const obj = {
            functionName: '',
            params: [],
            web3Contract,
            isErc20: true
        }
        if (web3Contract) {
            const bytes = this.client.utils.hexToBytes(hex)
            let functionSign = bytes.slice(0, 4)
            functionSign = this.client.utils.bytesToHex(functionSign)
            let item = web3Contract._jsonInterface.find((e) => e.signature === functionSign)
            if (!item) {
                const abiList = await this.getAbiConfig()
                const [abiItem, abiContract] = this.getOtherContract(abiList, contract, functionSign)
                if (abiItem) {
                    item = abiItem
                    obj.web3Contract = abiContract
                }
                obj.isErc20 = false
            }
            if (item) {
                const abi = this.client.eth.abi
                const paramsHex = this.client.utils.bytesToHex(bytes.slice(4))
                obj.functionName = item.name
                obj.params = abi.decodeParameters(item.inputs, paramsHex)
                obj.inputs = item.inputs
            } else {
                obj.functionName = functionSign
                obj.params = {
                    0: hex
                }
                obj.inputs = []
            }
        }
        return obj
    },
    async getContractDecimals(contractList, token0Contracts) {
        const getDecimal = async (i) => {
            try {
                if (contractList[i].decimal) {
                    return contractList[i].decimal
                }
                return await token0Contracts[i].methods.decimals().call()
            } catch (error) {
                console.log(error, '______')
                return 0
            }
        }
        return await Promise.all(
            token0Contracts.map((e, i) => {
                return getDecimal(i)
            })
        )
    },
    async getContractAssets(nodeId, address, walletId) {
        const nodeInfo = this.nodes.find((e) => e.id == nodeId)
        if (!nodeInfo?.contractList?.length) {
            return []
        }
        let actionTime = new Date().getTime()
        const token0Contract = nodeInfo.contractList.map((e) => {
            const tokenAbi = JSON.parse(JSON.stringify(initTokenAbi))
            return new this.client.eth.Contract(tokenAbi, e.contract)
        })
        const decimals = await this.getContractDecimals(nodeInfo.contractList, token0Contract)
        // const coinbase = await this.client.eth.getCoinbase()
        const getBalanceOf = async (e) => {
            try {
                return await e.methods.balanceOf(address).call()
            } catch (error) {
                return 0
            }
        }
        let balanceList = await Promise.all(
            token0Contract.map((e) => {
                return getBalanceOf(e)
            })
        )
        balanceList = balanceList.map((e, i) => {
            const token = nodeInfo.contractList[i].token
            Trace.updateAddressAmount(walletId, address, e, nodeId, token)
            const decimal = decimals[i]
            return {
                token,
                balance: this.getNumberStr(Number(BigNumber(e).div(Math.pow(10, decimal)))),
                realBalance: e,
                contract: nodeInfo.contractList[i].contract,
                decimal
            }
        })
        actionTime = new Date().getTime() - actionTime
        const traceToken = nodeInfo.contractList.map((e) => e.token).join('-')
        Trace.actionLog(10, address, actionTime, Base.curLang, nodeId, traceToken)
        return balanceList
    },
    /**************** web3 end *******************/
    /**************** SMR start *******************/
    SMR_NODE_ID: 102,
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
            throw I18n.t('account.importDuplicate')
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
                    const nodeInfo = this.curNode.id == this.IOTA_NODE_ID ? initNodeList.find((e) => this.checkSMR(e.id)) : shimmerTestnet
                    const addressBech32 = IotaNext.Bech32Helper.toBech32(IotaNext.ED25519_ADDRESS_TYPE, indexPublicKeyAddress, nodeInfo.bech32HRP)

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
        let { tokenId, token, taggedData, realBalance, mainBalance, tag, metadata } = ext
        tag = tag || 'TanglePay'
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
        let receiverOutput = this.processFeature({
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
        }, { metadata, tag })
        const receiverStorageDeposit = IotaObj.TransactionHelper.getStorageDeposit(receiverOutput, this.info.protocol.rentStructure)
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
        const minBalance = IotaObj.TransactionHelper.getStorageDeposit(
            {
                address: `0x${this.bech32ToHex(address)}`,
                addressType: 0, // ED25519_ADDRESS_TYPE
                type: 3, //BASIC_OUTPUT_TYPE
                amount: '',
                unlockConditions: [
                    {
                        type: 0, // ADDRESS_UNLOCK_CONDITION_TYPE
                        address: IotaObj.Bech32Helper.addressFromBech32(address, this.info.protocol.bech32Hrp)
                    }
                ],
            },
            this.info.protocol.rentStructure
        )
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
                                address: IotaObj.Bech32Helper.addressFromBech32(bech32Address, this.info.protocol.bech32Hrp)
                            }
                        ],
                    }
                } else {
                    remainderOutput = null
                }
                if (outputBalance.gte(minBalance) || outputBalance.eq(0)) {
                    finished = true
                }
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
                                const isUnlock = IotaObj.checkUnLock(addressOutput)
                                //BASIC_OUTPUT_TYPE
                                if (outputType == 3 && isUnlock) {
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
                                                            address: IotaObj.Bech32Helper.addressFromBech32(bech32Address, this.info.protocol.bech32Hrp)
                                                        }
                                                    ]
                                                }
                                                otherNativeTokens.forEach((t) => {
                                                    if (!otherTokensOutput.nativeTokens.includes(t.id)) {
                                                        otherTokensOutput.nativeTokens.push({
                                                            ...t
                                                        })
                                                    } else {
                                                        const tData = otherTokensOutput.nativeTokens.find((k) => k.id == t.id)
                                                        tData.amount = BigNumber(tData.amount).plus(t.amount)
                                                        tData.amount = `0x${tData.amount.toString(16)}`
                                                    }
                                                })
                                                const newOtherTokensStorageDeposit = IotaObj.TransactionHelper.getStorageDeposit(otherTokensOutput, this.info.protocol.rentStructure).toString()
                                                otherTokensOutput.amount = newOtherTokensStorageDeposit
                                                outputBalance = outputBalance.plus(otherTokensStorageDeposit).minus(newOtherTokensStorageDeposit)
                                                setOutput(outputBalance, bech32Address)
                                                otherTokensStorageDeposit = newOtherTokensStorageDeposit
                                            }
                                            if (outputSMRBalance.minus(sendAmount).gte(0)) {
                                                if (outputSMRBalance.minus(sendAmount).gt(0)) {
                                                    const addressUnlockCondition = addressOutput.output.unlockConditions.find(
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
                                                                    amount: `0x${outputSMRBalance.minus(sendAmount).toString(16)}`
                                                                }
                                                            ],
                                                            unlockConditions: [
                                                                {
                                                                    type: 0, // ADDRESS_UNLOCK_CONDITION_TYPE
                                                                    address: IotaObj.Bech32Helper.addressFromBech32(bech32Address, this.info.protocol.bech32Hrp)
                                                                }
                                                            ],
                                                        }
                                                        remainderStorageDeposit = IotaObj.TransactionHelper.getStorageDeposit(remainderSMROutput, this.info.protocol.rentStructure)
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
                    .replace(/{deposit}/g, Number(receiverStorageDeposit.toString()) + Number(remainderStorageDeposit.toString() + Number(otherTokensStorageDeposit)))
                    .replace(/{balance1}/g, realBalance)
                    .replace(/{balance2}/g, mainBalance)
                    .replace(/{balance3}/g, Number(outputBalance))
                throw new Error(str)
            }
            const res = await IotaObj.sendAdvanced(this.client, inputsAndSignatureKeyPairs, outputs, {
                tag: IotaObj.Converter.utf8ToBytes(tag),
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
    // cache , collection
    async SMRTokenSendV2(fromInfo, toAddress, sendAmount, ext) {
        const { seed, password, address, nodeId } = fromInfo
        const isLedger = fromInfo.type === 'ledger'
        let baseSeed = null
        if (!isLedger) {
            baseSeed = this.getSeed(seed, password)
        }
        let { tokenId, token, taggedData, realBalance, mainBalance, tag, metadata } = ext
        tag = tag || 'TanglePay'
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
        let receiverOutput = this.processFeature({
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
            ],
        }, { metadata, tag })
        const receiverStorageDeposit = IotaObj.TransactionHelper.getStorageDeposit(receiverOutput, this.info.protocol.rentStructure)
        receiverOutput.amount = receiverStorageDeposit.toString()
        let remainderStorageDeposit = 0
        let outputBalance = BigNumber(receiverOutput.amount * -1)
        let zeroBalance = 0
        const genAddressFunc = async (index) => {
            const [{ address, path }] = await this.getHardwareAddressInIota(nodeId, index, false, 1)
            return { address, path }
        }

        let getHardwareBip32Path = null
        let signatureFunc = null
        if (isLedger) {
            signatureFunc = async (essenceHash, inputs, outputs, isBinaryEssence) => {
                return await this.getHardwareIotaSign(nodeId, essenceHash, inputs, true, isBinaryEssence)
            }
            getHardwareBip32Path = (path) => {
                return AppIota._validatePath(path)
            }
        }

        const getAddressOutputs = async () => {
            let addressKeyPair = null
            let bech32Address = ''
            let hardwarePath = ''
            const path = IotaObj.generateBip44Address(initialAddressState)
            if (!isLedger) {
                const addressSeed = baseSeed.generateSeedFromPath(new IotaObj.Bip32Path(path))
                addressKeyPair = addressSeed.keyPair()
                const ed25519Address = new IotaObj.Ed25519Address(addressKeyPair.publicKey)
                const addressBytes = ed25519Address.toAddress()
                bech32Address = IotaObj.Bech32Helper.toBech32(0, addressBytes, this.info.protocol.bech32Hrp) // ED25519_ADDRESS_TYPE
            } else {
                const hardwareAddressRes = await genAddressFunc(initialAddressState.addressIndex)
                bech32Address = hardwareAddressRes.address
                hardwarePath = hardwareAddressRes.path
            }
            const cacheOutputDatas = (await Base.getLocalData(`${nodeId}.${address}.shimmerOutputDatas`)) || []
            return { addressOutputs: cacheOutputDatas[bech32Address] || [], addressKeyPair, bech32Address, hardwarePath }
        }
        const pushInput = (addressKeyPair, addressOutput, hardwarePath) => {
            const input = {
                type: 0, // UTXO_INPUT_TYPE
                transactionId: addressOutput.metadata.transactionId,
                transactionOutputIndex: addressOutput.metadata.outputIndex,
                hardwarePath
            }
            const inputData = {
                input,
                consumingOutput: addressOutput.output
            }
            if (addressKeyPair) {
                inputData.addressKeyPair = addressKeyPair
            }
            inputsAndSignatureKeyPairs.push(inputData)
        }
        const minBalance = IotaObj.TransactionHelper.getStorageDeposit(
            {
                address: `0x${this.bech32ToHex(address)}`,
                addressType: 0, // ED25519_ADDRESS_TYPE
                type: 3, //BASIC_OUTPUT_TYPE
                amount: '',
                unlockConditions: [
                    {
                        type: 0, // ADDRESS_UNLOCK_CONDITION_TYPE
                        address: IotaObj.Bech32Helper.addressFromBech32(address, this.info.protocol.bech32Hrp)
                    }
                ]
            },
            this.info.protocol.rentStructure
        )
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
                                address: IotaObj.Bech32Helper.addressFromBech32(bech32Address, this.info.protocol.bech32Hrp)
                            }
                        ]
                    }
                } else {
                    remainderOutput = null
                }
                if (outputBalance.gte(minBalance) || outputBalance.eq(0)) {
                    finished = true
                } else {
                    finished = false
                }
            } else {
                finished = false
            }
        }
        try {
            do {
                const { addressOutputs, addressKeyPair, bech32Address, hardwarePath } = await getAddressOutputs()
                if (addressOutputs.length > 0) {
                    for (const addressOutput of addressOutputs) {
                        if (!addressOutput.metadata.isSpent) {
                            if (BigNumber(addressOutput.output.amount).eq(0)) {
                                zeroBalance++
                            } else {
                                const outputType = addressOutput?.output?.type
                                const isUnlock = IotaObj.checkUnLock(addressOutput)
                                //BASIC_OUTPUT_TYPE
                                if (outputType == 3 && isUnlock) {
                                    const nativeTokens = addressOutput?.output?.nativeTokens || []
                                    const curToken = nativeTokens.find((e) => e.id === tokenId)
                                    if (curToken) {
                                        if (!SMRFinished) {
                                            outputSMRBalance = outputSMRBalance.plus(curToken.amount)
                                            pushInput(addressKeyPair, addressOutput, hardwarePath)
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
                                                            address: IotaObj.Bech32Helper.addressFromBech32(bech32Address, this.info.protocol.bech32Hrp)
                                                        }
                                                    ],
                                                }
                                                otherNativeTokens.forEach((t) => {
                                                    if (!otherTokensOutput.nativeTokens.includes(t.id)) {
                                                        otherTokensOutput.nativeTokens.push({
                                                            ...t
                                                        })
                                                    } else {
                                                        const tData = otherTokensOutput.nativeTokens.find((k) => k.id == t.id)
                                                        tData.amount = BigNumber(tData.amount).plus(t.amount)
                                                        tData.amount = `0x${tData.amount.toString(16)}`
                                                    }
                                                })
                                                const newOtherTokensStorageDeposit = IotaObj.TransactionHelper.getStorageDeposit(otherTokensOutput, this.info.protocol.rentStructure).toString()
                                                otherTokensOutput.amount = newOtherTokensStorageDeposit
                                                outputBalance = outputBalance.plus(otherTokensStorageDeposit).minus(newOtherTokensStorageDeposit)
                                                setOutput(outputBalance, bech32Address)
                                                otherTokensStorageDeposit = newOtherTokensStorageDeposit
                                            }
                                            if (outputSMRBalance.minus(sendAmount).gte(0)) {
                                                if (outputSMRBalance.minus(sendAmount).gt(0)) {
                                                    const addressUnlockCondition = addressOutput.output.unlockConditions.find(
                                                        (u) => u.type === 0 // ADDRESS_UNLOCK_CONDITION_TYPE
                                                    )
                                                    if (
                                                        addressUnlockCondition &&
                                                        addressUnlockCondition.address.type === 0 // ED25519_ADDRESS_TYPE
                                                    ) {
                                                        if (!remainderSMROutput) {
                                                            remainderSMROutput = {
                                                                address: `0x${this.bech32ToHex(bech32Address)}`,
                                                                addressType: 0, // ED25519_ADDRESS_TYPE
                                                                type: 3, //BASIC_OUTPUT_TYPE
                                                                amount: '',
                                                                nativeTokens: [
                                                                    {
                                                                        id: tokenId,
                                                                        amount: `0x${outputSMRBalance.minus(sendAmount).toString(16)}`
                                                                    }
                                                                ],
                                                                unlockConditions: [
                                                                    {
                                                                        type: 0, // ADDRESS_UNLOCK_CONDITION_TYPE
                                                                        address: IotaObj.Bech32Helper.addressFromBech32(bech32Address, this.info.protocol.bech32Hrp)
                                                                    }
                                                                ]
                                                            }
                                                            remainderStorageDeposit = IotaObj.TransactionHelper.getStorageDeposit(remainderSMROutput, this.info.protocol.rentStructure)
                                                            remainderSMROutput.amount = remainderStorageDeposit.toString()
                                                            outputBalance = outputBalance.minus(remainderSMROutput.amount)
                                                        } else {
                                                            remainderSMROutput.nativeTokens[0].amount = `0x${outputSMRBalance.minus(sendAmount).toString(16)}`
                                                        }
                                                        setOutput(outputBalance, bech32Address)
                                                    }
                                                } else {
                                                    setOutput(outputBalance, bech32Address)
                                                }
                                                // SMRFinished = true
                                            } else {
                                                setOutput(outputBalance, bech32Address)
                                            }
                                        }
                                    } else if (nativeTokens.length === 0 && !finished) {
                                        pushInput(addressKeyPair, addressOutput, hardwarePath)
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
                    .replace(/{deposit}/g, Number(receiverStorageDeposit.toString()) + Number(remainderStorageDeposit.toString() + Number(otherTokensStorageDeposit)))
                    .replace(/{balance1}/g, realBalance)
                    .replace(/{balance2}/g, mainBalance)
                    .replace(/{balance3}/g, Number(outputBalance))
                throw new Error(str)
            }
            const res = await IotaObj.sendAdvanced(
                this.client,
                inputsAndSignatureKeyPairs,
                outputs,
                {
                    tag: IotaObj.Converter.utf8ToBytes(tag),
                    data: isLedger
                        ? undefined
                        : taggedData
                        ? IotaObj.Converter.utf8ToBytes(taggedData)
                        : IotaObj.Converter.utf8ToBytes(
                              JSON.stringify({
                                  from: address, //main address
                                  to: toAddress,
                                  amount: sendAmount,
                                  collection: 0
                              })
                          )
                },
                signatureFunc,
                getHardwareBip32Path
            )
            return res
        } catch (error) {
            throw error
        }
    },
    getBasicTypeOutput(address, amount) {
        return {
            address: `0x${this.bech32ToHex(address)}`,
            addressType: 0, // ED25519_ADDRESS_TYPE
            amount: amount,
            type: 3, // BASIC_OUTPUT_TYPE
            unlockConditions: [
                {
                    type: 0, // ADDRESS_UNLOCK_CONDITION_TYPE
                    address: IotaObj.Bech32Helper.addressFromBech32(address, this.info.protocol.bech32Hrp)
                }
            ]
        }
    },
    getMinBalance(address) {
        return IotaObj.TransactionHelper.getStorageDeposit(
            this.getBasicTypeOutput(address, 0),
            this.info.protocol.rentStructure
        )
    },
    getInitialAddressState() {
        return {
            accountIndex: 0,
            addressIndex: 0,
            isInternal: false
        }
    },
    getAddressOptions() {
        return {
            startIndex: 0,
            zeroCount: 20
        }
    },
    async SMRNFTSend(fromInfo, toAddress, sendAmount, ext) {
        const { seed, password, address, nodeId } = fromInfo

        const isLedger = fromInfo.type === 'ledger'
        let baseSeed = null
        if (!isLedger) {
            baseSeed = this.getSeed(seed, password)
        }

        let { nftId, taggedData, tag, isNftUnlock, metadata } = ext
        const nftIds = (nftId || '').split(',')
        tag = tag || 'TanglePay'
        let finishedIndex = 0
        try {
            let outputs = []
            let inputsAndSignatureKeyPairs = []
            let initialAddressState = {
                accountIndex: 0,
                addressIndex: 0,
                isInternal: false
            }
            let zeroBalance = 0
            let finished = false
            let outputSMRBalance = BigNumber(0) //

            const genAddressFunc = async (index) => {
                const [{ address, path }] = await this.getHardwareAddressInIota(nodeId, index, false, 1)
                return { address, path }
            }
            let getHardwareBip32Path = null
            let signatureFunc = null
            if (isLedger) {
                signatureFunc = async (essenceHash, inputs, outputs, isBinaryEssence) => {
                    return await this.getHardwareIotaSign(nodeId, essenceHash, inputs, true, isBinaryEssence)
                }
                getHardwareBip32Path = (path) => {
                    return AppIota._validatePath(path)
                }
            }

            const minBalance = this.getMinBalance(address)

            const getAddressOutputIds = async () => {
                let addressKeyPair = null
                let bech32Address = ''
                let hardwarePath = ''
                const path = IotaObj.generateBip44Address(initialAddressState)
                if (!isLedger) {
                    const addressSeed = baseSeed.generateSeedFromPath(new IotaObj.Bip32Path(path))
                    addressKeyPair = addressSeed.keyPair()
                    const ed25519Address = new IotaObj.Ed25519Address(addressKeyPair.publicKey)
                    const addressBytes = ed25519Address.toAddress()
                    bech32Address = this.hexToBech32(addressBytes)
                } else {
                    const hardwareAddressRes = await genAddressFunc(initialAddressState.addressIndex)
                    bech32Address = hardwareAddressRes.address
                    hardwarePath = hardwareAddressRes.path
                }
                const addressOutputIds = await this.IndexerPluginClient.nfts({ addressBech32: bech32Address })
                return { addressOutputIds, addressKeyPair, bech32Address, hardwarePath }
            }
            do {
                const { addressOutputIds, addressKeyPair, bech32Address, hardwarePath } = await getAddressOutputIds()
                if (addressOutputIds.items.length > 0) {
                    for (const outputId of addressOutputIds.items) {
                        const addressOutput = await this.client.output(outputId)
                        let isUnlock = IotaObj.checkUnLock(addressOutput)
                        let outputNftId = addressOutput.output.nftId
                        if (outputNftId == 0) {
                            outputNftId = IotaObj.TransactionHelper.resolveIdFromOutputId(outputId)
                        }
                        // if (isNftUnlock && nftIds.includes(outputNftId)) {
                        //     isUnlock = true
                        // }
                        if (
                            isUnlock &&
                            !addressOutput.metadata.isSpent &&
                            outputNftId &&
                            // nftId === outputNftId
                            nftIds.includes(outputNftId)
                        ) {
                            const outputAmount = addressOutput.output.amount
                            const curOutput = this.processFeature({
                                // ...addressOutput.output,
                                immutableFeatures: addressOutput.output.immutableFeatures,
                                address: `0x${this.bech32ToHex(toAddress)}`,
                                nftId: outputNftId,
                                addressType: 0, // NFT_ADDRESS_TYPE
                                amount: outputAmount,
                                type: 6,
                                unlockConditions: [
                                    {
                                        type: 0, // ADDRESS_UNLOCK_CONDITION_TYPE
                                        address: IotaObj.Bech32Helper.addressFromBech32(toAddress, this.info.protocol.bech32Hrp)
                                    }
                                ]
                            },{ metadata, tag })

                            const deposit = IotaObj.TransactionHelper.getStorageDeposit(curOutput, this.info.protocol.rentStructure)
                            const diff = new BigNumber(curOutput.amount).minus(deposit)
                            
                            if(diff.gte(minBalance)) {  
                                // Need to recover balance
                                // this nft outputBalance is 0
                                curOutput.amount = deposit
                                const recoveredBalance = this.getBasicTypeOutput(address, diff.toNumber())
                                outputs.push(recoveredBalance)
                            }else if(diff.gt(0) && diff.lt(minBalance)) {
                                // Not to recover balance, just send to the other side
                                // this nft outputBalance is 0
                            }else{
                                // this nft outputBalance is negative
                                // Insufficient parts will be made up at the end
                                curOutput.amount = deposit
                                outputSMRBalance = outputSMRBalance.plus(diff)
                            }
                            
                            outputs.push(curOutput)
                            const input = {
                                type: 0, // UTXO_INPUT_TYPE
                                transactionId: addressOutput.metadata.transactionId,
                                transactionOutputIndex: addressOutput.metadata.outputIndex,
                                hardwarePath
                            }
                            const inputData = {
                                input,
                                consumingOutput: addressOutput.output
                            }
                            if (addressKeyPair) {
                                inputData.addressKeyPair = addressKeyPair
                            }
                            inputsAndSignatureKeyPairs.push(inputData)
                            finishedIndex++
                            if (nftIds.length == finishedIndex) {
                                finished = true
                            }
                        }
                    }
                } else {
                    zeroBalance++
                }
            } while (!finished && zeroBalance <= 20)
            if (outputs.length < nftIds.length) {
                throw I18n.t('assets.balanceError')
            }
            // After processing all nft output, Handle insufficient funds only once.
            if(outputSMRBalance.lt(0)) {
                let initialAddressState = this.getInitialAddressState()
                const addressOptions = this.getAddressOptions()

                const sendOutput = this.getBasicTypeOutput(toAddress, outputSMRBalance.multipliedBy(-1).toNumber())
                // This output will be filtered later, so add a symbol mark
                const symbolMark = Symbol('compensation-for-insufficient-balance')
                sendOutput.mark = symbolMark

                let compensationOutputs = [sendOutput]

                const inputsAndKeys = await IotaObj.calculateInputs(this.client, baseSeed, initialAddressState, IotaObj.generateBip44Address, compensationOutputs, addressOptions.zeroCount, null)
                inputsAndSignatureKeyPairs = inputsAndSignatureKeyPairs.concat(inputsAndKeys)
                const compensationOutputsWithoutsendOutput = compensationOutputs.filter(item => {
                    if(item === sendOutput) {
                        return false
                    }
                    if(item.mark && item.mark === symbolMark) {
                        return false
                    }
                    return true
                })
                outputs = outputs.concat(compensationOutputsWithoutsendOutput)
            }

            if (this.mqttClient && this.mqttClient.nft) {
                Base.globalDispatch({
                    type: 'nft.isRequestNft',
                    data: false
                })
                setTimeout(() => {
                    if (Base.globalDispatch) {
                        Base.globalDispatch({
                            type: 'nft.forceRequest',
                            data: Math.random()
                        })
                    }
                }, 10000)
                this.mqttClient.nft(nftIds[0], (topic) => {
                    if (Base.globalDispatch) {
                        Base.globalDispatch({
                            type: 'nft.forceRequest',
                            data: Math.random()
                        })
                    }
                    if (this.mqttClient.mqttUnsubscribe) {
                        this.mqttClient.mqttUnsubscribe(topic)
                    }
                })
            }
            const res = await IotaObj.sendAdvanced(
                this.client,
                inputsAndSignatureKeyPairs,
                outputs,
                {
                    tag: IotaObj.Converter.utf8ToBytes(tag),
                    data: isLedger
                        ? undefined
                        : taggedData
                        ? IotaObj.Converter.utf8ToBytes(taggedData)
                        : IotaObj.Converter.utf8ToBytes(
                              JSON.stringify({
                                  from: address, //main address
                                  to: toAddress,
                                  amount: sendAmount,
                                  collection: 0
                              })
                          )
                },
                signatureFunc,
                getHardwareBip32Path
            )
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
        const { seed, password, address, nodeId } = curWallet
        const isLedger = curWallet.type === 'ledger'
        let baseSeed = null
        console.log('SMRUNlock')
        if (!isLedger) {
            await this.checkPassword(seed, password)
            baseSeed = this.getSeed(seed, password)
        }
        let hardwarePath = ''
        let addressKeyPair = null
        if (!isLedger) {
            addressKeyPair = this.getPair(baseSeed)
        } else {
            hardwarePath = curWallet.path
        }
        const input = {
            type: 0, // UTXO_INPUT_TYPE
            transactionId: transactionId,
            transactionOutputIndex,
            hardwarePath
        }
        const inputData = {
            input,
            consumingOutput: output
        }
        if (addressKeyPair) {
            inputData.addressKeyPair = addressKeyPair
        }
        let inputsAndSignatureKeyPairs = [inputData]
        let getHardwareBip32Path = null
        let genAddressFunc = null
        let signatureFunc = null
        if (isLedger) {
            genAddressFunc = async (index) => {
                const [{ address, path }] = await this.getHardwareAddressInIota(nodeId, index, false, 1)
                return { address, path }
            }
            signatureFunc = async (essenceHash, inputs, outputs, isBinaryEssence) => {
                let hasRemainder = false
                let consumedBalance = new BigNumber(0)
                for (const output of outputs) {
                    consumedBalance = consumedBalance.plus(output.amount)
                }
                if (consumedBalance.isGreaterThan(sendAmount)) {
                    hasRemainder = true
                }
                return await this.getHardwareIotaSign(nodeId, essenceHash, inputs, hasRemainder, isBinaryEssence)
            }
            getHardwareBip32Path = (path) => {
                return AppIota._validatePath(path)
            }
        }
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
        const smrUnlockConditionAmount = output.unlockConditions.find((e) => e.type == 1 && e.amount)?.amount
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
        } else if (smrUnlockConditionAmount) {
            outputs = [
                sendOutput,
                {
                    address: `0x${this.bech32ToHex(unlockAddress)}`,
                    amount: smrUnlockConditionAmount,
                    addressType: 0
                }
            ]
        }
        if (output?.nativeTokens?.length || smrUnlockConditionAmount) {
            let initialAddressState = {
                accountIndex: 0,
                addressIndex: 0,
                isInternal: false
            }
            const smrCalc = await IotaObj.calculateInputs(this.client, baseSeed, initialAddressState, IotaObj.generateBip44Address, outputs, 20, genAddressFunc)
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

        console.log(output, transactionId)
        console.log(outputs, '=================')
        console.log(inputsAndSignatureKeyPairs, '==============')
        const res = await IotaObj.sendAdvanced(
            this.client,
            inputsAndSignatureKeyPairs,
            outputs,
            {
                tag: IotaObj.Converter.utf8ToBytes('TanglePay'),
                data: IotaObj.Converter.utf8ToBytes(
                    JSON.stringify({
                        from: address,
                        to: address,
                        amount,
                        unlock: 1
                    })
                )
            },
            signatureFunc,
            getHardwareBip32Path
        )
        console.log('res=====', res)
        return res
    },
    async SMRUNlockNft({ curWallet, unlockAddress, outputData }) {
        const { seed, password, address, nodeId } = curWallet
        const isLedger = curWallet.type === 'ledger'
        let baseSeed = null
        if (!isLedger) {
            await this.checkPassword(seed, password)
            baseSeed = this.getSeed(seed, password)
        }
        let hardwarePath = ''
        let addressKeyPair = null
        if (!isLedger) {
            addressKeyPair = this.getPair(baseSeed)
        } else {
            hardwarePath = curWallet.path
        }

        const input = {
            type: 0, // UTXO_INPUT_TYPE
            transactionId: outputData.metadata.transactionId,
            transactionOutputIndex: outputData.metadata.outputIndex,
            hardwarePath
        }
        const inputData = {
            input,
            consumingOutput: outputData.output
        }
        if (addressKeyPair) {
            inputData.addressKeyPair = addressKeyPair
        }
        let inputsAndSignatureKeyPairs = [inputData]

        let getHardwareBip32Path = null
        let genAddressFunc = null
        let signatureFunc = null
        if (isLedger) {
            genAddressFunc = async (index) => {
                const [{ address, path }] = await this.getHardwareAddressInIota(nodeId, index, false, 1)
                return { address, path }
            }
            signatureFunc = async (essenceHash, inputs, outputs, isBinaryEssence) => {
                return await this.getHardwareIotaSign(nodeId, essenceHash, inputs, true, isBinaryEssence)
            }
            getHardwareBip32Path = (path) => {
                return AppIota._validatePath(path)
            }
        }

        let sendAmount = outputData.output.amount
        const sendOutput = {
            immutableFeatures: outputData.output.immutableFeatures,
            address: `0x${this.bech32ToHex(address)}`,
            nftId: outputData.output.nftId,
            addressType: 0, // NFT_ADDRESS_TYPE
            amount: outputData.output.amount,
            nativeTokens: [],
            type: 6,
            unlockConditions: [
                {
                    type: 0, // ADDRESS_UNLOCK_CONDITION_TYPE
                    address: IotaObj.Bech32Helper.addressFromBech32(address, this.info.protocol.bech32Hrp)
                }
            ]
        }
        let outputs = [sendOutput]
        sendAmount = IotaObj.TransactionHelper.getStorageDeposit(sendOutput, this.info.protocol.rentStructure)
        sendAmount = sendAmount.toString()
        sendOutput.amount = sendAmount
        outputs = [
            sendOutput,
            {
                address: `0x${this.bech32ToHex(unlockAddress)}`,
                amount: outputData.output.amount,
                addressType: 0
            }
        ]
        let initialAddressState = {
            accountIndex: 0,
            addressIndex: 0,
            isInternal: false
        }
        const smrCalc = await IotaObj.calculateInputs(this.client, baseSeed, initialAddressState, IotaObj.generateBip44Address, outputs, 20, genAddressFunc)
        inputsAndSignatureKeyPairs = [...inputsAndSignatureKeyPairs, ...smrCalc]
        if (outputs.length >= 3) {
            outputs[2].amount = this.getNumberStr(BigNumber(outputs[2].amount).plus(outputData.output.amount).valueOf())
        } else {
            outputs.push({
                address: `0x${this.bech32ToHex(address)}`,
                amount: outputData.output.amount,
                addressType: 0
            })
        }
        const res = await IotaObj.sendAdvanced(
            this.client,
            inputsAndSignatureKeyPairs,
            outputs,
            {
                tag: IotaObj.Converter.utf8ToBytes('TanglePay'),
                data: IotaObj.Converter.utf8ToBytes(
                    JSON.stringify({
                        from: address,
                        to: address,
                        nftId: outputData.output.nftId,
                        amount: 1,
                        unlock: 1
                    })
                )
            },
            signatureFunc,
            getHardwareBip32Path
        )
        return res
    }
    /**************** SMR end *******************/
}

export default IotaSDK
