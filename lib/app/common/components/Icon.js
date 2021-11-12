import React from 'react'
import { TouchableOpacity, Image } from 'react-native'
import { hitSlop } from '../style/base.style'
export const Icon = ({ name, style, onPress }) => {
    const ImageEl = <Image style={style} resizeMode='contain' source={name} />
    return onPress ? (
        <TouchableOpacity hitSlop={hitSlop} activeOpacity={0.8} onPress={onPress}>
            {ImageEl}
        </TouchableOpacity>
    ) : (
        ImageEl
    )
}
