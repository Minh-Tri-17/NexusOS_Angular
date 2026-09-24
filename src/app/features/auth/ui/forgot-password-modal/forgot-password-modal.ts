import {
  Component,
  ElementRef,
  HostListener,
  inject,
  QueryList,
  signal,
  ViewChildren,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { map, Subject, switchMap, takeWhile, timer } from 'rxjs';
import { MailModel } from '../../../../core/models/mail.model';
import { AuthFacade } from '../../data-access/auth.facade';
import { OTPModel } from '../../data-access/otp.model';

@Component({
  selector: 'app-forgot-password-modal',
  imports: [ReactiveFormsModule],
  templateUrl: './forgot-password-modal.html',
  styleUrl: './forgot-password-modal.scss',
})
export class ForgotPasswordModal {
  private facade = inject(AuthFacade);
  otpInput?: string;

  //#region //@ STATE

  private readonly startCountdown$ = new Subject<number>();
  readonly currentForgotStep = signal(1);
  isVisibility = signal(false);
  isSendingOtp = signal(false);
  isVerifyingOtp = signal(false);

  forgotEmailForm = new FormGroup({
    email: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  resetForm = new FormGroup({
    username: new FormControl(),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    phone: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    email: new FormControl(),
  });

  otpCountDown = toSignal(
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

  @ViewChildren('otpInput') otpInputs!: QueryList<ElementRef<HTMLInputElement>>;

  //#endregion

  //#region //@ HELPER

  private startOtpCountDown(seconds = 60) {
    this.startCountdown$.next(seconds);
  }

  private syncOtpValue(): void {
    const combined = this.otpInputs
      .toArray()
      .map((inp) => inp.nativeElement.value)
      .join('');

    this.otpInput = combined;
  }

  //#endregion

  //#region //@ METHODS

  goToResetStep(step: number) {
    this.currentForgotStep.set(step);
  }

  @HostListener('hidden.bs.modal')
  onModalClose(): void {
    this.currentForgotStep.set(1);
    this.forgotEmailForm.patchValue({
      email: '',
    });
  }

  async handleSendOTP() {
    if (this.forgotEmailForm.invalid) return;
    this.isSendingOtp.set(true);

    //* getRawValue() lấy toàn bộ giá trị của form, kể cả ô bị disabled
    //* as ép kiểu sang model tương ứng
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
    } catch (error: any) {
    } finally {
      this.isSendingOtp.set(false);
    }
  }

  handleOtpKeydown(event: KeyboardEvent, index: number): void {
    const inputs = this.otpInputs.toArray();
    //* nativeElement lắng nghe sự thay đổi giá trị của form.
    const input = inputs[index].nativeElement;
    const isHandledKey =
      event.key === 'Backspace' ||
      (event.key === 'ArrowLeft' && index > 0) ||
      (event.key === 'ArrowRight' && index < inputs.length - 1);

    if (!isHandledKey) return;

    event.preventDefault();

    if (event.key === 'Backspace') {
      if (input.value) {
        input.value = '';
      } else if (index > 0) {
        //* nativeElement lắng nghe sự thay đổi giá trị của form.
        inputs[index - 1].nativeElement.value = '';
        inputs[index - 1].nativeElement.focus();
      }
      this.syncOtpValue();
      return;
    }

    if (event.key === 'ArrowLeft') {
      //* nativeElement lắng nghe sự thay đổi giá trị của form.
      inputs[index - 1].nativeElement.focus();
      return;
    }

    if (event.key === 'ArrowRight') {
      //* nativeElement lắng nghe sự thay đổi giá trị của form.
      inputs[index + 1].nativeElement.focus();
      return;
    }
  }

  handleOtpInput(event: Event, index: number): void {
    const inputs = this.otpInputs.toArray();
    const input = event.target as HTMLInputElement;
    const digit = input.value.replace(/\D/g, '').slice(-1);
    input.value = digit;

    if (digit && index < inputs.length - 1) {
      //* nativeElement lắng nghe sự thay đổi giá trị của form.
      inputs[index + 1].nativeElement.focus();
      inputs[index + 1].nativeElement.select();
    }

    this.syncOtpValue();
  }

  handleOtpPaste(event: ClipboardEvent, index: number): void {
    event.preventDefault();
    const pasted = event.clipboardData?.getData('text') ?? '';
    const digits = pasted.replace(/\D/g, '').slice(0, 6);
    const inputs = this.otpInputs.toArray();

    digits.split('').forEach((d, i) => {
      const targetIndex = index + i;
      if (targetIndex < inputs.length)
        //* nativeElement lắng nghe sự thay đổi giá trị của form.
        inputs[targetIndex].nativeElement.value = d;
    });

    const nextFocus = Math.min(index + digits.length, inputs.length - 1);
    //* nativeElement lắng nghe sự thay đổi giá trị của form.
    inputs[nextFocus].nativeElement.focus();
    this.syncOtpValue();
  }

  handleOtpFocus(index: number): void {
    const inputs = this.otpInputs.toArray();
    const firstEmpty = inputs.findIndex((inp) => !inp.nativeElement.value);

    if (firstEmpty !== -1 && firstEmpty < index)
      //* nativeElement lắng nghe sự thay đổi giá trị của form.
      inputs[firstEmpty].nativeElement.focus();
  }

  async handleOtpVerify() {
    if (this.forgotEmailForm.invalid) return;
    this.isVerifyingOtp.set(true);

    const emailValue = this.forgotEmailForm.controls.email.value;

    const payload: OTPModel = {
      otp: this.otpInput,
      email: emailValue,
    };

    try {
      const res = await this.facade.validateOtp(payload);

      if (res?.isSuccess) {
        this.resetForm.patchValue({
          email: emailValue,
        });

        this.goToResetStep(3);
      }
    } catch (error: any) {
    } finally {
      this.isVerifyingOtp.set(false);
    }
  }

  handleTogglePwdVisibility() {
    this.isVisibility.update((visible) => !visible);
  }

  //#endregion
}
