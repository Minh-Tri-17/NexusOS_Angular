import { toast } from 'ngx-sonner';
import { Toast, ToastType } from './toast';

export interface ToastOptions {
  title?: string;
  message?: string;
  type?: ToastType;
  duration?: number;
  icon?: string | null;
}

export function showToast({
  title = 'Notification',
  message = '',
  type = 'success',
  duration = 3000,
  icon = null,
}: ToastOptions = {}): string | number {
  const toastId =
    typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now();

  return toast.custom(Toast, {
    id: toastId,
    duration,
    componentProps: {
      toastId,
      title,
      message,
      type,
      customIcon: icon,
    },
  });
}
