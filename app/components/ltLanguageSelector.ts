import template from './ltLanguageSelector.html';

import '../../po/bn.po';
import '../../po/cs.po';
import '../../po/de.po';
import '../../po/es.po';
import '../../po/fa_IR.po';
import '../../po/fr.po';
import '../../po/it.po';
import '../../po/mk.po';
import '../../po/ml.po';
import '../../po/pt.po';
import '../../po/ru.po';
import '../../po/uk.po';
import '../../po/zh_TW.po';

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
  public static $inject = ['$window', 'localStorageService', 'gettext', 'gettextCatalog'];
  constructor(
    private $window: ng.IWindowService,
    private localStorageService: angular.local.storage.ILocalStorageService,
    private gettext: ng.gettext.gettextFunction,
    private gettextCatalog: ng.gettext.gettextCatalog
  ) {
    this.languages = languageCodes.reduce((obj, lang) => {
      obj[lang] = this.getDisplayString(lang);
      return obj;
    }, {});
  }

  $onInit() {
    const language: string = this.localStorageService.get('language');
    if (language) {
      this.gettextCatalog.setCurrentLanguage(language);
    } else if (this.$window.navigator && this.$window.navigator.languages) {
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
