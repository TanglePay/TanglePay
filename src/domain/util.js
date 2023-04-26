import { Base } from "../common";
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
let persistHandle = null;
export  const updateState = (name, _context,delta, isPersist = false) => {
    console.log('state before update', _context.state);
    _context.state = createReadOnlyProxy(Object.assign({}, _context.state, delta));
    console.log('state after update', _context.state);
    if (isPersist) {
      clearTimeout(persistHandle);
      persistHandle = setTimeout(() => {
        const storageKey = `state.${name}`;
        Base.setLocalData(storageKey, JSON.stringify(_context.state))
      }, 0);
    }
}
export const getStorage = async (name) => {
  const storageKey = `state.${name}`;
  return await Base.getLocalData(storageKey)
}