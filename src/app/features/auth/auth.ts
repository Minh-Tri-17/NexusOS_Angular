import { Component, inject } from '@angular/core';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { ThemeService } from '../../core/services/theme.service';
import { LoginForm } from './ui/login-form/login-form';

@Component({
  selector: 'app-auth',
  imports: [LoginForm, NgbDropdownModule],
  templateUrl: './auth.html',
  styleUrl: './auth.scss',
})
export class Auth {
  protected readonly themeService = inject(ThemeService);

  //#region //@ METHODS

  handleToggleTheme() {
    this.themeService.toggleTheme();
  }

  //#endregion
}
