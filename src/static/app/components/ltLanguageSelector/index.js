import template from './ltLanguageSelector.pug';

import 'angular-gettext-loader!@/po/bn.po';
import 'angular-gettext-loader!@/po/cs.po';
import 'angular-gettext-loader!@/po/de.po';
import 'angular-gettext-loader!@/po/es.po';
import 'angular-gettext-loader!@/po/fr.po';
import 'angular-gettext-loader!@/po/ml.po';
import 'angular-gettext-loader!@/po/pt.po';
import 'angular-gettext-loader!@/po/ru.po';
import 'angular-gettext-loader!@/po/zh_TW.po';

const languages = ['bn', 'cs', 'de', 'en', 'es', 'fr', 'ml', 'pt', 'ru', 'zh_TW'];

class ltLanguageSelector {
  constructor($window, localStorageService, gettext, gettextCatalog) {
    Object.assign(this, {$window, localStorageService, gettext, gettextCatalog});
    this.languages = languages.reduce((obj, lang) => {
      obj[lang] = this.getDisplayString(lang);
      return obj;
    }, {});
    const language = localStorageService.get('language');
    if (language) {
      gettextCatalog.setCurrentLanguage(language);
    } else if ($window.navigator && $window.navigator.languages) {
      const langs = $window.navigator.languages.filter(lang => this.languages[lang]);
      if (langs.length) {
        gettextCatalog.setCurrentLanguage(langs[0]);
      }
    }
  }

  get language() {
    return this.gettextCatalog.getCurrentLanguage();
  }

  set language(lang) {
    this.localStorageService.set('language', lang);
    this.gettextCatalog.setCurrentLanguage(lang);
  }

  getDisplayString(language) {
    if (language === 'en') {
      return 'English';
    }
    const key = 'LANGUAGE';
    return this.gettextCatalog.getStringFormFor(language, key, 1) || language;
  }
}
ltLanguageSelector.$inject = ['$window', 'localStorageService', 'gettext', 'gettextCatalog'];

export default {
  template,
  controller: ltLanguageSelector
};
