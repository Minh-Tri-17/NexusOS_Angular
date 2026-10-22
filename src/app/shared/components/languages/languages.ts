import { Component, inject, signal, ViewEncapsulation } from '@angular/core';
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
  encapsulation: ViewEncapsulation.None,
})
export class Languages {
  private readonly translate = inject(TranslateService);

  //#region //@ PROPS

  readonly languages: LanguageOption[] = [
    { code: 'en', label: 'English', flag: 'flag-us.png' },
    { code: 'vi', label: 'Tiếng Việt', flag: 'flag-vn.png' },
    { code: 'ja', label: '日本語', flag: 'flag-jp.png' },
    { code: 'zh', label: '中文', flag: 'flag-cn.png' },
    { code: 'fr', label: 'Français', flag: 'flag-fr.png' },
  ];

  //#endregion

  //#region //@ STATE

  readonly currentLang = signal<LanguageOption>(this.languages[0]);

  //#endregion

  constructor() {
    this.translate.setFallbackLang(this.currentLang().code);

    const savedCode = localStorage.getItem('app_language') || 'en';
    const found = this.languages.find((l) => l.code === savedCode) ?? this.languages[0];

    this.currentLang.set(found);
    this.translate.use(found.code);
  }

  //#region //@ METHODS

  handleChangeLanguage(lang: LanguageOption) {
    this.currentLang.set(lang);
    this.translate.use(lang.code);

    localStorage.setItem('app_language', lang.code);
  }

  //#endregion
}
