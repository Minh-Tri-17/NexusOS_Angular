import { isPlatformBrowser } from '@angular/common';
import { Component, DestroyRef, inject, NgZone, PLATFORM_ID, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { auditTime, fromEvent } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-header',
  imports: [NgbDropdownModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  private readonly router = inject(Router);
  private readonly ngZone = inject(NgZone);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  protected readonly themeService = inject(ThemeService);
  protected readonly authService = inject(AuthService);
  readonly isScrolled = signal(false);

  ngOnInit() {
    if (!this.isBrowser) return;

    this.ngZone.runOutsideAngular(() => {
      fromEvent(window, 'scroll', { passive: true })
        .pipe(auditTime(20), takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          const scrolled = window.scrollY > 10;
          if (this.isScrolled() !== scrolled) {
            this.ngZone.run(() => {
              this.isScrolled.set(scrolled);
            });
          }
        });
    });

    if (window.scrollY > 10) {
      this.isScrolled.set(true);
    }
  }

  //#region //@ METHODS

  handleToggleTheme() {
    this.themeService.toggleTheme();
  }

  handleToggleCollapsed() {
    this.themeService.toggleCollapsed();
  }

  async handleLogout() {
    const currentUrl = this.router.url;
    this.authService.logout();

    await this.router.navigate(['/login'], {
      queryParams: { returnUrl: currentUrl },
    });
  }

  //#endregion
}
