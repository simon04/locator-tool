import template from './ltFilesSelector.html';

class ltFilesSelector {
  constructor(ltData, $state, $stateParams) {
    Object.assign(this, {
      ltData,
      $state,
      categoryDepth: $stateParams.categoryDepth !== undefined
        ? parseInt($stateParams.categoryDepth)
        : 3,
      titles: ''
    });
    console.log(this.categoryDepth, $stateParams.categoryDepth);
    if ($stateParams.user) {
      this.user = $stateParams.user;
      this.getFilesForUser();
    } else if ($stateParams.category) {
      this.category = $stateParams.category;
      this.getFilesForCategory();
    }
  }

  getCategoriesForPrefix() {
    this.ltData.getCategoriesForPrefix(this.category).then(categories => {
      this.categorySuggestions = categories;
    });
  }

  getFilesForUser() {
    this.$state.go('.', {user: this.user, category: undefined}, {replace: true});
    this.getFilesForUser$q = this.ltData.getFilesForUser(this.user).then(titles => {
      this.titleList = titles;
    });
  }

  getFilesForCategory() {
    this.$state.go('.', {category: this.category, user: undefined}, {replace: true});
    this.getFilesForCategory$q = this.ltData
      .getFilesForCategory(this.category, this.categoryDepth)
      .then(titles => {
        this.titleList = titles;
      });
  }

  next() {
    const files = this.titleList.join('|');
    this.$state.go('geolocate', {files});
  }

  get titleList() {
    return this.titles.split('\n').map(file => file && file.split('|')[0]).filter(x => x);
  }

  set titleList(files) {
    this.titles = files && files.join('\n');
  }
}
ltFilesSelector.$inject = ['ltData', '$state', '$stateParams'];

export default {
  template,
  controller: ltFilesSelector
};
