import template from './ltFileThumbnail.pug';

class controller {
  constructor($window) {
    this.$window = $window;
  }

  get thumbnailUrl() {
    return this.file.imageUrl(1024);
  }

  get imageUrl() {
    const width = this.$window.innerWidth;
    return this.file.imageUrl(width > 2048 ? undefined : width > 1280 ? 2048 : 1024);
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
