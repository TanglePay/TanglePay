import { Base } from "../common";
import { createReadOnlyProxy } from "./util";
import { IotaSDK } from "../common";
const initState = {
    inited:false,
    walletCount:0,
    unlocked:false,
    pin:"",
    isPinSet:false,
}

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
}

export const isNewWalletFlow = () => {
    const isExistingUser = _context.state.walletCount > 0 && !_context.state.isPinSet;
    return !isExistingUser;
}
export const tryUnlock = async (pin) => {
    const isMatch = await IotaSDK.isPinMatch(pin);
    if (isMatch) {
        updateState({
            unlocked:true,
            pin,
        });
    }
    return isMatch;
}

export const setPin = async (pin) => {
    await IotaSDK.setPin(pin)
    updateState({
        isPinSet:true,
        pin,
    });
} 


