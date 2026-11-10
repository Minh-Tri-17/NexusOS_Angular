import { Pipe, PipeTransform } from '@angular/core';

//* Pipe kiểm tra và thay thế các giá trị rỗng (null, undefined, chuỗi trắng) bằng ký tự hiển thị mặc định
@Pipe({
  name: 'fallback',
  standalone: true,
})
export class EmptyFallbackPipe implements PipeTransform {
  transform(value: unknown, fallbackText?: string | null): string {
    const defaultText = fallbackText ?? '—';

    if (value === null || value === undefined) {
      return defaultText;
    }

    if (typeof value === 'string' && value.trim() === '') {
      return defaultText;
    }

    if (Array.isArray(value) && value.length === 0) {
      return defaultText;
    }

    return String(value);
  }
}
