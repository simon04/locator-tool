import template from './ltFileDetails.html';
import LtDataAuth from '../api/ltDataAuth';
import {CommonsFile, LatLng} from '../model';

class LtFileDetailsController implements ng.IComponentController {
  error: unknown;
  file: CommonsFile;

  public static $inject = ['$scope', 'ltDataAuth'];
  constructor(private $scope: ng.IScope, private ltDataAuth: LtDataAuth) {}

  async editLocation(coordinates: LatLng) {
    this.error = undefined;
    try {
      await this.ltDataAuth.editLocation(this.file, coordinates);
      this.$scope.$applyAsync(() => coordinates.markAsSaved());
    } catch (error) {
      this.$scope.$applyAsync(() => (this.error = error));
    }
  }
}

export default {
  bindings: {
    file: '<'
  },
  controller: LtFileDetailsController,
  template
} as ng.IComponentOptions;
