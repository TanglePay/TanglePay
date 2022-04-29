import { Base } from './base'
export const API_URL = 'http://api.iotaichi.com'
let token = ''
Base.getLocalData('token').then((res) => {
    token = res || ''
})
const Http = {
    request(method, url, params = {}) {
        return new Promise((resolve, reject) => {
            params = { token, ...params }
            // indicates whether prompting 'loading' messages
            const loading = params.loading
            // if isHandlerError=false, fallback to default hander which prompts error message
            const isHandlerError = params.isHandlerError
            isHandlerError && delete params.isHandlerError
            if (!/^http/.test(url)) {
                url = `${API_URL}/api?${url}`
            }
            if (method === 'GET') {
                let paramsUrl = ''
                for (let [key, value] of Object.entries(params)) {
                    paramsUrl += key + '=' + value + '&'
                }
                if (paramsUrl) {
                    url = `${url}${/\?/.test(url) ? '&' : '?'}${paramsUrl}`
                }
                url = url.replace(/&$/, '')
                params = null
            }
            loading && Base.globalToast.showLoading()
            fetch(url, {
                method,
                body: params ? JSON.stringify(params) : undefined,
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json'
                }
            })
                .then((response) => response.json())
                .then((result) => {
                    loading && Base.globalToast.hideLoading()
                    const { msg, data, status } = result
                    if (parseInt(status) !== 0) {
                        if (!isHandlerError) {
                            Base.globalToast.error(msg)
                            return null
                        }
                        return resolve(result)
                    }
                    return resolve(data)
                })
                .catch((error) => {
                    loading && Base.globalToast.hideLoading()
                    return reject(error)
                })
        })
    },
    clearTimeout() {
        this.timeoutHandler && clearTimeout(this.timeoutHandler)
        this.timeoutHandler = null
    },
    async GET(url, params = {}) {
        return this.request('GET', url, params)
    },
    async POST(url, params = {}) {
        return this.request('POST', url, params)
    },
    async DELETE(url, params = {}) {
        return this.request('DELETE', url, params)
    }
}

export default Http
