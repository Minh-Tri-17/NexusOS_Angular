import { Injectable } from '@angular/core';
import { API_CONSTANTS } from '../../../core/constants/api.constants';
import { Result } from '../../../core/models/common.model';
import { MailModel } from '../../../core/models/mail.model';
import { BaseApiService } from '../../../core/services/base-api.service';
import { AuthModel } from './auth.model';
import { OTPModel } from './otp.model';

@Injectable({
  providedIn: 'root',
})
export class AuthApiService extends BaseApiService {
  //#region //@ METHODS

  login(data: AuthModel) {
    return this.postHttp<Result<string>>(API_CONSTANTS.account.login, data);
  }

  sendOTP(data: MailModel) {
    return this.postHttp<Result<boolean>>(API_CONSTANTS.account.sendOTP, data);
  }

  resetPass(data: AuthModel) {
    return this.patchHttp<Result<boolean>>(API_CONSTANTS.account.resetPass, data);
  }

  validateOtp(data: OTPModel) {
    return this.postHttp<Result<boolean>>(API_CONSTANTS.account.validateOtp, data);
  }
  //#endregion
}
