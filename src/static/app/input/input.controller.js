angular.module('app').controller('InputController', function(ltData, $state) {
  var vm = this;
  vm.getFilesForCategory = function() {
    ltData.getFilesForCategory(vm.category).then(function(files) {
      vm.titles = files && files.join('\n');
    });
  };
  vm.next = function() {
    $state.go('list', {titles: vm.titles.split('\n').join('|')});
  };
});
