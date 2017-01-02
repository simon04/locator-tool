import template from './ltLanguageSelector.html';

import deStrings from 'json-loader!angular-gettext-loader?format=json!../../../po/de.po';
import frStrings from 'json-loader!angular-gettext-loader?format=json!../../../po/fr.po';

export default {
  template,
  controller: ltLanguageSelector
};

ltLanguageSelector.$inject = ['$window', 'localStorageService', 'gettextCatalog'];
function ltLanguageSelector($window, localStorageService, gettextCatalog) {
  var vm = this;
  vm.languages = {
    de: 'Deutsch',
    en: 'English',
    fr: 'Français'
  };
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
}
