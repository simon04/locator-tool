import angular from 'angular';
import {CommonsFile} from '../model';
import LtData from '../api/ltData';
import template from './ltGallery.html?raw';
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
      .finally(() => {
        this.isLoading = false;
        this.titles.forEach(title =>
          ltData
            .getFileDetails(title.pageid, 'categories|imageinfo', 'extmetadata')
            .then(fileDetails => angular.extend(title, fileDetails))
        );
      });
  }
}

export default {
  template,
  controller: LtGalleryController
} as ng.IComponentOptions;
