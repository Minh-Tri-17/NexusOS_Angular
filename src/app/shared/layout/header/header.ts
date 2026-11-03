import { isPlatformBrowser } from '@angular/common';
import {
  Component,
  computed,
  DestroyRef,
  inject,
  NgZone,
  OnInit,
  PLATFORM_ID,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslatePipe } from '@ngx-translate/core';
import { auditTime, fromEvent } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { RoleFacade } from '../../../features/system/roles/data-access/role.facade';
import { Languages } from '../../components/languages/languages';

@Component({
  selector: 'app-header',
  imports: [NgbDropdownModule, Languages, TranslatePipe],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  encapsulation: ViewEncapsulation.None,
})
export class Header implements OnInit {
  private readonly router = inject(Router);
  private readonly ngZone = inject(NgZone);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly roleFacade = inject(RoleFacade);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  protected readonly themeService = inject(ThemeService);
  protected readonly authService = inject(AuthService);

  //#region //@ STATE

  readonly isScrolled = signal(false);
  readonly topbarSearchText = signal('');
  readonly currentUser = this.authService.currentUser;
  readonly userInitials = computed(() => {
    const user = this.currentUser();
    if (!user) return 'U';
    const name = user.fullName || user.username || 'User';
    const words = name.trim().split(/\s+/);
    if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  });

  //* computed() dùng để tính toán giá trị dựa trên state khác
  readonly displayName = computed(() => {
    const user = this.currentUser();
    return user?.fullName || user?.username || 'User';
  });
  readonly displayRole = computed(() => {
    const user = this.currentUser();
    return user?.roleName || 'Member';
  });

  //#endregion

  handleClearTopbarSearch(input: HTMLInputElement) {
    input.value = '';
    this.topbarSearchText.set('');
  }

  ngOnInit() {
    this.loadUserRole();

    if (!this.isBrowser) return;

    this.ngZone.runOutsideAngular(() => {
      fromEvent(window, 'scroll', { passive: true })
        .pipe(
          //* auditTime() giới hạn số lượng giá trị tối đa được phát ra trong một khoảng thời gian nhất định, giúp giảm số lần xử lý
          auditTime(20),
          //* takeUntilDestroyed() tự động hủy đăng ký (unsubscribe) luồng Observable khi component bị hủy (destroy), tránh rò rỉ bộ nhớ (memory leak)
          takeUntilDestroyed(this.destroyRef),
        )
        //* subscribe() đăng ký nhận giá trị từ Observable, thực hiện hành động khi có giá trị mới
        .subscribe(() => {
          const scrolled = window.scrollY > 10;
          if (this.isScrolled() !== scrolled) {
            this.ngZone.run(() => {
              this.isScrolled.set(scrolled);
            });
          }
        });
    });

    if (window.scrollY > 10) this.isScrolled.set(true);
  }

  //#region //@ METHODS

  private async loadUserRole() {
    const roleId = this.currentUser()?.roleId;
    if (!roleId) return;

    try {
      const res = await this.roleFacade.getById(roleId);
      if (res?.result?.roleName) {
        this.authService.setRoleName(res.result.roleName);
      }
    } catch {}
  }

  handleToggleTheme() {
    this.themeService.toggleTheme();
  }

  handleToggleCollapsed() {
    this.themeService.toggleCollapsed();
  }

  async handleLogout() {
    this.authService.logout();

    await this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
  }

  //#endregion
}
