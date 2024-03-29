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
    // PIN expiration is to be adjusted to a day, so remove it
    // const day = date.getDate().toString().padStart(2, '0');
  
    return `${year}-${month}`;
  }
let persistHandle = null;
let storageFacade = undefined
export const setStorageFacade = (storageFacade_, uuid='') => {
  storageFacade = storageFacade_;
  storageFacade.salt = uuid + '-' + getCurrentDateString()
  console.log('setStorageFacade salt',storageFacade.salt)
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
        console.log('storage set',storageKey,json)
        storageFacade.set(storageKey, encrypted);
      }, 0);
    }
}
export const getStorage = async (name) => {
  const storageKey = `state.${name}`;
  const encrypted = await storageFacade.get(storageKey);
  try {
    const json = encrypted ? IotaSDK.decryptSeed(encrypted, storageFacade.salt): encrypted;
    console.log('get storage',storageKey, json)
    return json;
  } catch (e) {
    console.log('get storage',e);
    return undefined;
  }
}
export const sleep = async (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}
export class Channel {
  queue = [];
  numPushed = 0;
  numPolled = 0;
  async poll() {
    for (;;) {
      if (this.queue.length > 0) {
        const res = this.queue.shift();
        if (res) {
          this.numPolled++;
          return res;
        }
      } else {
        await sleep(100);
      }
    }
  }
  
  push(item) {
    this.queue.push(item);
    this.numPushed++;
  }

}

export const drainOutputIds = async (args) => {
  for (let i = 0; i < args.threadNum; i++) {
    setTimeout(async () => {
      while (!args.isStop) {
        const outputId = await args.inChannel.poll();
        if (outputId) {
          console.log('drainOutputIds',outputId)
          const output = await args.outputIdResolver(outputId);
          if (output) {
            args.outChannel.push(output);
          }
        } else {
          await sleep(1000);
        }
      }
    }, 0);
  }
};
