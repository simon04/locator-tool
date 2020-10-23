import template from './ltLocationInput.html';

class LtLocationInputController implements ng.IComponentController {
  public static $inject = ['$scope'];
  constructor(private $scope: ng.IScope) {}

  fireChanged(coordinates) {
    this.$scope.$emit('coordinatesChanged', coordinates);
  }
}

export default {
  bindings: {
    latLng: '<',
    editLocation: '&'
  },
  controller: LtLocationInputController,
  template
} as ng.IComponentOptions;
