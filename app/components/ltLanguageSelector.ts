import template from './ltLanguageSelector.html';

import i18n from '../i18n.json';

const languageCodes = [
  'bn',
  'cs',
  'de',
  'en',
  'es',
  'fa_IR',
  'fr',
  'it',
  'mk',
  'ml',
  'pt',
  'ru',
  'uk',
  'zh_TW'
];

class ltLanguageSelector implements ng.IComponentController {
  languages: Record<string, string>;
  public static $inject = ['$window', 'localStorageService', 'gettextCatalog'];
  constructor(
    private $window: ng.IWindowService,
    private localStorageService: angular.local.storage.ILocalStorageService,
    private gettextCatalog: gettextCatalog
  ) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    languageCodes.forEach(lang => this.gettextCatalog.setStrings(lang, (i18n as any)[lang]));
    this.languages = languageCodes.reduce((obj, lang) => {
      obj[lang] = this.getDisplayString(lang);
      return obj;
    }, {} as Record<string, string>);
  }

  $onInit() {
    const language: string = this.localStorageService.get('language');
    if (language) {
      this.gettextCatalog.setCurrentLanguage(language);
    } else if (this.$window.navigator?.languages) {
      const langs = this.$window.navigator.languages.filter(lang => this.languages[lang]);
      if (langs.length) {
        this.gettextCatalog.setCurrentLanguage(langs[0]);
      }
    }
  }

  get language(): string {
    return this.gettextCatalog.getCurrentLanguage();
  }

  set language(lang: string) {
    this.localStorageService.set('language', lang);
    this.gettextCatalog.setCurrentLanguage(lang);
  }

  private getDisplayString(language: string): string {
    if (language === 'en') {
      return 'English';
    }
    const key = 'LANGUAGE';
    return this.gettextCatalog.getStringFormFor(language, key, 1) || language;
  }
}

export default {
  template,
  controller: ltLanguageSelector
} as ng.IComponentOptions;
