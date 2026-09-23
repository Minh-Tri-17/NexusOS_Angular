import { inject, Injectable, signal } from '@angular/core';
import { MailModel } from '../../../core/models/mail.model';
import { AuthApiService } from './auth-api.service';
import { AuthModel } from './auth.model';

export type ActiveFormType = 'login' | 'otp' | 'reset';

@Injectable({
  providedIn: 'root',
})
export class AuthFacade {
  private readonly api = inject(AuthApiService);

  //#region //@ STATE

  readonly activeForm = signal<ActiveFormType>('login');

  //#endregion

  //#region //@ METHODS

  login(data: AuthModel) {
    return this.api.login(data);
  }

  sendOtp(data: MailModel) {
    return this.api.sendOTP(data);
  }

  reset(data: AuthModel) {
    return this.api.resetPass(data);
  }

  //#endregion
}
