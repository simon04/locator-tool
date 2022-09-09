import template from './ltAbout.html?raw';

class LtAboutController implements ng.IComponentController {
  appDependencies = import.meta.env.VITE_APP_DEPENDENCIES;
  buildDate = import.meta.env.VITE_BUILD_DATE;
  buildVersion = import.meta.env.VITE_BUILD_VERSION;
}

export default {
  controller: LtAboutController,
  template
} as ng.IComponentOptions;
