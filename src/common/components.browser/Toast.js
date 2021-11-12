import { Toast as AntdToast } from 'antd-mobile'
const config = {
    maskStyle: { backgroundColor: 'transparent' },
    maskClickable: false,
    duration: 2000,
    position: 'center'
}
export const Toast = {
    show(text) {
        AntdToast.show({
            ...config,
            content: text
        })
    },
    success(text) {
        AntdToast.show({
            ...config,
            icon: 'success',
            content: text
        })
    },
    error(text) {
        AntdToast.show({
            ...config,
            icon: 'fail',
            content: text
        })
    },
    warning(text) {
        AntdToast.show({
            ...config,
            content: text
        })
    },
    hide() {
        AntdToast.clear()
    },
    showLoading() {
        AntdToast.show({
            ...config,
            icon: 'loading',
            content: '',
            duration: 30000
        })
    },
    hideLoading() {
        AntdToast.clear()
    }
}
