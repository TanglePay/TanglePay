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
    addressBalance
} from '@iota/iota.js-next/dist/cjs/index-browser'

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
    addressBalance
}
