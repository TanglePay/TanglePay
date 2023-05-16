import { Converter } from '@iota/util.js'
import { Bip32Path, Bip39, Ed25519 } from '@iota/crypto.js'
import {
    Bech32Helper,
    Ed25519Address,
    Ed25519Seed,
    ED25519_ADDRESS_TYPE,
    generateBip44Address,
    SingleNodeClient,
    sendMultiple,
    addressBalance,
    buildTransactionPayload
} from '@iota/iota.js/dist/cjs/index-browser'

import { MqttClient } from '@iota/mqtt.js/dist/cjs/index-browser'

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
    MqttClient,
    buildTransactionPayload
}
