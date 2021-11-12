import React, { Component } from 'react'
import { Modal } from 'react-native'
import RootSiblings from 'react-native-root-siblings'
import ToastContainer, { position, duration } from './ToastContainer'

class Toast extends Component {
    static propTypes = ToastContainer.propTypes
    static position = position
    static duration = duration

    static showSuccess(message, options = {}) {
        this.show(message, {
            containerStyle: {
                minWidth: 105,
                minHeight: 105,
                backgroundColor: 'rgba(30,30,30,.85)'
            },
            imgStyle: {
                width: 45,
                height: 45
            },
            textStyle: {
                marginTop: 10
            },
            position: this.position.CENTER,
            imgSource: require('./icon_success.png'),
            ...options
        })
    }

    static showLoading(message, options = {}) {
        this.show(message, {
            containerStyle: {
                minWidth: 90,
                minHeight: 80,
                backgroundColor: 'rgba(30,30,30,.85)'
            },
            textStyle: {
                fontSize: 14,
                top: 6
            },
            mask: true,
            duration: 0,
            loading: true,
            position: this.position.CENTER,
            ...options
        })
    }

    static show(message, options = {}) {
        let onHidden = options.onHidden
        let toast
        options.onHidden = function () {
            toast && toast.destroy()
            onHidden && onHidden()
        }
        toast = new RootSiblings(
            (
                <Modal transparent={true}>
                    <ToastContainer {...options} visible={true} showText={!!message}>
                        {message}
                    </ToastContainer>
                </Modal>
            )
        )
        this.toast = toast
        return toast
    }

    static hide(toast) {
        if (toast instanceof RootSiblings) {
            toast.destroy()
        } else if (this.toast instanceof RootSiblings) {
            this.toast.destroy()
        }
    }

    toast = null

    componentWillMount() {
        this.toast = new RootSiblings(
            (
                <Modal transparent={true}>
                    <ToastContainer {...this.props} duration={0} />
                </Modal>
            )
        )
    }

    componentDidUpdate(nextProps) {
        this.toast.update(<ToastContainer {...nextProps} duration={0} />)
    }

    componentWillUnmount() {
        this.toast.destroy()
    }

    render() {
        return null
    }
}

export { RootSiblings as Manager }
export default Toast
