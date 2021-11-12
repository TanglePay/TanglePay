import { StyleSheet } from 'react-native'
import { ThemeVar } from './theme'
let _fontScale = 1
// add hit area
export const hitSlop = {
    left: 10,
    right: 10,
    top: 10,
    bottom: 10
}
const styleObj = {
    // layout
    c: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    ac: {
        alignItems: 'center'
    },
    as: {
        alignItems: 'flex-start'
    },
    ae: {
        alignItems: 'flex-end'
    },
    jc: {
        justifyContent: 'center'
    },
    js: {
        justifyContent: 'flex-start'
    },
    jsb: {
        justifyContent: 'space-between'
    },
    jsa: {
        justifyContent: 'space-around'
    },
    je: {
        justifyContent: 'flex-end'
    },
    acr: {
        alignItems: 'center',
        flexDirection: 'row'
    },
    flex1: {
        flex: 1
    },
    row: {
        flexDirection: 'row'
    },
    pr: {
        position: 'relative'
    },
    pa: {
        position: 'absolute'
    },
    w100: {
        width: '100%'
    },
    h100: {
        height: '100%'
    },
    bgT: {
        backgroundColor: 'transparent'
    },
    bgW: {
        backgroundColor: ThemeVar.cardDefaultBg
    },
    bgS: {
        backgroundColor: ThemeVar.secondBgColor
    },
    cW: {
        color: ThemeVar.cardDefaultBg
    },
    cS: {
        color: ThemeVar.secondTextColor
    },
    cP: {
        color: ThemeVar.brandPrimary
    },
    cR: {
        color: ThemeVar.brandDanger
    },
    radius10: {
        borderRadius: 10
    },
    tr: {
        textAlign: 'right'
    },
    tl: {
        textAlign: 'left'
    },
    tc: {
        textAlign: 'center'
    },
    // bold
    fw500: {
        fontWeight: '500'
    },
    fw600: {
        fontWeight: '600'
    }
}
// generate font styles
for (let i = 10; i <= 30; i++) {
    styleObj[`fz${i}`] = {
        fontSize: i
    }
}
// margin/padding，output: p10:{padding:10},mr10:{marginRight:10}...
for (let n = 0; n <= 80; n += 5) {
    ;['Horizontal', 'Vertical', 'Top', 'Bottom', 'Left', 'Right', ''].forEach((k) => {
        const key = `${(k[0] || '').toLocaleLowerCase()}${n}`
        styleObj[`p${key}`] = {
            [`padding${k}`]: n
        }
        styleObj[`m${key}`] = {
            [`margin${k}`]: n
        }
    })
}
// base style
export const S = {
    // width, height
    wh(n_w, n_h) {
        return { width: n_w, height: n_h || n_w }
    },
    w(n_value) {
        return { width: n_value }
    },
    h(n_value) {
        return { height: n_value }
    },
    // background color
    bg(s_color) {
        return { backgroundColor: s_color }
    },
    color(s_color) {
        return { color: s_color }
    },
    // borderline stype, n_type:0->top，1->right，2->bottom，3->left，4->all
    border(n_type = 0, s_color = '#ddd', n_borderWidth) {
        let types = ['Top', 'Right', 'Bottom', 'Left']
        let s_type = types[n_type] || ''
        return {
            [`border${s_type}Width`]: n_borderWidth || StyleSheet.hairlineWidth,
            [`border${s_type}Color`]: s_color
        }
    },
    radius(n_num) {
        return { borderRadius: n_num }
    },
    font(n_size, s_fontColor) {
        n_size = n_size
        return s_fontColor ? { fontSize: n_size * _fontScale, color: s_fontColor } : { fontSize: n_size * _fontScale }
    },
    lineHeight(n_size) {
        return { lineHeight: n_size * _fontScale }
    },
    ...styleObj
}
;['Horizontal', 'Vertical', 'Top', 'Bottom', 'Left', 'Right', ''].forEach((key) => {
    S[`padding${key[0] || ''}`] = (n_value) => {
        return { [`padding${key}`]: n_value }
    }
    S[`margin${key[0] || ''}`] = (n_value) => {
        return { [`margin${key}`]: n_value }
    }
})

// Convert to stylesheet
export const SS = StyleSheet.create(styleObj)
