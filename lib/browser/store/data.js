import { IotaSDK } from "../common";

const handler = {
    get(target, key) {
      console.log(`Getting datastore "${key}"`);
      return Reflect.get(target, key);
    },
    set(target, key, value) {
      console.log(`Setting datastore "${key}" to "${value}"`);
      return Reflect.set(target, key, value);
    },
  };

const initState = {
    isPinStateInited:false,
    walletCount:0,
    isPinSet:false,
    pin:undefined,
    pinExpires:0, //
    pinTryLefted:5,
}
const store = new Proxy(initState,handler)


// pin related
export const initPinNewUserState = async (walletCount) => { // 
    store.walletCount = walletCount
    if (!store.isPinInited) {
        const pinHash = await Base.getSensitiveInfo('pin.hash')
        store.isPinSet = pinHash ? true : false
        store.isPinInited = true
    }
}
const ensureInit = () => {
    if (!store.isPinStateInited) {
        throw new Error('pin state not inited yet')
    }
}
const ensureHasPin = () => {
    ensureInit()
    const { isPinSet } = getPinState()
    if (!isPinSet) {
        throw new Error('pin state not inited yet')
    }
}
export const getPinState = () => {
    const {isPinStateInited, isPinSet, walletCount, pin, pinExpires, pinTryLefted} = store
    const isNewUser = !isPinSet && walletCount > 0
    const isUnlock = pin ? true : false
    return {isNewUser, isUnlock, isPinStateInited, pin, pinExpires, pinTryLefted}
}
export const unlockWithPin = async (pin) => { // check if pin is corrected
    ensureHasPin()
    const isMatch = await IotaSDK.checkPin(pin)
    if (isMatch) {
        store.pin = pin
    }
    const { isUnlock } = getPinState()
    return isUnlock
}
export const setPin = async (pin, oldPin) => { // set pin, if already have pin, compare with old pin, return false if not match 
    ensureInit()
    const { isPinSet } = getPinState()
    if (isPinSet) {
        const isMatch = await IotaSDK.checkPin(oldPin)
        if (!isMatch) return false;
    }
    await IotaSDK.setPin(pin)
    return true;
}
export const getPinKey = (address) => {
    ensureInit()
    const { isUnlock, pin } = getPinState()
    if (isUnlock) {
        return IotaSDK.getKeyOfPin(pin,address)
    } else {
        console.log('get pin key before unlock')
        return false;
    }
}

const markWalletPasswordEnabled = (address) => {
    const [k,v] = IotaSDK.getKeyAndValueOfPasswordSwitch(address)
    Base.setLocalData(`pin.walletenable.${k}`, v)
}

const markWalletPasswordDisabled = (address) => {
    const [k,v] = IotaSDK.getKeyAndValueOfPasswordSwitch(address)
    Base.setLocalData(`pin.walletenable.${k}`, 'deleted')
}


export const checkWalletIsPasswordEnabled = async (address) => {
    const [k,_] = IotaSDK.getKeyAndValueOfPasswordSwitch(address)
    const v = await Base.getLocalData(k)
    return (v && v != 'deleted') ? true : false
}
export const enableWalletPassword = (curWallet, password) => { // update local seed and mark wallet password enabled
    ensureHasPin();
    const { pin } = getPinState()
    const { address , seed } = curWallet
    // before enable, password is key of pin
    const key = IotaSDK.getKeyOfPin(pin, address)
    const realSeed = IotaSDK.decryptSeed(seed,key)
    const newLocalSeed = IotaSDK.encryptSeed(realSeed,password)
    curWallet.seed = newLocalSeed
    markWalletPasswordEnabled(address)
}

export const disableWalletPassword = (address, password) => { // update local seed and mark wallet password enabled
    ensureHasPin();
    const { pin } = getPinState()
    const { address , seed } = curWallet
    const isPasswordMatch = IotaSDK.checkPassword(seed, password);
    if (!isPasswordMatch) {
        return false
    }
    // before disable, password is old password   
    const realSeed = IotaSDK.decryptSeed(seed,password)
    const key = IotaSDK.getKeyOfPin(pin, address)
    const newLocalSeed = IotaSDK.encryptSeed(realSeed,key)
    curWallet.seed = newLocalSeed
    markWalletPasswordDisabled(address)
}