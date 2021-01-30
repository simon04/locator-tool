import template from './ltUserInfo.html';
import {Profile} from '../api/OAuth2';

class LtUserInfoController implements ng.IComponentController {
  public static $inject = ['ltProfile'];
  constructor(private ltProfile: Profile) {}

  get user(): string {
    return (this.ltProfile || {}).username;
  }
}

export default {
  template,
  controller: LtUserInfoController
} as ng.IComponentOptions;
