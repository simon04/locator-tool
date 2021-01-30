import {startAuthorization} from '../api/OAuth2';

class LtAuthLoginController implements ng.IComponentController {
  async $onInit() {
    await startAuthorization();
  }
}

export default {
  controller: LtAuthLoginController
} as ng.IComponentOptions;
