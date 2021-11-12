import { Toast as NativeBaseToast } from 'native-base';
import TinyToast from './react-native-tiny-toast';
const config = {
	duration: 2000,
	position: 'top',
	buttonStyle: { backgroundColor: 'transparent', width: 0 },
	buttonTextStyle: { color: 'transparent' }
};
export const Toast = {
	show(text) {
		NativeBaseToast.show({
			text,
			...config
		});
	},
	success(text) {
		NativeBaseToast.show({
			text,
			type: 'success',
			...config
		});
	},
	error(text) {
		NativeBaseToast.show({
			text,
			type: 'danger',
			...config
		});
	},
	warning(text) {
		NativeBaseToast.show({
			text,
			type: 'warning',
			...config
		});
	},
	hide() {
		NativeBaseToast.hide();
	},
	showLoading() {
		TinyToast.showLoading();
	},
	hideLoading() {
		TinyToast.hide();
	}
};
