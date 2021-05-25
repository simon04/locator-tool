import template from './ltAbout.html';

declare const __BUILD_DATE__: string;
declare const __BUILD_VERSION__: string;

class LtAboutController implements ng.IComponentController {
  buildDate = __BUILD_DATE__;
  buildVersion = __BUILD_VERSION__;
}

export default {
  controller: LtAboutController,
  template
} as ng.IComponentOptions;
