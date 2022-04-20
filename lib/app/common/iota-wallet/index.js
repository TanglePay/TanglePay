import { MqttClient } from '@iota/mqtt.js'
import I18n from '../lang'
import { Base } from '../base'
import Http from '../http'
import Trace from '../trace'
import _sumBy from 'lodash/sumBy'
import _get from 'lodash/get'
import _debounce from 'lodash/debounce'
import CryptoJS from 'crypto-js'
import Iota from './iota'
import _chunk from 'lodash/chunk'
import BigNumber from 'bignumber.js'
import { convertUnits } from '@iota/unit-converter'
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
    sendMultiple
} = Iota
const IotaSDK = {
    IOTA_MI: 1000000, // 1mi = 1000000i
    convertUnits(value, fromUnit, toUnit) {
        return convertUnits(value, fromUnit, toUnit)
    },
    get nodes() {
        return [
            {
                id: 1,
                url: 'https://chrysalis-nodes.iota.org',
                name: I18n.t('account.mainnet'),
                type: 1, //1mainnet，2devnet,
                mqtt: 'wss://chrysalis-nodes.iota.org:443/mqtt',
                apiPath: 'mainnet'
            },
            {
                id: 2,
                url: 'https://api.lb-0.h.chrysalis-devnet.iota.cafe',
                name: I18n.t('account.devnet'),
                type: 2, //1mainnet，2devnet
                mqtt: 'wss://api.lb-0.h.chrysalis-devnet.iota.cafe:443/mqtt',
                apiPath: 'devnet'
            }
            // {
            // 	id: 2,
            // 	url: 'http://node.iotaichi.com',
            // 	name: I18n.t('account.devnet'),
            // 	type: 2, //1mainnet，2devnet
            // 	mqtt: 'wss://api.lb-0.h.chrysalis-devnet.iota.cafe:443/mqtt',
            // 	apiPath: 'devnet'
            // }
        ]
    },
    explorerApiUrl: 'https://explorer-api.iota.org',
    async init(id) {
        Base.globalToast.showLoading()
        try {
            const curNode = this.nodes.find((e) => e.id === id) || this.nodes[0]
            this.curNode = curNode
            this.client = new SingleNodeClient(curNode.url)
            this.info = await this.client.info()
            if (this.mqttClient && this.subscriptionId) {
                this.mqttClient.unsubscribe(this.subscriptionId)
                this.subscriptionId = null
            }
            this.mqttClient = new MqttClient(curNode.mqtt)
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
        if (address) {
            const self = this
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
    },
    getMnemonic() {
        return Bip39.randomMnemonic()
    },
    async importMnemonic({ mnemonic, name, password }) {
        return new Promise((resolve, reject) => {
            if (!this.info) {
                Base.globalToast.error(I18n.t('user.nodeError'))
                reject()
            }
            mnemonic = mnemonic.replace(/ +/g, ' ').toLocaleLowerCase().trim()
            if (!mnemonic || mnemonic.split(' ').length !== 24) {
                Base.globalToast.error(I18n.t('account.mnemonicError'))
                reject()
            } else {
                let isChecked = false
                try {
                    // Mnemonic is checked with Bip39 library, throw if validation failed.
                    Bip39.mnemonicToEntropy(mnemonic)
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
                    // calculate seed
                    const baseSeed = Ed25519Seed.fromMnemonic(mnemonic)
                    const addressKeyPair = this.getPair(baseSeed)
                    const indexEd25519Address = new Ed25519Address(addressKeyPair.publicKey)
                    const indexPublicKeyAddress = indexEd25519Address.toAddress()
                    const bech32Address = this.hexToBech32(indexPublicKeyAddress)
                    const uuid = Base.guid()
                    Trace.createWallet(uuid, name, bech32Address)
                    // encrypt the seed and save to local storage
                    resolve({
                        address: bech32Address,
                        name,
                        isSelected: true,
                        password,
                        id: uuid,
                        seed: this.getLocalSeed(baseSeed, password),
                        bech32HRP: this.info.bech32HRP
                    })
                }
            }
        })
    },
    getWalletList(list) {
        if (this.info) {
            return list.filter((e) => e.bech32HRP === this.info.bech32HRP)
        }
        return []
    },
    async getWalletInfo(address) {
        return this.client.address(address)
    },
    hexToBech32(address) {
        if (typeof address === 'string') {
            address = Converter.hexToBytes(address)
        }
        return Bech32Helper.toBech32(ED25519_ADDRESS_TYPE, address, this.info.bech32HRP)
    },
    bech32ToHex(addressHex) {
        const address = Bech32Helper.fromBech32(addressHex, this.info.bech32HRP)
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
        const res = await Promise.all(
            addressList.map((e) => {
                return Http.GET(`${this.explorerApiUrl}/search/${this.curNode.apiPath}/${e}`, {
                    isHandlerError: true
                })
            })
        )
        let list = []
        res.forEach((e) => {
            const addressOutputIds = e?.addressOutputIds || []
            const historicAddressOutputIds = e?.historicAddressOutputIds || []
            list = [...list, ...addressOutputIds, ...historicAddressOutputIds]
        })
        return list
    },
    async getValidAddresses({ seed, password }) {
        if (!seed) return []
        let num = 0
        let addressList = []
        const accountState = {
            accountIndex: 0,
            addressIndex: 0,
            isInternal: false
        }
        const baseSeed = this.getSeed(seed, password)
        const getAddressList = async (accountState) => {
            const LIMIT = 1
            const temAddress = this.getBatchBech32Address(baseSeed, accountState, 20)
            const addressOutputs = await Promise.all(
                temAddress.map((e) => this.client.addressOutputs(e, undefined, true))
            )
            let flag = false
            temAddress.forEach((e, i) => {
                const { outputIds } = addressOutputs[i]
                if (!!outputIds.length) {
                    if (!addressList.includes(e)) {
                        addressList.push(e)
                    }
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
        return addressList
    },
    async getBalanceAddress({ seed, password }) {
        const accountState = {
            accountIndex: 0,
            addressIndex: 0,
            isInternal: false
        }
        const baseSeed = this.getSeed(seed, password)
        const getAddressList = async (accountState) => {
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
    async getBalance({ id, address }, addressList) {
        if (!this.client) {
            return 0
        }
        const res = await Promise.all(addressList.map((e) => this.client.address(e)))
        let balance = BigNumber(0)
        res.forEach((e) => {
            balance = balance.plus(e.balance)
        })
        balance = Number(balance)
        // const balance = _sumBy(res, 'balance')
        Trace.updateAddressAmount(id, address, balance)
        return balance
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
        const localSeed = Array.from(seed._secretKey)
        const localHex = Converter.bytesToHex(localSeed)
        const localHexNew = this.encryptSeed(localHex, password)
        return localHexNew
    },
    changePassword(old, oldSeed, password) {
        const seed = this.getSeed(oldSeed, old)
        return this.getLocalSeed(seed, password)
    },
    async send(fromInfo, toAddress, sendAmount) {
        const amount = Base.formatNum(BigNumber(sendAmount).div(this.IOTA_MI))
        if (!this.client) {
            return Base.globalToast.error(I18n.t('user.nodeError'))
        }
        const { seed, address, password } = fromInfo
        const baseSeed = this.getSeed(seed, password)
        const sendOut = await sendMultiple(
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
            Http.GET(`${this.explorerApiUrl}/output/${this.curNode.apiPath}/${outputId}`, {
                isHandlerError: true
            })
        ])
        return res?.output ? res?.output : res
    },
    // handle message 404 ？
    async messageMetadata(messageId) {
        const res = await this.requestQueue([
            // this.client.messageMetadata(messageId),
            Http.GET(`${this.explorerApiUrl}/message/${this.curNode.apiPath}/${messageId}`, {
                isHandlerError: true
            })
        ])
        return res?.metadata ? res?.metadata : res
    },
    // handle milestone 404
    async milestone(milestoneIndex) {
        const res = await this.requestQueue([
            // this.client.milestone(milestoneIndex),
            Http.GET(`${this.explorerApiUrl}/milestone/${this.curNode.apiPath}/${milestoneIndex}`, {
                isHandlerError: true
            })
        ])
        return res?.milestone ? res?.milestone : res
    },
    // handle transactionId 404
    async transactionIncludedMessage(transactionId) {
        const res = await this.requestQueue([
            // this.client.transactionIncludedMessage(transactionId),
            Http.GET(`${this.explorerApiUrl}/search/${this.curNode.apiPath}/${transactionId}`, {
                isHandlerError: true
            })
        ])
        return res?.message?.payload ? res?.message : res
    },
    async getHisList(outputList) {
        if (!this.client) {
            return Base.globalToast.error(I18n.t('user.nodeError'))
        }
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
                isSpent,
                transactionId,
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
            return
        }
        const data = await this.requestParticipation(`addresses/${address}`)
        const rewards = data?.rewards || {}
        for (const i in rewards) {
            rewards[i].address = address
        }
        return rewards
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
    // type：1-》stake  2-》add amount  3-》unstake 4-》add airdrop
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
    }
    /**************** Sign end **********************/
}

export default IotaSDK
