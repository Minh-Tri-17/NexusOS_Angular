import { Component, computed, HostListener, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { map, Subject, switchMap, takeWhile, timer } from 'rxjs';
import { MailModel } from '../../../../core/models/mail.model';
import { BaseService } from '../../../../core/services/base.service';
import { showToast } from '../../../../shared/components/toast/toast.util';
import { AuthFacade } from '../../data-access/auth.facade';
import { AuthModel } from '../../data-access/auth.model';
import { OTPModel } from '../../data-access/otp.model';

interface PasswordStrengthState {
  width: string;
  color: string;
  label: string;
}

@Component({
  selector: 'app-forgot-password-modal',
  imports: [NgbModule, ReactiveFormsModule],
  templateUrl: './forgot-password-modal.html',
  styleUrl: './forgot-password-modal.scss',
})
export class ForgotPasswordModal {
  private readonly baseService = inject(BaseService);
  private readonly facade = inject(AuthFacade);

  //#region //@ STATE

  readonly forgotEmailForm = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
  });

  readonly forgotNewPasswordForm = new FormGroup({
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    confirmPassword: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
  });

  private readonly startCountdown$ = new Subject<number>();
  readonly currentForgotStep = signal(1);

  //* toSignal() chuyển đổi luồng thay đổi giá trị của form (Observable) sang Signal
  private readonly passwordValue = toSignal(
    this.forgotNewPasswordForm.controls.password.valueChanges,
    { initialValue: '' },
  );
  readonly otpCountDown = toSignal(
    this.startCountdown$.pipe(
      switchMap((seconds) =>
        timer(0, 1000).pipe(
          map((tick) => seconds - tick),
          takeWhile((val) => val >= 0),
        ),
      ),
    ),
    { initialValue: 0 },
  );

  readonly otpDigits = signal<string[]>(['', '', '', '', '', '']);

  //* computed() dùng để tính toán giá trị dựa trên state khác
  readonly otpInput = computed(() => this.otpDigits().join(''));

  readonly pwdStrength = computed<PasswordStrengthState>(() => {
    const val = this.passwordValue();

    if (!val) {
      return {
        width: '0%',
        color: 'transparent',
        label: 'Enter password strength',
      };
    }

    let score = 0;
    if (val.length >= 8) score++;
    if (/[A-Z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;

    switch (score) {
      case 0:
      case 1:
        return { width: '25%', color: '#ef4444', label: 'Weak Password' };
      case 2:
        return { width: '50%', color: '#f59e0b', label: 'Fair Password' };
      case 3:
        return { width: '75%', color: '#3b82f6', label: 'Good Password' };
      default:
        return { width: '100%', color: '#10b981', label: 'Strong Password!' };
    }
  });

  readonly isVisibility = signal(false);
  readonly isSendingOtp = signal(false);
  readonly isVerifyingOtp = signal(false);
  readonly isResetting = signal(false);

  //#endregion

  //#region //@ HELPER

  private startOtpCountDown(seconds = 60) {
    this.startCountdown$.next(seconds);
  }

  private updateDigit(index: number, val: string): void {
    this.otpDigits.update((digits) => {
      const next = [...digits];
      next[index] = val;

      return next;
    });
  }

  //#endregion

  //#region //@ METHODS

  goToResetStep(step: number) {
    this.currentForgotStep.set(step);
  }

  @HostListener('hidden.bs.modal')
  onModalClose(): void {
    this.currentForgotStep.set(1);
    this.forgotEmailForm.reset();
    this.forgotNewPasswordForm.reset();
    this.otpDigits.set(['', '', '', '', '', '']);
  }

  async handleSendOTP() {
    if (this.forgotEmailForm.invalid) return;

    this.isSendingOtp.set(true);
    //* getRawValue() lấy toàn bộ giá trị của form, kể cả ô bị disabled
    const rawValues = this.forgotEmailForm.getRawValue();

    const payload: MailModel = {
      to: rawValues.email,
    };

    try {
      const res = await this.facade.sendOtp(payload);

      if (res?.isSuccess) {
        this.goToResetStep(2);
        this.startOtpCountDown(60);
      }
    } catch {
    } finally {
      this.isSendingOtp.set(false);
    }
  }

  async handleOtpVerify() {
    const otpVal = this.otpInput();
    if (this.forgotEmailForm.invalid || !otpVal || otpVal.length < 6) return;

    this.isVerifyingOtp.set(true);

    const emailValue = this.forgotEmailForm.controls.email.value;

    const payload: OTPModel = {
      otp: otpVal,
      email: emailValue,
    };

    try {
      const res = await this.facade.validateOtp(payload);

      if (res?.isSuccess) {
        this.forgotNewPasswordForm.patchValue({
          email: emailValue,
        });

        this.goToResetStep(3);
      }
    } catch {
    } finally {
      this.isVerifyingOtp.set(false);
    }
  }

  async handleNewPassword() {
    if (this.forgotNewPasswordForm.invalid) return;

    const { password, confirmPassword } = this.forgotNewPasswordForm.getRawValue();

    if (password !== confirmPassword) {
      showToast({
        message: 'Passwords do not match.',
        type: 'danger',
      });

      return;
    }

    this.isResetting.set(true);
    //* getRawValue() lấy toàn bộ giá trị của form, kể cả ô bị disabled
    const rawValues: AuthModel = this.forgotNewPasswordForm.getRawValue();

    try {
      const res = await this.facade.resetPass(rawValues);

      if (res?.isSuccess) this.baseService.closeModal();
    } catch {
    } finally {
      this.isResetting.set(false);
    }
  }

  handleClose() {
    this.baseService.closeModal();
  }

  handleOtpKeydown(event: KeyboardEvent, index: number): void {
    const input = event.currentTarget as HTMLInputElement;

    if (event.key === 'Backspace') {
      event.preventDefault();

      if (this.otpDigits()[index]) {
        //* Xóa ô hiện tại nếu có ký tự
        this.updateDigit(index, '');
      } else if (index > 0) {
        //* Ô hiện tại rỗng -> Lùi về ô trước, xóa và focus
        const prevInput = input.previousElementSibling as HTMLInputElement | null;
        if (prevInput) {
          this.updateDigit(index - 1, '');
          prevInput.focus();
        }
      }

      return;
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      (input.previousElementSibling as HTMLInputElement | null)?.focus();
      return;
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      (input.nextElementSibling as HTMLInputElement | null)?.focus();
      return;
    }
  }

  handleOtpInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const digit = input.value.replace(/\D/g, '').slice(-1);

    this.updateDigit(index, digit);

    if (digit) {
      const nextInput = input.nextElementSibling as HTMLInputElement | null;
      if (nextInput) {
        nextInput.focus();
        nextInput.select();
      }
    }
  }

  handleOtpPaste(event: ClipboardEvent, startIndex: number): void {
    event.preventDefault();
    const pasted = event.clipboardData?.getData('text') ?? '';
    const digits = pasted.replace(/\D/g, '').slice(0, 6);
    if (!digits) return;

    const current = [...this.otpDigits()];
    for (let i = 0; i < digits.length && startIndex + i < current.length; i++) {
      current[startIndex + i] = digits[i];
    }

    this.otpDigits.set(current);

    const container = (event.currentTarget as HTMLInputElement).parentElement;
    if (container) {
      const inputs = container.querySelectorAll<HTMLInputElement>('.otp-box');
      const targetFocusIndex = Math.min(startIndex + digits.length, inputs.length - 1);
      inputs[targetFocusIndex]?.focus();
    }
  }

  handleOtpFocus(event: FocusEvent, index: number): void {
    const firstEmptyIndex = this.otpDigits().findIndex((val) => !val);

    if (firstEmptyIndex !== -1 && firstEmptyIndex < index) {
      const container = (event.currentTarget as HTMLInputElement).parentElement;
      const targetInput =
        container?.querySelectorAll<HTMLInputElement>('.otp-box')[firstEmptyIndex];
      targetInput?.focus();
    }
  }

  handleTogglePwdVisibility() {
    this.isVisibility.update((visible) => !visible);
  }

  //#endregion
}
