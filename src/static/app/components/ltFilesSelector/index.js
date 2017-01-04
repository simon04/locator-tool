import template from './ltFilesSelector.html';

class ltFilesSelector {
  constructor(ltData, $state) {
    Object.assign(this, {ltData, $state, titles: ''});
  }

  getCategoriesForPrefix() {
    this.ltData
      .getCategoriesForPrefix(this.category)
      .then((categories) => {
        this.categorySuggestions = categories;
      });
  }

  getFilesForUser() {
    this.getFilesForUser$q = this.ltData
      .getFilesForUser(this.user)
      .then((titles) => {
        this.titleList = titles;
      });
  }

  getFilesForCategory() {
    this.getFilesForCategory$q = this.ltData
      .getFilesForCategory(this.category)
      .then((titles) => {
        this.titleList = titles;
      });
  }

  next() {
    const titles = this.titleList.join('|');
    this.$state.go('list', {titles});
  }

  get titleList() {
    return this.titles.split('\n')
      .map((file) => file && file.split('|')[0])
      .filter((x) => x);
  }

  set titleList(files) {
    this.titles = files && files.join('\n');
  }
}
ltFilesSelector.$inject = ['ltData', '$state'];

export default {
  template,
  controller: ltFilesSelector
};
