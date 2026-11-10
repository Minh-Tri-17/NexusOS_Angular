import { Directive, effect, inject, input } from '@angular/core';
import { NgControl } from '@angular/forms';

//* Khóa select qua FormControl khi tải dữ liệu, tránh cảnh báo xung đột [disabled].
@Directive({
  selector: 'select[appSelectLoading]',
  standalone: true,
})
export class SelectLoadingDirective {
  private readonly ngControl = inject(NgControl, { optional: true });

  //* Signal nhận trạng thái loading của dữ liệu select
  readonly appSelectLoading = input<boolean>(false);

  constructor() {
    effect(() => {
      const loading = this.appSelectLoading();
      const control = this.ngControl?.control;
      if (!control) return;

      if (loading) control.disable({ emitEvent: false });
      else control.enable({ emitEvent: false });
    });
  }
}
