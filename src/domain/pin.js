import { Base } from "../common";
import { createReadOnlyProxy } from "./util";
import { IotaSDK } from "../common";
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

const updateState = (delta) => {
    console.log('state before update', _context.state);
    _context.state = createReadOnlyProxy(Object.assign({}, _context.state, delta));
    console.log('state after update', _context.state);
}

export const init = async (walletCount) => {
    const pinHash = await Base.getSensitiveInfo('pin.hash')
    const isPinSet = pinHash ? true : false;
    updateState({
        inited:true,
        isPinSet,
        walletCount,
    });
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

export const tryUnlock = async (pin) => {
    const isMatch = await IotaSDK.isPinMatch(pin);
    if (isMatch) {
        updateState({
            unlocked:true,
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



export const setPin = async (pin) => {
    await IotaSDK.setPin(pin)
    updateState({
        isPinSet:true,
        pin,
    });
} 


