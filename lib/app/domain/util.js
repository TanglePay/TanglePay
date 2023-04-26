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