import Utils from './utils'
import localforage from 'localforage'

export const Base = {
    ...Utils,
    globalTemData: {},
    isBrowser: true,
    setNavigator(ref) {
        this.navigator = ref
    },
    push(path, props = {}) {
        if (!path || !this.navigator) {
            return
        }
        const blank = props.blank
        if (blank) {
            delete props.blank
        }
        path = this.handlerUrl(path, props)
        if (/http(s?):\/\//.test(path) || /^mailto/.test(path)) {
            if (window.chrome?.tabs) {
                window.chrome.tabs.create({ url: path })
            } else {
                if (blank) {
                    window.open(path)
                } else {
                    window.location.href = path
                }
            }
            return
        }
        this.navigator.history.push(path)
    },
    goBack() {
        this.navigator.history.goBack()
    },
    replace(path, props) {
        path = this.handlerUrl(path, props)
        this.navigator.history.replace(path)
    },
    chromeGetStorage(s_key) {
        return new Promise((resolve, reject) => {
            window.chrome.storage.local.get([s_key], (res) => {
                if (res[s_key]) {
                    resolve(res[s_key])
                } else {
                    reject(null)
                }
            })
        })
    },
    //read cached data
    async getLocalData(s_key) {
        try {
            let res
            if (window.chrome.storage) {
                res = await this.chromeGetStorage(s_key)
            } else {
                res = await localforage.getItem(s_key)
            }
            return res
        } catch (error) {
            return null
        }
    },
    //set cached data
    setLocalData(s_key, data) {
        if (window.chrome.storage) {
            window.chrome.storage.local.set({ [s_key]: data })
        } else {
            localforage.setItem(s_key, data)
        }
    },
    //validate mobile phone number format
    checkMobi(mobi) {
        return /^1\d{10}$/.test(mobi)
    },
    // get deviceNo
    getDeviceNo() {
        let deviceNo = window.localStorage.getItem('deviceNo')
        if (!deviceNo) {
            deviceNo = this.guid()
            window.localStorage.setItem('deviceNo', deviceNo)
        }
        return deviceNo
    },
    getClientType() {
        return 'Web'
    },
    globalInit({ store, dispatch, Toast }) {
        this.globalStore = store
        this.globalDispatch = dispatch
        this.globalToast = Toast
    }
}
