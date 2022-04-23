import template from './ltFileThumbnail.html';
import {CommonsFile} from '../model';

class LtFileThumbnailController implements ng.IComponentController {
  file!: CommonsFile;

  public static $inject = ['$window'];
  constructor(private $window: ng.IWindowService) {}

  get lazyUrl() {
    return this.file.imageUrl(120);
  }

  get thumbnailUrl() {
    return this.file.imageUrl(1024);
  }

  get imageUrl() {
    const width = this.$window.innerWidth * (this.$window.devicePixelRatio || 1);
    return this.file.imageUrl(width > 2048 ? undefined : width > 1280 ? 2048 : 1024);
  }
}

export default {
  bindings: {
    file: '<'
  },
  controller: LtFileThumbnailController,
  template
} as ng.IComponentOptions;
