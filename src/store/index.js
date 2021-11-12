import { useReducer, useContext } from 'react';
import * as CommonStore from './common';
import _get from 'lodash/get';
import { StoreContext as Context } from './context';
export const StoreContext = Context;

const stores = {
	common: CommonStore
};

const storeReducer = (store, action) => {
	const { type, data } = action;
	// skip processing if the data is not change.
	// only primitives are supported while deep compare of complex objects would fallback to corresponding reducers
	if (_get(store, type) === data) {
		return store;
	}
	const [module, act] = type.split('.');
	const storeHander = stores[module];
	if (storeHander) {
		return { ...store, [module]: storeHander.reducer(store[module], { type: act, data }) };
	}
	return store;
};

const initState = {};
for (const i in stores) {
	initState[i] = stores[i].initState;
}

export const useStoreReducer = () => {
	const [store, dispatch] = useReducer(storeReducer, initState);
	return [store, dispatch];
};

// get store data
export const useStore = (key) => {
	const { store, dispatch } = useContext(StoreContext);
	const changeData = (val) => {
		dispatch({ type: key, data: val });
	};
	return [key ? _get(store, key) : store, changeData, dispatch];
};
