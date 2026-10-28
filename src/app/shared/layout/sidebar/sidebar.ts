import { Component, DestroyRef, inject, signal, ViewEncapsulation } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { NgbCollapse } from '@ng-bootstrap/ng-bootstrap';
import { TranslatePipe } from '@ngx-translate/core';
import { filter } from 'rxjs';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, NgbCollapse, TranslatePipe],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
  encapsulation: ViewEncapsulation.None,
})
export class Sidebar {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly themeService = inject(ThemeService);

  readonly openSubmenu = signal<string | null>(null);

  private readonly submenuRoutes: Record<string, string[]> = {
    categories: ['/country', '/province', '/ward'],
    settings: ['/user', '/role'],
  };

  constructor() {
    this.checkAndOpenSubmenu(this.router.url);

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        //* takeUntilDestroyed() tự động hủy đăng ký (unsubscribe) luồng Observable khi component bị hủy (destroy), tránh rò rỉ bộ nhớ (memory leak)
        takeUntilDestroyed(this.destroyRef),
      )
      //* subscribe() đăng ký nhận giá trị từ Observable, thực hiện hành động khi có giá trị mới
      .subscribe((event) => {
        this.checkAndOpenSubmenu(event.urlAfterRedirects || event.url);
      });
  }

  toggleSubmenu(menu: string) {
    this.openSubmenu.update((curr) => (curr === menu ? null : menu));
  }

  private checkAndOpenSubmenu(url: string) {
    const currentPath = url.split('?')[0].split('#')[0];

    for (const [menu, routes] of Object.entries(this.submenuRoutes)) {
      if (routes.some((route) => currentPath === route || currentPath.startsWith(`${route}/`))) {
        this.openSubmenu.set(menu);
        return;
      }
    }
  }
}
