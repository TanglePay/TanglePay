import Utils from './utils'
import Storage from 'react-native-storage'
import { Platform } from 'react-native'
import AsyncStorage from '@react-native-community/async-storage'
import { StackActions } from '@react-navigation/native'
import RNSInfo from 'react-native-sensitive-info'
import DeviceInfo from 'react-native-device-info'

// local storage
const storage = new Storage({
    size: 1000,
    storageBackend: AsyncStorage,
    defaultExpires: null, //过期时间
    enableCache: true
})
export const Base = {
    ...Utils,
    isBrowser: false,
    globalTemData: {},
    setNavigator(ref) {
        this._navigator = ref
    },
    push(path, props) {
        if (!path || !this._navigator) {
            return
        }
        if (/http(s?):\/\//.test(path)) {
            props = { ...this.handlerParams(path), ...props }
            return this._navigator.navigate('common/webview', { ...props, url: path })
        }
        if (/\?/.test(path)) {
            props = { ...this.handlerParams(path), ...props }
            path = path.split('?')[0]
        }
        try {
            this._navigator.navigate(path, props)
        } catch (error) {
            console.log(error)
        }
    },
    goBack(n = 1) {
        try {
            this._navigator && this._navigator.canGoBack() && this._navigator.dispatch(StackActions.pop(n))
        } catch (error) {
            console.log(error)
        }
    },
    popToTop() {
        try {
            this._navigator && this._navigator.dispatch(StackActions.popToTop())
        } catch (error) {
            console.log(error)
        }
    },
    replace(path, props) {
        this._navigator && this._navigator.dispatch(StackActions.replace(path, props))
    },
    async getLocalData(s_key) {
        try {
            const res = await storage.load({ key: s_key })
            return res
        } catch (error) {
            return null
        }
    },
    setLocalData(s_key, data) {
        // data are considered as sensitive and saved on keychains
        storage.save({ key: s_key, data: data })
    },
    async getSensitiveInfo(key) {
        try {
            let data = await RNSInfo.getItem(key, {
                sharedPreferencesName: 'TanglePay',
                keychainService: 'TanglePayData'
            })
            data = JSON.parse(data)
            return data || null
        } catch (error) {
            return null
        }
    },
    async setSensitiveInfo(key, data) {
        await RNSInfo.setItem(key, JSON.stringify(data), {
            sharedPreferencesName: 'TanglePay',
            keychainService: 'TanglePayData'
        })
    },
    async removeSensitiveInfo(key) {
        await RNSInfo.deleteItem(key, {
            sharedPreferencesName: 'TanglePay',
            keychainService: 'TanglePayData'
        })
    },
    // check if it is iOS 14.x to workaround input box bugs
    get isIos14() {
        let systemVersion = DeviceInfo.getSystemVersion()
        return Platform.OS === 'ios' && /^14/.test(systemVersion)
    },
    getDeviceNo() {
        return DeviceInfo.getUniqueId()
    },
    getClientType() {
        return Platform.OS === 'ios' ? 'IOS' : 'Android'
    }
}
