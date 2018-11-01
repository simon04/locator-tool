import template from './ltUserInfo.pug';

class ltUserInfo {
  constructor(ltDataAuth) {
    ltDataAuth.getUserInfo().then(user => {
      this.user = user;
    });
  }
}
ltUserInfo.$inject = ['ltDataAuth'];

export default {
  template,
  controller: ltUserInfo
};
