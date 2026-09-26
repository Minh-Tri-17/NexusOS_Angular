import { Component, inject, signal } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { AuthFacade } from '../../data-access/auth.facade';
import { AuthModel } from '../../data-access/auth.model';
import { ForgotPasswordModal } from '../forgot-password-modal/forgot-password-modal';

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
export type LoginTab = 'email' | 'empId';

@Component({
  selector: 'app-login-form',
  imports: [ReactiveFormsModule],
  templateUrl: './login-form.html',
  styleUrl: './login-form.scss',
})
export class LoginForm {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly facade = inject(AuthFacade);
  private readonly authService = inject(AuthService);
  private readonly modal = inject(NgbModal);

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
  readonly loginTabs: readonly LoginTab[] = ['email', 'empId'] as const;

  //#region //@ STATE

  readonly loginForm = new FormGroup({
    username: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    remember: new FormControl(false),
  });

  readonly currentTab = signal<LoginTab>('email');
  readonly currentFill = signal<DemoRole | null>(null);
  readonly isSigning = signal(false);
  readonly isVisibility = signal(false);

  //#endregion

  //#region //@ METHODS

  async handleLogin() {
    if (this.loginForm.invalid) return;
    this.isSigning.set(true);

    //* getRawValue() lấy toàn bộ giá trị của form, kể cả ô bị disabled
    const rawValues: AuthModel = this.loginForm.getRawValue();

    try {
      const res = await this.facade.login(rawValues);

      if (res?.result) {
        this.authService.setToken(res?.result || '');
        if (this.authService.isLoggedIn()) {
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
          await this.router.navigateByUrl(returnUrl);
        }
      }
    } catch {
    } finally {
      this.isSigning.set(false);
    }
  }

  private updateFormAccount(): void {
    const currentRole = this.currentFill();
    if (!currentRole) return;

    const acc = DEMO_ACCOUNTS[currentRole];
    if (!acc) return;

    const identifier = this.currentTab() === 'email' ? acc.email : acc.username;

    this.loginForm.patchValue({
      username: identifier,
      password: acc.pwd,
    });
  }

  handleFillAccount(role: DemoRole): void {
    this.currentFill.set(role);
    this.updateFormAccount();
  }

  handleToggleTab(tab: LoginTab): void {
    this.currentTab.set(tab);
    this.updateFormAccount();
  }

  handleTogglePwdVisibility() {
    this.isVisibility.update((visible) => !visible);
  }

  openForgotPasswordModal() {
    this.modal.open(ForgotPasswordModal, {
      centered: true,
      windowClass: 'auth-modal',
    });
  }

  //#endregion
}
