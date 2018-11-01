import template from './ltFileDetails.pug';

class ltFileDetails {
  constructor(ltDataAuth) {
    Object.assign(this, {ltDataAuth});
  }

  editLocation(file, coordinates) {
    this.error = undefined;
    return this.ltDataAuth.editLocation(file, coordinates).then(
      () => {
        coordinates.markAsSaved();
      },
      error => {
        this.error = error;
      }
    );
  }
}
ltFileDetails.$inject = ['ltDataAuth'];

export default {
  bindings: {
    file: '<'
  },
  controller: ltFileDetails,
  template
};
