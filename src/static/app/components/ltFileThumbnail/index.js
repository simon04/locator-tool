import template from './ltFileThumbnail.pug';

class controller {
  constructor($window) {
    this.$window = $window;
  }

  get fullImageUrl() {
    const width = this.$window.innerWidth;
    if (width >= 2048) {
      return this.file.imageUrl(2048);
    } else if (width >= 1280) {
      return this.file.imageUrl(2048);
    } else {
      return this.file.imageUrl(1024);
    }
  }
}
controller.$inject = ['$window'];

export default {
  bindings: {
    file: '<'
  },
  controller,
  template
};
