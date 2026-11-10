import { Directive, HostListener, inject, input } from '@angular/core';
import { NgControl } from '@angular/forms';

//* Chỉ cho phép nhập các chữ số (0-9), hỗ trợ phím điều hướng, phím tắt và lọc khi dán (paste)
@Directive({
  selector: 'input[appNumberOnly]',
  standalone: true,
})
export class NumberOnlyDirective {
  private readonly ngControl = inject(NgControl, { optional: true });

  //* Cho phép nhập dấu chấm/phẩy thập phân nếu cần
  readonly allowDecimal = input<boolean>(false);

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    const allowedKeys = [
      'Backspace',
      'Tab',
      'End',
      'Home',
      'ArrowLeft',
      'ArrowRight',
      'Delete',
      'Enter',
      'Escape',
    ];

    //* Cho phép phím điều hướng và tổ hợp phím tắt (Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X, Command...)
    if (allowedKeys.includes(event.key) || event.ctrlKey || event.metaKey) {
      return;
    }

    //* Cho phép dấu phân cách thập phân nếu cấu hình allowDecimal
    if (this.allowDecimal() && (event.key === '.' || event.key === ',')) {
      const target = event.target as HTMLInputElement;
      if (!target.value.includes('.') && !target.value.includes(',')) {
        return;
      }
    }

    //* Chặn tất cả phím không phải là chữ số 0-9
    if (!/^\d$/.test(event.key)) {
      event.preventDefault();
    }
  }

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent) {
    event.preventDefault();
    const pastedData = event.clipboardData?.getData('text/plain') || '';
    const regex = this.allowDecimal() ? /[^0-9.]/g : /[^0-9]/g;
    const sanitized = pastedData.replace(regex, '');

    const target = event.target as HTMLInputElement;
    const start = target.selectionStart || 0;
    const end = target.selectionEnd || 0;
    const current = target.value || '';
    const next = current.slice(0, start) + sanitized + current.slice(end);

    target.value = next;
    if (target.setSelectionRange) {
      target.setSelectionRange(start + sanitized.length, start + sanitized.length);
    }

    if (this.ngControl?.control) {
      this.ngControl.control.setValue(next);
      //* Chỉ đánh dấu control hiện tại, không làm bẩn form cha
      this.ngControl.control.markAsDirty();
    }
  }
}
