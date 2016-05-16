angular.module('app').component('ltUserInfo', {
  /* eslint max-len: 0 */
  template: [
    '<a href="/locator-tool/login?next=index.html" ng-hide="$ctrl.user" class="btn btn-default navbar-btn">Sign in</a>',
    '<p ng-show="$ctrl.user" class="navbar-text">Signed in as {{$ctrl.user}}</p>',
    '<a href="/locator-tool/logout?next=index.html" ng-show="$ctrl.user" class="btn btn-default navbar-btn">Sign out</a>'
  ].join(''),
  controller: function(ltDataAuth) {
    var vm = this;
    ltDataAuth.getUserInfo().then(function(user) {
      vm.user = user;
    });
  }
});
