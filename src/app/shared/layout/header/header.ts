import { Component, inject, NgZone, PLATFORM_ID, signal } from '@angular/core';
import { ThemeService } from '../../../core/services/theme.service';
import { isPlatformBrowser } from '@angular/common';
import { auditTime, fromEvent, Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  protected themeService = inject(ThemeService);
  private readonly ngZone = inject(NgZone);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private scrollSub?: Subscription;

  readonly isScrolled = signal<boolean>(false);

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

  //#endregion
}
