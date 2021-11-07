import template from './ltUserInfo.html';
import LtDataAuth from '../api/ltDataAuth';

class LtUserInfoController implements ng.IComponentController {
  user: string | undefined;

  public static $inject = ['ltDataAuth'];
  constructor(private ltDataAuth: LtDataAuth) {}

  $onInit() {
    this.ltDataAuth.getUserInfo().then(user => {
      this.user = user;
    });
  }
}

export default {
  template,
  controller: LtUserInfoController
} as ng.IComponentOptions;
