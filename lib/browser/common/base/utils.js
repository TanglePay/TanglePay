import { API_URL } from '../http'
import PubSub from 'pubsub-js'
const Utils = {
    handlerUrl(path, props) {
        let urlParam = ''
        for (const key in props) {
            const value = props[key]
            urlParam += '&' + key + '=' + escape(value)
        }
        path = /\?/.test(path) ? `${path}${urlParam}` : `${path}${urlParam.replace(/^&/, '?')}`
        return path
    },
    handlerParams(url) {
        const obj = {}
        try {
            url.replace(/([^?&=]+)=([^&]+)/g, (_, k, v) => (obj[k] = decodeURIComponent(v)))
        } catch (error) {
            url.replace(/([^?&=]+)=([^&]+)/g, (_, k, v) => (obj[k] = unescape(v)))
        }
        return obj
    },
    checkMobi(mobi) {
        return /^1\d{10}$/.test(mobi)
    },
    handleAddress(address) {
        return (address || '').replace(/(^.{4})(.+)(.{4}$)/, '$1...$3')
    },
    guid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = (Math.random() * 16) | 0
            const v = c == 'x' ? r : (r & 0x3) | 0x8
            return v.toString(16)
        })
    },
    formatNum(num, len) {
        num = num || 0
        len = len || len === 0 ? len : 4
        if (num.constructor.name === 'BigNumber') {
            num = num.valueOf()
        }
        let numStr = String(num)
        let [i, decimals] = numStr.split('.')
        if (decimals?.length > len) {
            numStr = `${i}.${decimals.slice(0, len)}`
        }
        return (parseFloat(numStr) || 0).toFixed(len)
    },
    checkPassword(password) {
        if (password.length < 8 || password.length > 20 || !/\d/.test(password) || !/[a-zA-Z]/.test(password)) {
            return false
        }
        return true
    },
    checkPin(pin) {
        const regex = /^\d{6}$/;
        return regex.test(pin);
    },
    getIcon(token) {
        return `${API_URL}/icon/${token}.png`
    },
    sendEvt(key, data) {
        PubSub.publish(key, data)
    },
    addEvt(key, func) {
        return PubSub.subscribe(key, (name, data) => {
            func(data)
        })
    },
    removeEvt(key) {
        PubSub.unsubscribe(key)
    }
}

export default Utils
