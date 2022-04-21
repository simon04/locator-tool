import {CommonsFile} from '../model';
import LtData from '../api/ltData';
import template from './ltGallery.html';
import {StateParams} from '@uirouter/angularjs';

class LtGalleryController implements ng.IComponentController {
  isLoading = true;
  titles: CommonsFile[] = [];

  public static $inject = ['ltData', '$stateParams'];
  constructor(ltData: LtData, $stateParams: StateParams) {
    ltData
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .getFiles($stateParams as any)
      .then(titles => ltData.getCoordinates(titles))
      .then(titles => (this.titles = titles))
      .finally(() => (this.isLoading = false));
  }
}

export default {
  template,
  controller: LtGalleryController
} as ng.IComponentOptions;
