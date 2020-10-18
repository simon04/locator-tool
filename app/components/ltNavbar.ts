import template from './ltNavbar.html';
import {TransitionService} from '@uirouter/core';

class LtNavbarController implements ng.IComponentController {
  params: any;

  public static $inject = ['$transitions'];
  constructor(private $transitions: TransitionService) {}

  $onInit() {
    this.$transitions.onSuccess({}, transition => {
      this.params = transition.params();
    });
  }

  get activateLinks() {
    return this.params && (this.params.files || this.params.user || this.params.category);
  }
}

export default {
  controller: LtNavbarController,
  template
} as ng.IComponentOptions;
