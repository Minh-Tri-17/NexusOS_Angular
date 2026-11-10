import { Pipe, PipeTransform } from '@angular/core';

export type MaskType = 'phone' | 'cccd' | 'bank' | 'email' | 'custom';

export interface MaskCustomOptions {
  startVisible?: number;
  endVisible?: number;
  maskChar?: string;
}

//* Pipe che giấu thông tin nhạy cảm (SĐT, CCCD, Số tài khoản ngân hàng, Email) phục vụ bảo mật hiển thị
@Pipe({
  name: 'mask',
  standalone: true,
})
export class MaskPipe implements PipeTransform {
  transform(
    value: string | number | null | undefined,
    type?: MaskType | null,
    options?: MaskCustomOptions | null
  ): string {
    if (value === null || value === undefined || value === '') {
      return '—';
    }

    const str = String(value).trim();
    if (!str) return '—';

    const maskChar = options?.maskChar || '*';
    const maskType = type ?? 'phone';

    switch (maskType) {
      case 'phone':
        // Vd: 0912345678 -> 091****678 (giữ 3 đầu, 3 cuối)
        return this.maskRange(str, 3, 3, maskChar);

      case 'cccd':
        // Vd: 001201000123 -> 0012*****123 (giữ 4 đầu, 3 cuối)
        return this.maskRange(str, 4, 3, maskChar);

      case 'bank':
        // Vd: 19036789999 -> 1903****999 (giữ 4 đầu, 3 cuối)
        return this.maskRange(str, 4, 3, maskChar);

      case 'email':
        // Vd: employee@company.com -> em******@company.com
        return this.maskEmail(str, maskChar);

      case 'custom': {
        const start = options?.startVisible ?? 2;
        const end = options?.endVisible ?? 2;
        return this.maskRange(str, start, end, maskChar);
      }

      default:
        return this.maskRange(str, 3, 3, maskChar);
    }
  }

  private maskRange(
    str: string,
    startVisible: number,
    endVisible: number,
    maskChar: string
  ): string {
    const len = str.length;
    if (len <= startVisible + endVisible) {
      // Chuỗi quá ngắn: chỉ giữ ký tự đầu và cuối
      if (len <= 2) return maskChar.repeat(len);
      return str[0] + maskChar.repeat(len - 2) + str[len - 1];
    }

    const start = str.substring(0, startVisible);
    const end = str.substring(len - endVisible);
    const maskedLength = len - startVisible - endVisible;

    return `${start}${maskChar.repeat(maskedLength)}${end}`;
  }

  private maskEmail(email: string, maskChar: string): string {
    const parts = email.split('@');
    if (parts.length !== 2) {
      return this.maskRange(email, 2, 2, maskChar);
    }

    const [user, domain] = parts;
    if (user.length <= 2) {
      return `${user[0]}${maskChar}@${domain}`;
    }

    const visibleUser = user.substring(0, 2);
    const maskedUser = visibleUser + maskChar.repeat(user.length - 2);
    return `${maskedUser}@${domain}`;
  }
}
