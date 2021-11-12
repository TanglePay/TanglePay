import React, { useMemo } from 'react'
import { Image } from 'react-native'
import { View, Header, Left, Body, Right, Button, Text, Icon } from 'native-base'
import { Base } from '../base'
import { S, SS } from '../style/base.style'
import { ThemeVar } from '../style/theme.js'
import images from '../../assets/images'
export const Nav = ({
    leftLabel,
    leftIcon = images.com.left,
    leftContent,
    leftStyle,
    onLeft = () => Base.goBack(),
    rightContent,
    rightIcon,
    rightLabel,
    rightStyle,
    onRight,
    title,
    titleStyle,
    headerStyle,
    bodyStyle,
    androidStatusBarColor
}) => {
    const left = useMemo(() => {
        if (leftContent) {
            return leftContent
        } else if (leftLabel) {
            return (
                <Left>
                    <Button onPress={onLeft} transparent>
                        <Text style={{ ...S.font(12, ThemeVar.toolbarBtnTextColor), ...leftStyle }}>{leftLabel}</Text>
                    </Button>
                </Left>
            )
        } else if (leftIcon) {
            return (
                <Left>
                    <Button style={{ marginLeft: 10 }} onPress={onLeft} transparent>
                        <Image resizeMode='contain' source={leftIcon} style={{ ...S.wh(26), ...leftStyle }} />
                    </Button>
                </Left>
            )
        }
        return <Left />
    }, [leftContent, leftLabel, leftIcon, leftStyle, onLeft])
    const right = useMemo(() => {
        if (rightContent) {
            return rightContent
        } else if (rightIcon) {
            return (
                <Right>
                    <Button onPress={onRight} transparent>
                        <Image resizeMode='contain' source={rightIcon} style={{ ...S.wh(26), ...rightStyle }} />
                    </Button>
                </Right>
            )
        } else if (rightLabel) {
            return (
                <Right>
                    <Button onPress={onRight} transparent>
                        <Text style={{ ...S.font(14, ThemeVar.textColor), ...rightStyle }}>{rightLabel}</Text>
                    </Button>
                </Right>
            )
        }
        return <Right />
    }, [rightContent, rightIcon, rightLabel, rightStyle, onRight])
    return (
        <Header
            transparent
            androidStatusBarColor={androidStatusBarColor || ThemeVar.statusBarColor}
            style={{ ...S.border(2), ...headerStyle }}>
            {left}
            <Body style={{ flex: 4, ...bodyStyle }}>
                <Text numberOfLines={1} style={{ ...S.font(17), ...S.fw500, ...titleStyle }}>
                    {title}
                </Text>
            </Body>
            {right}
        </Header>
    )
}

export const Nav1 = (props) => {
    return (
        <View style={[S.paddingT(ThemeVar.nav1ToolbarTop), SS.ph20]}>
            <Nav headerStyle={{ borderBottomWidth: 0 }} {...props} />
        </View>
    )
}
