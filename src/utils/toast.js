import Toast from 'react-native-toast-message';

export const showToast = (type, title, message) => {
  Toast.show({
    type,
    text1: title,
    text2: message,
    position: 'top',
    visibilityTime: 4000,
    autoHide: true,
    topOffset: 50,
    bottomOffset: 40,
  });
};

export const showSuccess = (title, message) => {
  showToast('success', title, message);
};

export const showError = (title, message) => {
  showToast('error', title, message);
};

export const showInfo = (title, message) => {
  showToast('info', title, message);
}; 