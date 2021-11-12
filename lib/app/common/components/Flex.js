import React from 'react';
import { View } from 'react-native';
import { TouchableOpacity } from 'react-native';
export const Flex = (props = {}) => {
	const defaultProps = {
		direction: 'row',
		wrap: 'nowrap',
		justify: 'start',
		align: 'center'
	};
	props = { ...defaultProps, ...props };
	let { style, direction, wrap, justify, align, children, ...restProps } = props;

	let transferConst = [justify, align];
	transferConst = transferConst.map((el) => {
		let tempTxt;
		switch (el) {
			case 'start':
				tempTxt = 'flex-start';
				break;
			case 'end':
				tempTxt = 'flex-end';
				break;
			case 'between':
				tempTxt = 'space-between';
				break;
			case 'around':
				tempTxt = 'space-around';
				break;
			default:
				tempTxt = el;
				break;
		}
		return tempTxt;
	});
	const flexStyle = {
		flexDirection: direction,
		flexWrap: wrap,
		justifyContent: transferConst[0],
		alignItems: transferConst[1]
	};
	const shouldWrapInTouchable =
		restProps.onPress || restProps.onLongPress || restProps.onPressIn || restProps.onPressOut;
	const inner = (
		<View style={[flexStyle, style]} {...restProps}>
			{children}
		</View>
	);

	if (!!shouldWrapInTouchable) {
		return (
			<TouchableOpacity activeOpacity={0.8} {...restProps}>
				{inner}
			</TouchableOpacity>
		);
	} else {
		return inner;
	}
};
export const FlexItem = (props = {}) => {
	const defaultProps = { flex: 1 };
	props = { ...defaultProps, ...props };
	let { style, children, flex, ...restProps } = props;
	const flexItemStyle = {
		flex: flex || 1
	};
	const shouldWrapInTouchable =
		restProps.onPress || restProps.onLongPress || restProps.onPressIn || restProps.onPressOut;
	let inner = null;
	if (!!shouldWrapInTouchable) {
		inner = (
			<TouchableOpacity activeOpacity={0.8} style={[flexItemStyle, style]} {...restProps}>
				{children}
			</TouchableOpacity>
		);
	} else {
		inner = (
			<View style={[flexItemStyle, style]} {...restProps}>
				{children}
			</View>
		);
	}

	return inner;
};
