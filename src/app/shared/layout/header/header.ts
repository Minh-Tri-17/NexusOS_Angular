import { isPlatformBrowser } from '@angular/common';
import { Component, inject, NgZone, PLATFORM_ID, signal } from '@angular/core';
import { Router } from '@angular/router';
import { auditTime, fromEvent, Subscription } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  private router = inject(Router);
  private readonly ngZone = inject(NgZone);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private scrollSub?: Subscription;

  protected themeService = inject(ThemeService);
  protected authService = inject(AuthService);
  readonly isScrolled = signal(false);

  ngOnInit() {
    if (!this.isBrowser) return;

    this.ngZone.runOutsideAngular(() => {
      this.scrollSub = fromEvent(window, 'scroll', { passive: true })
        .pipe(auditTime(20))
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

  ngOnDestroy() {
    this.scrollSub?.unsubscribe();
  }

  //#region //@ METHODS

  handleToggleTheme() {
    this.themeService.toggleTheme();
  }

  handleToggleCollapsed() {
    this.themeService.toggleCollapsed();
  }

  handleLogout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  //#endregion
}
