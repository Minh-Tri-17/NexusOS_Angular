import { Directive, HostBinding, HostListener, inject } from '@angular/core';
import { NgControl } from '@angular/forms';

//* Tự động chuyển ký tự thành chữ in hoa và cập nhật giá trị vào FormControl
@Directive({
  selector: 'input[appUppercase]',
  standalone: true,
})
export class UppercaseDirective {
  private readonly ngControl = inject(NgControl, { optional: true });

  @HostBinding('style.text-transform') textTransform = 'uppercase';

  @HostListener('input', ['$event'])
  onInput(event: Event) {
    const target = event.target as HTMLInputElement;
    if (!target || typeof target.value !== 'string') return;

    const start = target.selectionStart;
    const end = target.selectionEnd;
    const upper = target.value.toUpperCase();

    if (target.value !== upper) {
      target.value = upper;

      if (start !== null && end !== null) target.setSelectionRange(start, end);

      if (this.ngControl?.control)
        this.ngControl.control.setValue(upper, { emitModelToViewChange: false });
    }
  }
}
