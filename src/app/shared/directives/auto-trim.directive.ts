import { Directive, ElementRef, HostListener, inject } from '@angular/core';
import { NgControl } from '@angular/forms';

//* Tự động cắt khoảng trắng thừa ở đầu và cuối khi rời khỏi ô nhập liệu (blur)
@Directive({
  selector: 'input[appAutoTrim], textarea[appAutoTrim]',
  standalone: true,
})
export class AutoTrimDirective {
  private readonly el = inject<ElementRef<HTMLInputElement | HTMLTextAreaElement>>(ElementRef);
  private readonly ngControl = inject(NgControl, { optional: true });

  @HostListener('blur')
  onBlur() {
    const target = this.el.nativeElement;
    if (!target || typeof target.value !== 'string') return;

    const trimmed = target.value.trim();
    if (trimmed === target.value) return;

    if (this.ngControl?.control) {
      this.ngControl.control.setValue(trimmed);
      //* Chỉ đánh dấu control hiện tại, không làm bẩn form cha
      this.ngControl.control.markAsDirty();
    } else {
      target.value = trimmed;
    }
  }
}
