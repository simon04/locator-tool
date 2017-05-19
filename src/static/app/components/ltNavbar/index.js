import template from './ltNavbar.pug';

class controller {
  constructor($transitions) {
    this.params = undefined;
    $transitions.onSuccess({}, transition => {
      this.params = transition.params();
    });
  }

  get activateLinks() {
    return this.params && (this.params.files || this.params.user || this.params.category);
  }
}
controller.$inject = ['$transitions'];

export default {
  controller,
  template
};
