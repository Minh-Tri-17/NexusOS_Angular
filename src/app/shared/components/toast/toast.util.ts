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

  const messages: string[] = Array.isArray(message)
    ? message
    : message
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);

  return toast.custom(Toast, {
    id: toastId,
    duration,
    componentProps: {
      toastId,
      title,
      messages,
      type,
      customIcon: icon,
    },
  });
}
