import { API_URL } from '../http'
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
        url.replace(/([^?&=]+)=([^&]+)/g, (_, k, v) => (obj[k] = decodeURIComponent(v)))
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
        if (num.constructor.name === 'BigNumber') {
            num = num.valueOf()
        }
        return (parseFloat(num) || 0).toFixed(len || 2)
    },
    checkPassword(password) {
        if (password.length < 8 || !/\d/.test(password) || !/[a-zA-Z]/.test(password)) {
            return false
        }
        return true
    },
    getIcon(token) {
        return `${API_URL}/icon/${token}.png`
    }
}

export default Utils
