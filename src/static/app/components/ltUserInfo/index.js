import template from './ltUserInfo.html';

export default {
  template,
  controller: function(ltDataAuth) {
    var vm = this;
    ltDataAuth.getUserInfo().then(function(user) {
      vm.user = user;
    });
  }
};
