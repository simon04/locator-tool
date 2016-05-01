angular.module('app', ['ui.router']);

angular.module('app').config(function($stateProvider, $urlRouterProvider) {

  $stateProvider.state('input',{
    url: '/input',
    templateUrl: 'partials/input.html',
    controllerAs: '$ctrl',
    controller: function(ltData) {
      var vm = this;
      vm.getFilesForCategory = function() {
        ltData.getFilesForCategory(vm.category).then(function(files) {
          vm.titles = files && files.join('\n');
        });
      }
    }
  });

  });
});

angular.module('app').factory('ltData', function($http) {
  return {
    getUserInfo: function() {
      return $http.get('/locator-tool/user').then(function(d) {
        return d.data && d.data.user;
      });
    },
    getFilesForCategory: function(cat) {
      return $http.get('/cats-php/', {params: {lang: 'commons', type: 6, cat: cat}}).then(function(d) {
        return d.data;
      });
    }
  };
});

angular.module('app').component('ltUserInfo', {
  template: [
    '<a ng-hide="$ctrl.user" class="btn btn-default navbar-btn">Sign in</a>',
    '<p ng-show="$ctrl.user" class="navbar-text">Signed in as {{$ctrl.user}}</p>'].join(''),
  controller: function(ltData) {
    var vm = this;
    ltData.getUserInfo().then(function(user) {
      vm.user = user;
    });
  }
});
