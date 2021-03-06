import template from './ltFileDetails.html';
import LtDataAuth from '../api/ltDataAuth';
import {CommonsFile, LatLng} from '../model';

class LtFileDetailsController implements ng.IComponentController {
  error: unknown;
  file: CommonsFile;

  public static $inject = ['ltDataAuth'];
  constructor(private ltDataAuth: LtDataAuth) {}

  editLocation(coordinates: LatLng) {
    this.error = undefined;
    return this.ltDataAuth.editLocation(this.file, coordinates).then(
      () => {
        coordinates.markAsSaved();
      },
      error => {
        this.error = error;
      }
    );
  }
}

export default {
  bindings: {
    file: '<'
  },
  controller: LtFileDetailsController,
  template
} as ng.IComponentOptions;
