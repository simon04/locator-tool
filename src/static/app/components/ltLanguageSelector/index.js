import template from './ltLanguageSelector.html';

import 'angular-gettext-loader!../../../po/de.po';
import 'angular-gettext-loader!../../../po/fr.po';

class ltLanguageSelector {
  constructor($window, localStorageService, gettext, gettextCatalog) {
    Object.assign(this, {$window, localStorageService, gettext, gettextCatalog});
    this.languages = {
      de: this.getDisplayString('de'),
      en: 'English',
      fr: this.getDisplayString('fr')
    };
    const language = localStorageService.get('language');
    if (language) {
      gettextCatalog.setCurrentLanguage(language);
    } else if ($window.navigator && $window.navigator.languages) {
      const langs = $window.navigator.languages.filter((lang) => this.languages[lang]);
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
    /* eslint spaced-comment: 0 */
    /// Your language in your language (e.g. 'English', 'Deutsch')
    const key = this.gettext('LANGUAGE');
    return this.gettextCatalog.getStringFormFor(language, key, 1) || language;
  }
}
ltLanguageSelector.$inject = ['$window', 'localStorageService', 'gettext', 'gettextCatalog'];

export default {
  template,
  controller: ltLanguageSelector
};
