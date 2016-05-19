angular.module('app').component('ltUserInfo', {
  /* eslint max-len: 0 */
  templateUrl: 'app/components/ltUserInfo/ltUserInfo.html',
  controller: function(ltDataAuth) {
    var vm = this;
    ltDataAuth.getUserInfo().then(function(user) {
      vm.user = user;
    });
  }
});
