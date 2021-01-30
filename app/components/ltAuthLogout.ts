import {logout} from '../api/OAuth2';

class LtAuthLogoutController implements ng.IComponentController {
  async $onInit() {
    logout();
  }
}

export default {
  controller: LtAuthLogoutController
} as ng.IComponentOptions;
