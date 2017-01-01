import template from './ltUserInfo.html';

export default {
  template,
  controller: ['ltDataAuth', function(ltDataAuth) {
    var vm = this;
    ltDataAuth.getUserInfo().then(function(user) {
      vm.user = user;
    });
  }]
};
