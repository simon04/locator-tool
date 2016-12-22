angular.module('app').component('ltLanguageSelector', {
  templateUrl: 'app/components/ltLanguageSelector/ltLanguageSelector.html',
  controller: function($window, localStorageService, gettextCatalog) {
    var vm = this;
    vm.languages = {
      en: 'English',
      de: 'German'
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
});
