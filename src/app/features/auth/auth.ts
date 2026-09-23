import { Component } from '@angular/core';
import { ForgotPasswordModal } from './ui/forgot-password-modal/forgot-password-modal';
import { LoginForm } from './ui/login-form/login-form';

@Component({
  selector: 'app-auth',
  imports: [ForgotPasswordModal, LoginForm],
  templateUrl: './auth.html',
  styleUrl: './auth.scss',
})
export class Auth {}
