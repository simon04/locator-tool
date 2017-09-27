import template from './ltFileThumbnail.pug';

class controller {
  constructor($window) {
    this.$window = $window;
  }

  get thumbnailUrl() {
    return this.file.imageUrl(1024);
  }

  get imageUrl() {
    return this.file.imageUrl(this.$window.innerWidth);
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
