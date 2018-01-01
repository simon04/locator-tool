import template from './ltAbout.pug';

class controller {
  constructor() {
    /* global __BUILD_DATE__ __BUILD_VERSION__ */
    this.buildDate = __BUILD_DATE__;
    this.buildVersion = __BUILD_VERSION__;
  }
}

export default {
  controller,
  template
};
