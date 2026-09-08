import { Component, computed, input } from '@angular/core';
import { toast } from 'ngx-sonner';

export type ToastType = 'primary' | 'info' | 'success' | 'warning' | 'danger';

@Component({
  selector: 'app-toast',
  imports: [],
  templateUrl: './toast.html',
  styleUrl: './toast.scss',
})
export class Toast {
  //#region //@ PROPS

  toastId = input<string | number>();
  title = input<string>('Notification');
  message = input<string>('');
  type = input<ToastType>('success');
  customIcon = input<string | null>(null);

  //#endregion

  //#region //@ STATE

  safeType = computed<ToastType>(() => {
    const validTypes: ToastType[] = ['primary', 'info', 'success', 'warning', 'danger'];
    return validTypes.includes(this.type()) ? this.type() : 'success';
  });
  resolvedIcon = computed<string>(() => {
    return this.customIcon() || this.iconMap[this.safeType()];
  });

  //#endregion

  private readonly iconMap: Record<ToastType, string> = {
    primary: 'fa-solid fa-bell',
    info: 'fa-solid fa-circle-info',
    success: 'fa-solid fa-circle-check',
    warning: 'fa-solid fa-triangle-exclamation',
    danger: 'fa-solid fa-circle-xmark',
  };

  dismiss() {
    if (this.toastId() !== undefined) {
      toast.dismiss(this.toastId());
    }
  }
}
