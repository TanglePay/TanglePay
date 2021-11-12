import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {
    ViewPropTypes,
    StyleSheet,
    View,
    Text,
    Animated,
    Image,
    Easing,
    ActivityIndicator,
    TouchableWithoutFeedback,
    Platform
} from 'react-native'
import { getStatusBarHeight, getBottomSpace } from 'react-native-iphone-x-helper'

const position = {
    TOP: 40 + (Platform.OS === 'ios' ? getStatusBarHeight() : 0),
    BOTTOM: -40 - (Platform.OS === 'ios' ? getBottomSpace() : 0),
    CENTER: 0
}

const duration = {
    LONG: 3500,
    SHORT: 2000
}

class ToastContainer extends Component {
    static propTypes = {
        ...ViewPropTypes,
        containerStyle: ViewPropTypes.style,
        duration: PropTypes.number,
        delay: PropTypes.number,
        animationDuration: PropTypes.number,
        visible: PropTypes.bool,
        position: PropTypes.number,
        animation: PropTypes.bool,
        shadow: PropTypes.bool,
        shadowColor: PropTypes.string,
        showText: PropTypes.bool,
        textColor: PropTypes.string,
        textStyle: Text.propTypes.style,
        mask: PropTypes.bool,
        maskColor: PropTypes.string,
        maskStyle: ViewPropTypes.style,
        imgSource: PropTypes.any,
        imgStyle: Image.propTypes.style,
        loading: PropTypes.bool,
        indicatorSize: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        onHidden: PropTypes.func,
        onMaskPress: PropTypes.func
    }

    static defaultProps = {
        visible: false,
        duration: duration.SHORT,
        animationDuration: 200,
        animation: true,
        position: position.CENTER,
        delay: 0,
        showText: true,
        indicatorSize: 'large'
    }

    constructor() {
        super(...arguments)
        this.state = {
            visible: this.props.visible,
            opacity: new Animated.Value(0)
        }
    }

    componentDidMount() {
        if (this.state.visible) {
            this.showTimeout = setTimeout(() => this.show(), this.props.delay)
        }
    }

    componentDidUpdate(nextProps) {
        if (nextProps.visible !== this.props.visible) {
            if (nextProps.visible) {
                clearTimeout(this.showTimeout)
                clearTimeout(this.hideTimeout)
                this.showTimeout = setTimeout(() => this.show(), this.props.delay)
            } else {
                this.hide()
            }

            this.setState({
                visible: nextProps.visible
            })
        }
    }

    componentWillUnmount() {
        this.hide()
    }

    animating = false
    hideTimeout = null
    showTimeout = null

    show = () => {
        clearTimeout(this.showTimeout)
        if (!this.animating) {
            clearTimeout(this.hideTimeout)
            this.animating = true
            const { animation, animationDuration, duration } = this.props
            Animated.timing(this.state.opacity, {
                toValue: 1,
                duration: animation ? animationDuration : 0,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true
            }).start(({ finished }) => {
                if (finished) {
                    this.animating = !finished
                    if (duration > 0) {
                        this.hideTimeout = setTimeout(() => this.hide(), duration)
                    }
                }
            })
        }
    }

    hide = () => {
        clearTimeout(this.showTimeout)
        clearTimeout(this.hideTimeout)
        if (!this.animating) {
            const { animation, animationDuration, onHidden } = this.props
            Animated.timing(this.state.opacity, {
                toValue: 0,
                duration: animation ? animationDuration : 0,
                easing: Easing.in(Easing.ease),
                useNativeDriver: true
            }).start(({ finished }) => {
                if (finished) {
                    this.animating = false
                    onHidden && onHidden(this.props.siblingManager)
                }
            })
        }
    }

    renderMaskToast = (children) => {
        const { maskColor, maskStyle, onMaskPress } = this.props
        return (
            <TouchableWithoutFeedback
                onPress={() => {
                    onMaskPress && onMaskPress()
                }}>
                <View style={[styles.maskStyle, maskStyle, { backgroundColor: maskColor ? maskColor : '' }]}>
                    {children}
                </View>
            </TouchableWithoutFeedback>
        )
    }

    render() {
        const { props } = this
        const offset = props.position
        const position = offset !== 0 ? (offset > 0 ? { top: offset } : { bottom: -offset }) : { height: '100%' }
        const renderToast =
            this.state.visible || this.animating ? (
                <View style={[styles.defaultStyle, position]} pointerEvents='box-none'>
                    <Animated.View
                        style={[
                            styles.containerStyle,
                            props.containerStyle,
                            {
                                opacity: this.state.opacity
                            },
                            props.shadow && styles.shadowStyle,
                            props.shadowColor && { shadowColor: props.shadowColor }
                        ]}
                        pointerEvents='none'>
                        {props.imgSource && (
                            <Image resizeMode='contain' style={props.imgStyle} source={props.imgSource} />
                        )}
                        {props.loading && <ActivityIndicator color='#fff' size={props.indicatorSize} />}
                        {props.showText && (
                            <Text
                                style={[
                                    styles.textStyle,
                                    props.textStyle,
                                    props.textColor && { color: props.textColor }
                                ]}>
                                {this.props.children}
                            </Text>
                        )}
                    </Animated.View>
                </View>
            ) : null
        if (props.mask) {
            return this.renderMaskToast(renderToast)
        } else {
            return renderToast
        }
    }
}

const styles = StyleSheet.create({
    defaultStyle: {
        position: 'absolute',
        left: 0,
        right: 0,
        justifyContent: 'center',
        alignItems: 'center'
    },
    containerStyle: {
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.85)',
        borderRadius: 5
    },
    shadowStyle: {
        shadowColor: '#000',
        shadowOffset: {
            width: 4,
            height: 4
        },
        shadowOpacity: 0.8,
        shadowRadius: 6,
        elevation: 10
    },
    textStyle: {
        fontSize: 16,
        color: '#fff',
        textAlign: 'center'
    },
    maskStyle: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.3)'
    }
})

export default ToastContainer
export { position, duration }
