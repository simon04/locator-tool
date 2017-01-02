import template from './ltLanguageSelector.html';

import deStrings from 'json-loader!angular-gettext-loader?format=json!../../../po/de.po';
import frStrings from 'json-loader!angular-gettext-loader?format=json!../../../po/fr.po';

export default {
  template,
  controller: ltLanguageSelector
};

ltLanguageSelector.$inject = ['$window', 'localStorageService', 'gettext', 'gettextCatalog'];
function ltLanguageSelector($window, localStorageService, gettext, gettextCatalog) {
  var vm = this;
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
    gettextCatalog.setStrings('de', deStrings.de);
    gettextCatalog.setStrings('fr', frStrings.fr);
    vm.languages = {
      de: getDisplayString('de'),
      en: 'English',
      fr: getDisplayString('fr')
    };
    var language = localStorageService.get('language');
    if (language) {
      gettextCatalog.setCurrentLanguage(language);
    } else if ($window.navigator && $window.navigator.languages) {
      var langs = $window.navigator.languages.filter(function(lang) {
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
    var key = gettext('LANGUAGE');
    return gettextCatalog.getStringFormFor(language, key, 1) || language;
  }
}
