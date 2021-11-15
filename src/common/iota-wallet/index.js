import { MqttClient } from '@iota/mqtt.js'
import I18n from '../lang'
import { Base } from '../base'
import { Toast } from '../components/Toast'
import Trace from '../trace'
import _sumBy from 'lodash/sumBy'
import _get from 'lodash/get'
import _debounce from 'lodash/debounce'
import CryptoJS from 'crypto-js'
import Iota from './iota'
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
    get nodes() {
        return [
            {
                id: 1,
                url: 'https://chrysalis-nodes.iota.org',
                name: I18n.t('account.mainnet'),
                type: 1, //1mainnet，2devnet,
                mqtt: 'wss://chrysalis-nodes.iota.org:443/mqtt'
            },
            {
                id: 2,
                url: 'https://api.lb-0.h.chrysalis-devnet.iota.cafe',
                name: I18n.t('account.devnet'),
                type: 2, //1mainnet，2devnet
                mqtt: 'wss://api.lb-0.h.chrysalis-devnet.iota.cafe:443/mqtt'
            }
        ]
    },
    async init(id) {
        try {
            const curNode = this.nodes.find((e) => e.id === id) || this.nodes[0]
            this.client = new SingleNodeClient(curNode.url)
            this.info = await this.client.info()
            if (this.mqttClient && this.subscriptionId) {
                this.mqttClient.unsubscribe(this.subscriptionId)
                this.subscriptionId = null
            }
            this.mqttClient = new MqttClient(curNode.mqtt)
        } catch (error) {
            console.log(error)
            Toast.error(I18n.t('user.nodeError'))
        }
    },
    async setMqtt(address, refreshAssets) {
        /// mqtt listener
        if (this.subscriptionId && this.mqttClient) {
            this.mqttClient.unsubscribe(this.subscriptionId)
            this.subscriptionId = null
        }
        if (address) {
            this.subscriptionId = this.mqttClient.addressOutputs(
                address,
                _debounce(async () => {
                    try {
                        Base.globalTemData.isGetMqttMessage = true
                        refreshAssets(Math.random())
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
                Toast.error(I18n.t('user.nodeError'))
                reject()
            }
            mnemonic = mnemonic.replace(/ +/g, ' ').toLocaleLowerCase()
            if (!mnemonic || mnemonic.split(' ').length !== 24) {
                Toast.error(I18n.t('account.mnemonicError'))
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
                    Toast.error(err)
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
    async getValidAddresses({ seed, password }) {
        if (!seed) return []
        let num = 0
        let addressList = []
        let outputList = []
        const accountState = {
            accountIndex: 0,
            addressIndex: 0,
            isInternal: false
        }
        const baseSeed = this.getSeed(seed, password)
        const getAddressList = async (accountState) => {
            const LIMIT = 1
            const STEP = 20
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
            const addressOutputs = await Promise.all(
                temAddress.map((e) => this.client.addressOutputs(e, undefined, true))
            )
            let flag = false
            temAddress.forEach((e, i) => {
                const { outputIds } = addressOutputs[i]
                if (!!outputIds.length) {
                    if (!addressList.includes(e)) {
                        addressList.push(e)
                        outputList = [...outputList, ...outputIds]
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
        return [addressList, outputList]
    },
    async getBalance({ id, address }, addressList) {
        if (!this.client) {
            return 0
        }
        const res = await Promise.all(addressList.map((e) => this.client.address(e)))
        const balance = _sumBy(res, 'balance')
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
    async send(fromInfo, toAddress, amount) {
        const sendAmount = amount * this.IOTA_MI
        if (!this.client) {
            return Toast.error(I18n.t('user.nodeError'))
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
    async getHisList(outputList) {
        if (!this.client) {
            return Toast.error(I18n.t('user.nodeError'))
        }
        const outputDatas = await Promise.all(outputList.map((e) => this.client.output(e)))
        const metadataList = await Promise.all(outputDatas.map((e, i) => this.client.messageMetadata(e.messageId)))
        const milestoneList = await Promise.all(
            metadataList.map((e) => this.client.milestone(e.referencedByMilestoneIndex))
        )
        const transactionFrom = await Promise.all(
            outputDatas.map((e, i) => this.client.transactionIncludedMessage(e.transactionId))
        )
        const allList = milestoneList.map((e, i) => {
            const { isSpent, output, transactionId, outputIndex } = outputDatas[i]
            const { payload } = transactionFrom[i]
            const address = output.address.address
            let payloadData = payload?.essence?.payload?.data
            try {
                payloadData = Converter.hexToUtf8(payloadData)
                payloadData = JSON.parse(payloadData)
            } catch (error) {
                payloadData = {}
            }
            return {
                ...e,
                isSpent,
                transactionId,
                address,
                outputIndex,
                output,
                bech32Address: this.hexToBech32(address),
                amount: output.amount,
                inputs: payload?.essence?.inputs,
                payloadData,
                outputs: payload?.essence?.outputs.map((d) => {
                    return {
                        ...d,
                        bech32Address: this.hexToBech32(d.address.address)
                    }
                })
            }
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
    }
}

export default IotaSDK
