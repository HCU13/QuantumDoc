import { toast } from "sonner-native";

export type ToastAction = {
  label: string;
  onClick: () => void;
};

type Opts = {
  description?: string;
  duration?: number;
  action?: ToastAction;
};

/* 2026: Tüm Alert.alert() çağrılarını bunlarla değiştir.
 *
 * showSuccess("Kaydedildi")
 * showError("Bir şeyler ters gitti", { action: { label: "Tekrar dene", onClick: retry } })
 */

export function showSuccess(message: string, opts: Opts = {}) {
  return toast.success(message, opts as any);
}

export function showError(message: string, opts: Opts = {}) {
  return toast.error(message, {
    duration: 4500,
    ...(opts as any),
  });
}

export function showInfo(message: string, opts: Opts = {}) {
  return toast(message, opts as any);
}

export function showWarning(message: string, opts: Opts = {}) {
  return toast.warning(message, opts as any);
}

export function showLoading(message: string) {
  return toast.loading(message);
}

export function dismissToast(id?: string | number) {
  toast.dismiss(id);
}

/* Async iş için toast.promise sarıcısı:
 *
 * await withToast(supabase.update(...), {
 *   loading: "Kaydediliyor...",
 *   success: "Kaydedildi",
 *   error: (e) => e.message,
 * });
 */
export function withToast<T>(
  promise: Promise<T>,
  msgs: {
    loading: string;
    success: string | ((value: T) => string);
    error: string | ((err: any) => string);
  },
) {
  toast.promise(promise, msgs as any);
  return promise;
}
