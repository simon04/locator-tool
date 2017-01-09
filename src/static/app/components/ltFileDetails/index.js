import template from './ltFileDetails.html';

class ltFileDetails {
  constructor(ltDataAuth) {
    Object.assign(this, {ltDataAuth});
  }

  editLocation(title, coordinates) {
    this.error = undefined;
    return this.ltDataAuth.editLocation(title, coordinates)
      .then(() => {
        coordinates.setLatLng({lat, lng}, true);
      }, (error) => {
        this.error = error;
      });
  }
}
ltFileDetails.$inject = ['ltDataAuth'];

export default {
  bindings: {
    title: '<'
  },
  controller: ltFileDetails,
  template
};
