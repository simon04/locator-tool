import template from './ltFilesSelector.html';

export default {
  template,
  controller: ltFilesSelector
};

ltFilesSelector.$inject = ['ltData', '$state'];
function ltFilesSelector(ltData, $state) {
  const vm = this;
  vm.titles = '';
  vm.getCategoriesForPrefix = function() {
    ltData.getCategoriesForPrefix(vm.category).then(function(categories) {
      vm.categorySuggestions = categories;
    });
  };
  vm.getFilesForUser = function() {
    vm.getFilesForUser$q = ltData.getFilesForUser(vm.user).then(setTitles);
  };
  vm.getFilesForCategory = function() {
    vm.getFilesForCategory$q = ltData.getFilesForCategory(vm.category).then(setTitles);
  };
  vm.next = function() {
    $state.go('list', {titles: vm.titleList.join('|')});
  };

  Object.defineProperty(vm, 'titleList', {
    get: function() {
      return vm.titles.split('\n').map(function(file) {
        return file && file.split('|')[0];
      }).filter(x => x);
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
}
