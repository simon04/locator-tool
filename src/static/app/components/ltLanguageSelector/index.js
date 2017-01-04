import template from './ltLanguageSelector.html';

import 'angular-gettext-loader!../../../po/de.po';
import 'angular-gettext-loader!../../../po/fr.po';

export default {
  template,
  controller: ltLanguageSelector
};

ltLanguageSelector.$inject = ['$window', 'localStorageService', 'gettext', 'gettextCatalog'];
function ltLanguageSelector($window, localStorageService, gettext, gettextCatalog) {
  const vm = this;
  init();

  Object.defineProperty(vm, 'language', {
    get: function() {
      return gettextCatalog.getCurrentLanguage();
    },
    set: function(lang) {
      localStorageService.set('language', lang);
      gettextCatalog.setCurrentLanguage(lang);
    }
  });

  function init() {
    vm.languages = {
      de: getDisplayString('de'),
      en: 'English',
      fr: getDisplayString('fr')
    };
    const language = localStorageService.get('language');
    if (language) {
      gettextCatalog.setCurrentLanguage(language);
    } else if ($window.navigator && $window.navigator.languages) {
      const langs = $window.navigator.languages.filter(function(lang) {
        return vm.languages[lang];
      });
      if (langs.length) {
        gettextCatalog.setCurrentLanguage(langs[0]);
      }
    }
  }

  function getDisplayString(language) {
    /* eslint spaced-comment: 0 */
    /// Your language in your language (e.g. 'English', 'Deutsch')
    const key = gettext('LANGUAGE');
    return gettextCatalog.getStringFormFor(language, key, 1) || language;
  }
}
