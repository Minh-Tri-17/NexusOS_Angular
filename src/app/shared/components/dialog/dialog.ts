import {
  Component,
  computed,
  inject,
  InjectionToken,
  input,
  output,
  signal,
} from '@angular/core';
import { NgClass } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

export type DialogType = 'danger' | 'warning' | 'info' | 'success';

export interface DialogOptions {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  type?: DialogType;
  icon?: string;
}

export const DIALOG_OPTIONS = new InjectionToken<DialogOptions>('DIALOG_OPTIONS');

@Component({
  selector: 'app-dialog',
  imports: [NgClass],
  templateUrl: './dialog.html',
  styleUrl: './dialog.scss',
})
export class Dialog {
  private readonly injectedOptions = inject(DIALOG_OPTIONS, { optional: true });
  private readonly activeModal = inject(NgbActiveModal, { optional: true });

  //#region //@ PROPS

  readonly titleProp = input<string | undefined>(undefined, { alias: 'title' });
  readonly messageProp = input<string | undefined>(undefined, { alias: 'message' });
  readonly confirmTextProp = input<string | undefined>(undefined, { alias: 'confirmText' });
  readonly cancelTextProp = input<string | undefined>(undefined, { alias: 'cancelText' });
  readonly typeProp = input<DialogType | undefined>(undefined, { alias: 'type' });
  readonly iconProp = input<string | undefined>(undefined, { alias: 'icon' });
  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  //#endregion

  //#region //@ STATE

  private readonly manualOptions = signal<DialogOptions>({});

  readonly title = computed(() => {
    return (
      this.manualOptions().title ??
      this.titleProp() ??
      this.injectedOptions?.title ??
      'Xác nhận xóa'
    );
  });

  readonly message = computed(() => {
    return (
      this.manualOptions().message ??
      this.messageProp() ??
      this.injectedOptions?.message ??
      'Bạn có chắc chắn muốn xóa bản ghi này?'
    );
  });

  readonly confirmText = computed(() => {
    return (
      this.manualOptions().confirmText ??
      this.confirmTextProp() ??
      this.injectedOptions?.confirmText ??
      'Xác nhận'
    );
  });

  readonly cancelText = computed(() => {
    return (
      this.manualOptions().cancelText ??
      this.cancelTextProp() ??
      this.injectedOptions?.cancelText ??
      'Hủy'
    );
  });

  readonly type = computed<DialogType>(() => {
    return (
      this.manualOptions().type ??
      this.typeProp() ??
      this.injectedOptions?.type ??
      'danger'
    );
  });

  readonly iconClass = computed<string>(() => {
    const custom =
      this.manualOptions().icon ??
      this.iconProp() ??
      this.injectedOptions?.icon;
    if (custom) return custom;

    switch (this.type()) {
      case 'warning':
        return 'fa-solid fa-triangle-exclamation';
      case 'info':
        return 'fa-solid fa-circle-info';
      case 'success':
        return 'fa-solid fa-circle-check';
      case 'danger':
      default:
        return 'fa-solid fa-triangle-exclamation';
    }
  });

  readonly iconColor = computed<string>(() => {
    switch (this.type()) {
      case 'warning':
        return '#f59e0b';
      case 'info':
        return '#3b82f6';
      case 'success':
        return '#10b981';
      case 'danger':
      default:
        return '#ef4444';
    }
  });

  readonly iconBgColor = computed<string>(() => {
    switch (this.type()) {
      case 'warning':
        return 'rgba(245, 158, 11, 0.12)';
      case 'info':
        return 'rgba(59, 130, 246, 0.12)';
      case 'success':
        return 'rgba(16, 185, 129, 0.12)';
      case 'danger':
      default:
        return 'rgba(239, 68, 68, 0.12)';
    }
  });

  readonly confirmBtnClass = computed<string>(() => {
    switch (this.type()) {
      case 'warning':
        return 'btn-warning text-dark';
      case 'info':
        return 'btn-primary';
      case 'success':
        return 'btn-success';
      case 'danger':
      default:
        return 'btn-danger';
    }
  });

  //#endregion

  //#region //@ METHODS

  setOptions(options: DialogOptions) {
    this.manualOptions.set(options);
  }

  handleCancel() {
    this.cancelled.emit();
    this.activeModal?.dismiss(false);
  }

  handleConfirm() {
    this.confirmed.emit();
    this.activeModal?.close(true);
  }

  //#endregion
}
