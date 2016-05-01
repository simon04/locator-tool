angular.module('app', ['ui.router']);

angular.module('app').controller('Ctrl', function($scope, $http) {
  $http.get('/locator-tool/query', {params: {
    prop: 'coordinates',
    titles: 'File:Axams Theaterbrunnen.jpg'
  }}).then(function(d) {
    $scope.y = d.data;
  });
});

angular.module('app').factory('ltUserData', function($http) {
  return {
    getUserInfo: function() {
      return $http.get('/locator-tool/user').then(function(d) {
        return d.data && d.data.user;
      });
    }
  };
});

angular.module('app').component('ltUserInfo', {
  template: [
    '<a ng-hide="$ctrl.user" class="btn btn-default navbar-btn">Sign in</a>',
    '<p ng-show="$ctrl.user" class="navbar-text">Signed in as {{$ctrl.user}}</p>'].join(''),
  controller: function(ltUserData) {
    var vm = this;
    ltUserData.getUserInfo().then(function(user) {
      vm.user = user;
    });
  }
});
