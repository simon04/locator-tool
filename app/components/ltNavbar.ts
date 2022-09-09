import template from './ltNavbar.html?raw';
import {TransitionService} from '@uirouter/core';

class LtNavbarController implements ng.IComponentController {
  params: Record<string, string> | undefined;

  public static $inject = ['$transitions'];
  constructor(private $transitions: TransitionService) {}

  $onInit() {
    this.$transitions.onSuccess({}, transition => {
      this.params = transition.params();
    });
  }

  get activateLinks() {
    return this.params?.files || this.params?.user || this.params?.category;
  }
}

export default {
  controller: LtNavbarController,
  template
} as ng.IComponentOptions;
