import { Component } from '@angular/core';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { LoginForm } from './ui/login-form/login-form';

@Component({
  selector: 'app-auth',
  imports: [LoginForm, NgbDropdownModule],
  templateUrl: './auth.html',
  styleUrl: './auth.scss',
})
export class Auth {}
