import { Component, inject, signal } from '@angular/core';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';

interface LanguageOption {
  code: string;
  label: string;
  flag: string;
}

@Component({
  selector: 'app-languages',
  imports: [NgbDropdownModule],
  templateUrl: './languages.html',
  styleUrl: './languages.scss',
})
export class Languages {
  private readonly translate = inject(TranslateService);

  readonly languages: LanguageOption[] = [
    { code: 'vi', label: 'Tiếng Việt', flag: 'flag-vn.png' },
    { code: 'en', label: 'English', flag: 'flag-us.png' },
    { code: 'ja', label: '日本語', flag: 'flag-jp.png' },
    { code: 'zh', label: '中文', flag: 'flag-cn.png' },
    { code: 'fr', label: 'Français', flag: 'flag-fr.png' },
  ];

  readonly currentLang = signal<LanguageOption>(this.languages[0]);

  constructor() {
    this.translate.setFallbackLang(this.currentLang().code);

    const savedCode = localStorage.getItem('app_language') || 'vi';
    const found = this.languages.find((l) => l.code === savedCode) ?? this.languages[0];

    this.currentLang.set(found);
    this.translate.use(found.code);
  }

  handleChangeLanguage(lang: LanguageOption) {
    this.currentLang.set(lang);
    this.translate.use(lang.code);

    localStorage.setItem('app_language', lang.code);
  }
}
