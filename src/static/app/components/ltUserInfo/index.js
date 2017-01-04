import template from './ltUserInfo.html';

export default {
  template,
  controller: ['ltDataAuth', function(ltDataAuth) {
    const vm = this;
    ltDataAuth.getUserInfo().then(function(user) {
      vm.user = user;
    });
  }]
};
