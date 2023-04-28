import { Base } from "../common";
import { IotaSDK } from "../common";
export const createReadOnlyProxy = (target) => {
    const handler = {
      get(target, property, receiver) {
        const value = Reflect.get(target, property, receiver);  
        return value;
      },
      set(target, property, value, receiver) {
        console.error(`Cannot set property '${property}' - object is read-only.`);
        return false;
      },
    };
  
    return new Proxy(target, handler);
  };

  function getCurrentDateString() {
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
  
    return `${year}-${month}-${day}`;
  }
let persistHandle = null;
let storageFacade = undefined
export const setStorageFacade = (storageFacade_) => {
  storageFacade = storageFacade_;
  storageFacade.salt = getCurrentDateString()
}
export const updateState = (name, _context,delta, isPersist = false) => {
    console.log('state before update', _context.state);
    _context.state = createReadOnlyProxy(Object.assign({}, _context.state, delta));
    console.log('state after update', _context.state);
    if (isPersist) {
      clearTimeout(persistHandle);
      persistHandle = setTimeout(() => {
        const storageKey = `state.${name}`;
        const json = JSON.stringify(_context.state);
        const encrypted = IotaSDK.encryptSeed(json, storageFacade.salt);
        storageFacade.set(storageKey, encrypted);
      }, 0);
    }
}
export const getStorage = async (name) => {
  const storageKey = `state.${name}`;
  const encrypted = await storageFacade.get(storageKey);
  const json = encrypted ? IotaSDK.decryptSeed(encrypted, storageFacade.salt): encrypted;
  return json;
}