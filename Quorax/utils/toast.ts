export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastState {
  visible: boolean;
  type: ToastType;
  title: string;
  message: string;
}

let toastState: ToastState = {
  visible: false,
  type: 'info',
  title: '',
  message: '',
};

let toastListeners: Array<(state: ToastState) => void> = [];

const notifyListeners = () => {
  toastListeners.forEach((listener) => listener(toastState));
};

export const showToast = (
  type: ToastType,
  title: string,
  message: string = '',
  duration: number = 2000
) => {
  toastState = {
    visible: true,
    type,
    title,
    message,
  };
  notifyListeners();

  setTimeout(() => {
    toastState = { ...toastState, visible: false };
    notifyListeners();
  }, duration);
};

export const showSuccess = (title: string, message?: string, duration?: number) => {
  showToast('success', title, message, duration);
};

export const showError = (title: string, message?: string, duration?: number) => {
  showToast('error', title, message, duration);
};

export const showInfo = (title: string, message?: string, duration?: number) => {
  showToast('info', title, message, duration);
};

export const showWarning = (title: string, message?: string, duration?: number) => {
  showToast('warning', title, message, duration);
};

export const subscribeToToast = (listener: (state: ToastState) => void) => {
  toastListeners.push(listener);
  return () => {
    toastListeners = toastListeners.filter((l) => l !== listener);
  };
};

export const getToastState = () => toastState;

