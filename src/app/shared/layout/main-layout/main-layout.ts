import { Component, inject } from '@angular/core';
import { Sidebar } from '../sidebar/sidebar';
import { Header } from '../header/header';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-main-layout',
  imports: [Sidebar, Header],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayout {
  protected themeService = inject(ThemeService);
}
