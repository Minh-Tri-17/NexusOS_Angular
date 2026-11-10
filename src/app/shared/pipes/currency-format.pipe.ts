import { Pipe, PipeTransform } from '@angular/core';

//* Pipe định dạng số tiền theo đơn vị tiền tệ quốc tế (VND, USD, EUR, JPY...)
@Pipe({
  name: 'currencyFormat',
  standalone: true,
})
export class CurrencyFormatPipe implements PipeTransform {
  transform(
    value: number | string | null | undefined,
    currencyUnit?: string | null,
    fallback = '—'
  ): string {
    if (value === null || value === undefined || value === '') {
      return fallback;
    }

    const num = typeof value === 'number' ? value : Number(value);
    if (isNaN(num)) {
      return fallback;
    }

    const unit = (currencyUnit || 'VND').toUpperCase().trim();

    try {
      const localeMap: Record<string, string> = {
        VND: 'vi-VN',
        USD: 'en-US',
        EUR: 'de-DE',
        JPY: 'ja-JP',
        CNY: 'zh-CN',
        GBP: 'en-GB',
        SGD: 'en-SG',
      };

      const locale = localeMap[unit] || 'en-US';

      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: unit,
        maximumFractionDigits: unit === 'VND' || unit === 'JPY' ? 0 : 2,
      }).format(num);
    } catch {
      // Fallback an toàn nếu mã tiền tệ không chuẩn theo ISO 4217
      return `${num.toLocaleString('vi-VN')} ${unit}`;
    }
  }
}
