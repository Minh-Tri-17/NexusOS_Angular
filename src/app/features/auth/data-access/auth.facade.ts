import { inject, Injectable } from '@angular/core';
import { MailModel } from '../../../core/models/mail.model';
import { AuthApiService } from './auth-api.service';
import { AuthModel } from './auth.model';
import { OTPModel } from './otp.model';

@Injectable({
  providedIn: 'root',
})
export class AuthFacade {
  private readonly api = inject(AuthApiService);

  //#region //@ METHODS

  login(data: AuthModel) {
    return this.api.login(data);
  }

  sendOtp(data: MailModel) {
    return this.api.sendOTP(data);
  }

  resetPass(data: AuthModel) {
    return this.api.resetPass(data);
  }

  validateOtp(data: OTPModel) {
    return this.api.validateOtp(data);
  }

  //#endregion
}
