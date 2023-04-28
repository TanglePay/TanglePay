import { Base } from "../common";
import { createReadOnlyProxy } from "./util";
import { IotaSDK } from "../common";
import { updateState as updateState_, getStorage, setStorageFacade as setStorageFacade_ } from "./util";
export const setStorageFacade = setStorageFacade_;
const domainName = 'pin-domain';
const initState = {
    inited:false,
    walletCount:0,
    unlocked:false,
    unlockValidUntil:0,
    unlockTryLefted:7,
    unlockTryLeftedZeroValidUntil:0,
    pin:"",

    isPinSet:false,

}
// array of resolve of promise, when init called, resolve all of them
const initWaits = [];
const _context = {
    state : createReadOnlyProxy(initState),
}  
export const context = createReadOnlyProxy(_context);

const updateState = (delta, isPersist = true) => {
    updateState_(domainName, _context,delta,isPersist);
}

export const init = async (walletCount) => {
    const storage = await getStorage(domainName);
    let delta = undefined;
    if (storage) {
        delta = JSON.parse(storage);
        delete delta.unlocked;
    }
    if (!delta) {
        const pinHash = await Base.getSensitiveInfo('pin.hash')
        const isPinSet = pinHash ? true : false;
        delta = {
            inited:true,
            isPinSet,
        }
    }
    delta.walletCount = walletCount;
    updateState(delta);
    getIsUnlocked(); // handle timeout case
    if (initWaits.length > 0) {
        initWaits.forEach((resolve) => {
            resolve();
        });
        initWaits.length = 0;
    }
}

export const isNewWalletFlow = () => {
    const isExistingUser = _context.state.walletCount > 0 && !_context.state.isPinSet;
    return !isExistingUser;
}
export const canTryUnlock = () => {
    const now = Date.now();
    const { unlockTryLefted, unlockTryLeftedZeroValidUntil } = _context.state;
    // check should reset unlock try state
    if (unlockTryLeftedZeroValidUntil < now) {
        resetUnlockTryState();
    }
    return unlockTryLefted > 0;
}



const calculateNewUnlockValidUntil = () => {
    return Date.now() + 30 * 60 * 1000;
}


export const tryUnlock = async (pin) => {
    const isMatch = await IotaSDK.checkPin(pin);
    if (isMatch) {
        updateState({
            unlocked:true,
            unlockValidUntil:calculateNewUnlockValidUntil(),
            pin,
        });
    }
    // if is match, reset unlock try state
    if (isMatch) {
        resetUnlockTryState();
    } else {
        // if not match, reduce unlock try lefted, and set unlock try lefted zero valid until now + 5 minutes
        const now = Date.now();
        const { unlockTryLefted } = _context.state;
        updateState({
            unlockTryLefted:unlockTryLefted - 1,
            unlockTryLeftedZeroValidUntil:now + 5 * 60 * 1000,
        });
    }
    return isMatch;
}
const pinLogout = () => {
    updateState({
        unlocked:false,
        pin:"",
        unlockValidUntil:0,
    });
}
const resetUnlockTryState = () => {
    updateState({
        unlockTryLefted:7,
        unlockTryLeftedZeroValidUntil:0,
    });
}
export const getIsUnlocked = () => {
    const now = Date.now();
    const { unlocked, unlockValidUntil } = _context.state;
    const isUnlocked = unlocked && unlockValidUntil > now;
    if (!isUnlocked) {
        pinLogout();
    }
    return isUnlocked;
}
export const ensureInited = async () => {
    if (!_context.state.inited) {
        return new Promise((resolve, reject) => {
            initWaits.push(resolve);
            // reject after 10 seconds
            setTimeout(() => {
                reject();
            }, 10 * 1000);
        });
    }
}

export const checkPin = async (pin) => {
    return await IotaSDK.checkPin(pin);
}

export const setPin = async (pin) => {
    await IotaSDK.setPin(pin)
    updateState({
        isPinSet:true,
        unlocked:true,
        pin,
        unlockValidUntil:calculateNewUnlockValidUntil(),
    });
} 

export const getPinKey = async (id) => {
    await ensureInited()
    const isUnlocked = getIsUnlocked()
    const { pin } = _context.state;
    if (isUnlocked) {
        return IotaSDK.getKeyOfPin(pin,id)
    } else {
        console.log('get pin key before unlock')
        return false;
    }
}

export const markWalletPasswordEnabled = (id) => {
    const [k,v] = IotaSDK.getKeyAndValueOfPasswordSwitch(id)
    const storageKey = `pin.walletenable.${k}`
    console.log('mark wallet password enabled', storageKey, v)
    Base.setLocalData(storageKey, v)
}

export const markWalletPasswordDisabled = (id) => {
    const [k,v] = IotaSDK.getKeyAndValueOfPasswordSwitch(id)
    const storageKey = `pin.walletenable.${k}`
    Base.setLocalData(storageKey, 'deleted')
}


export const checkWalletIsPasswordEnabled = async (id) => {
    const [k,_] = IotaSDK.getKeyAndValueOfPasswordSwitch(id)
    const storageKey = `pin.walletenable.${k}`
    const v = await Base.getLocalData(storageKey)
    console.log('check wallet password enabled', storageKey, v)
    return (v && v != 'deleted') ? true : false
}

/*
export const enableWalletPassword = (curWallet, password) => { // update local seed and mark wallet password enabled
    const isUnlocked = getIsUnlocked()
    if (!isUnlocked) {
        console.log('enable wallet password before unlock')
        return false;
    }
    const { pin } = _context.state;
    const { address , seed } = curWallet
    // before enable, password is key of pin
    const key = IotaSDK.getKeyOfPin(pin, address)
    const realSeed = IotaSDK.decryptSeed(seed,key, true)
    const newLocalSeed = IotaSDK.encryptSeed(realSeed,password,true)
    curWallet.seed = newLocalSeed
    markWalletPasswordEnabled(address)
    return true;
}

export const disableWalletPassword = (curWallet, password) => { // update local seed and mark wallet password enabled
    const isUnlocked = getIsUnlocked()
    if (!isUnlocked) {
        console.log('enable wallet password before unlock')
        return false;
    }
    const { pin } = _context.state;
    const { address , seed } = curWallet
    const isPasswordMatch = IotaSDK.checkPassword(seed, password, true);
    if (!isPasswordMatch) {
        return false
    }
    // before disable, password is old password   
    const realSeed = IotaSDK.decryptSeed(seed,password, true)
    const key = IotaSDK.getKeyOfPin(pin, address)
    const newLocalSeed = IotaSDK.encryptSeed(realSeed,key, true)
    curWallet.seed = newLocalSeed
    markWalletPasswordDisabled(address)
}
*/
