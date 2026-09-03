import { computed, DOCUMENT, effect, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { BASE_CONSTANTS } from '../constants/base.constant';
import { isPlatformBrowser } from '@angular/common';

export type Theme = typeof BASE_CONSTANTS.lightTheme | typeof BASE_CONSTANTS.darkTheme;

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly currentTheme = signal<Theme>(this.getInitialTheme());
  readonly isCollapsed = signal<boolean>(this.getInitialCollapsed());
  readonly isMobileOpen = signal<boolean>(false);

  readonly isDark = computed(() => this.currentTheme() === BASE_CONSTANTS.darkTheme);

  //#region Helpers

  private getInitialTheme(): Theme {
    if (this.isBrowser) {
      const savedTheme = localStorage.getItem(BASE_CONSTANTS.themeStorageKey) as Theme;
      return savedTheme || BASE_CONSTANTS.lightTheme;
    }
    return BASE_CONSTANTS.lightTheme;
  }

  private getInitialCollapsed(): boolean {
    if (this.isBrowser) {
      return localStorage.getItem(BASE_CONSTANTS.collapsedStorageKey) === 'true';
    }
    return false;
  }

  //#endregion

  constructor() {
    effect(() => {
      if (this.isBrowser) {
        const theme = this.currentTheme();
        const root = this.document.documentElement;

        if (theme === BASE_CONSTANTS.darkTheme)
          root.setAttribute('data-theme', BASE_CONSTANTS.darkTheme);
        else root.removeAttribute('data-theme');

        localStorage.setItem(BASE_CONSTANTS.themeStorageKey, theme);
      }
    });

    effect(() => {
      if (this.isBrowser) {
        const collapsed = this.isCollapsed();
        const root = this.document.documentElement;

        if (collapsed) {
          root.classList.add('sidebar-collapsed');
        } else {
          root.classList.remove('sidebar-collapsed');
        }

        localStorage.setItem(BASE_CONSTANTS.collapsedStorageKey, collapsed.toString());
      }
    });
  }

  toggleTheme() {
    this.currentTheme.update((theme) =>
      theme === BASE_CONSTANTS.lightTheme ? BASE_CONSTANTS.darkTheme : BASE_CONSTANTS.lightTheme,
    );
  }

  toggleCollapsed() {
    if (window.innerWidth < 992) {
      this.isMobileOpen.update((open) => !open);
    } else {
      this.isCollapsed.update((collapsed) => !collapsed);
    }
  }

  closeMobileSidebar(): void {
    this.isMobileOpen.set(false);
  }
}
