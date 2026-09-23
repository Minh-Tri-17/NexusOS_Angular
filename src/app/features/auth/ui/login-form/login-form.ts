import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { AuthFacade } from '../../data-access/auth.facade';
import { AuthModel } from '../../data-access/auth.model';

const DEMO_ACCOUNTS = {
  director: {
    email: 'director.manager@nexusost.com',
    username: 'director100',
    pwd: 'Director2026!#',
  },
  hr: {
    email: 'hr.manager@nexusost.com',
    username: 'hr200',
    pwd: 'HRManager2026!#',
  },
  employee: {
    email: 'emp.john@nexusost.com',
    username: 'emp300',
    pwd: 'Employee2026!#',
  },
} as const;

export type DemoRole = keyof typeof DEMO_ACCOUNTS;

@Component({
  selector: 'app-login-form',
  imports: [ReactiveFormsModule],
  templateUrl: './login-form.html',
  styleUrl: './login-form.scss',
})
export class LoginForm {
  private router = inject(Router);
  private facade = inject(AuthFacade);
  private authService = inject(AuthService);

  readonly demoRoles = [
    {
      key: 'director',
      label: 'Director',
      icon: 'fa-solid fa-user-tie text-primary',
      pillClass: 'demo-pill-director',
    },
    {
      key: 'hr',
      label: 'HR Manager',
      icon: 'fa-solid fa-user-gear text-success',
      pillClass: 'demo-pill-hr',
    },
    {
      key: 'employee',
      label: 'Employee',
      icon: 'fa-solid fa-user text-info',
      pillClass: 'demo-pill-employee',
    },
  ] as const;

  //#region //@ STATE

  loginForm = new FormGroup({
    username: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    remember: new FormControl<boolean>(false),
  });

  currentTab = signal('email');
  currentFill = signal<DemoRole | null>(null);
  isSigning = signal(false);
  isVisibility = signal(false);

  //#endregion

  //#region //@ METHODS

  async handleLogin() {
    if (this.loginForm.invalid) return;
    this.isSigning.set(true);

    //* getRawValue() lấy toàn bộ giá trị của form, kể cả ô bị disabled
    //* as ép kiểu sang model tương ứng
    const rawValues = this.loginForm.getRawValue() as AuthModel;

    try {
      const res = await this.facade.login(rawValues);
      this.authService.setToken(res?.result || '');

      if (this.authService.isLoggedIn()) this.router.navigate(['/']);
    } catch (error) {
    } finally {
      this.isSigning.set(false);
    }
  }

  handleFillAccount(role: DemoRole) {
    const acc = DEMO_ACCOUNTS[role];
    if (!acc) return;

    this.currentFill.set(role);

    const identifier = this.currentTab() === 'email' ? acc.email : acc.username;

    this.loginForm.patchValue({
      username: identifier,
      password: acc.pwd,
    });
  }

  handleToggleTab(tab: string) {
    this.currentTab.set(tab);
  }

  handleTogglePwdVisibility() {
    this.isVisibility.update((visible) => !visible);
  }

  //#endregion
}
