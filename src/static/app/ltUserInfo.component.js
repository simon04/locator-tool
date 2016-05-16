angular.module('app').component('ltUserInfo', {
  template: [
    '<a href="/locator-tool/login" ng-hide="$ctrl.user" class="btn btn-default navbar-btn">Sign in</a>',
    '<p ng-show="$ctrl.user" class="navbar-text">Signed in as {{$ctrl.user}}</p>',
    '<a href="/locator-tool/logout" ng-show="$ctrl.user" class="btn btn-default navbar-btn">Sign out</a>'
  ].join(''),
  controller: function(ltDataAuth) {
    var vm = this;
    ltDataAuth.getUserInfo().then(function(user) {
      vm.user = user;
    });
  }
});
