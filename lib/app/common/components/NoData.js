import React from 'react'
import { Image, View, Text } from 'react-native'
import images from '../../assets/images'

export const NoData = ({ label, img, style = {} }) => {
    img = img || images.com.noData
    return (
        <View style={[{ width: '100%', padding: 30, alignItems: 'center' }, style]}>
            <Image resizeMode='contain' style={{ width: 120, height: 120 }} source={img}></Image>
            {label && <Text style={{ fontSize: 15, marginTop: 30 }}>{label}</Text>}
        </View>
    )
}
