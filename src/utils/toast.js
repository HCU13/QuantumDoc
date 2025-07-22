import Toast from 'react-native-toast-message';
import CustomToast from '../components/common/CustomToast';

export const showToast = (type, title, message, duration = 4000) => {
  Toast.show({
    type,
    text1: title,
    text2: message,
    position: 'top',
    visibilityTime: duration,
    autoHide: true,
    topOffset: 50,
    bottomOffset: 40,
  });
};

export const showSuccess = (title, message, duration) => {
  showToast('success', title, message, duration);
};

export const showError = (title, message, duration) => {
  showToast('error', title, message, duration);
};

export const showInfo = (title, message, duration) => {
  showToast('info', title, message, duration);
};

export const toastConfig = {
  success: (props) => <CustomToast {...props} type="success" />, 
  error: (props) => <CustomToast {...props} type="error" />, 
  info: (props) => <CustomToast {...props} type="info" />, 
}; 