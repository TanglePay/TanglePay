import { Converter } from '@iota/util.js-next'
import { Bip32Path, Bip39, Ed25519 } from '@iota/crypto.js-next'
import {
    Bech32Helper,
    Ed25519Address,
    Ed25519Seed,
    ED25519_ADDRESS_TYPE,
    generateBip44Address,
    SingleNodeClient,
    sendMultiple,
    addressBalance,
    setIotaBip44BasePath,
    LocalPowProvider,
    getBalance,
    IndexerPluginClient,
    sendAdvanced,
    TransactionHelper,
    addressUnlockBalance
} from '@iota/iota.js-next/dist/cjs/index-browser'
import { MqttClient } from '@iota/mqtt.js-next/dist/cjs/index-browser'

export default {
    Converter,
    Bip32Path,
    Bip39,
    Bech32Helper,
    Ed25519Address,
    Ed25519Seed,
    ED25519_ADDRESS_TYPE,
    generateBip44Address,
    SingleNodeClient,
    sendMultiple,
    Ed25519,
    addressBalance,
    setIotaBip44BasePath,
    LocalPowProvider,
    getBalance,
    IndexerPluginClient,
    MqttClient,
    sendAdvanced,
    TransactionHelper,
    addressUnlockBalance
}
