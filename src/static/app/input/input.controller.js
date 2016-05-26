angular.module('app').controller('InputController', function(ltData, $state) {
  var vm = this;
  vm.titles = '';
  vm.getCategoriesForPrefix = function() {
    ltData.getCategoriesForPrefix(vm.category).then(function(categories) {
      vm.categorySuggestions = categories;
    });
  };
  vm.getFilesForUser = function() {
    ltData.getFilesForUser(vm.user).then(setTitles);
  };
  vm.getFilesForCategory = function() {
    ltData.getFilesForCategory(vm.category).then(setTitles);
  };
  vm.next = function() {
    $state.go('list', {titles: vm.titleList.join('|')});
  };

  Object.defineProperty(vm, 'titleList', {
    get: function() {
      return vm.titles.split('\n').map(function(file) {
        return file && file.split('|')[0];
      }).filter(angular.identity);
    },
    set: function(files) {
      vm.titles = files && files.join('\n');
    },
    enumerable: true,
    configurable: true
  });
  function setTitles(files) {
    vm.titleList = files;
  }
});
