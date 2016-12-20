angular.module('app').component('ltLanguageSelector', {
  templateUrl: 'app/components/ltLanguageSelector/ltLanguageSelector.html',
  controller: function(gettextCatalog) {
    var vm = this;
    vm.languages = {
      en: 'English',
      de: 'German'
    };
    Object.defineProperty(vm, 'language', {
      get: function() {
        return gettextCatalog.getCurrentLanguage();
      },
      set: function(lang) {
        gettextCatalog.setCurrentLanguage(lang);
      }
    });
  }
});
