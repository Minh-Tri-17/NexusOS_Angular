import { Component, inject } from '@angular/core';
import { ThemeService } from '../../../core/services/theme.service';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgbCollapse } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, NgbCollapse],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  protected readonly themeService = inject(ThemeService);
  isCollapsed = false;
}
