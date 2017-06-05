import angular from 'angular';

import template from './ltFilesSelector.pug';

class ltFilesSelector {
  constructor(ltData, ltDataAuth, $state, $stateParams) {
    const $tabs = {
      category: {},
      user: {},
      files: {}
    };
    Object.assign(this, {
      $tab: $tabs.category,
      $tabs,
      ltData,
      $state,
      categoryDepth: $stateParams.categoryDepth !== undefined
        ? parseInt($stateParams.categoryDepth)
        : 3,
      titles: ''
    });
    if ($stateParams.user) {
      this.user = $stateParams.user;
      this.$tab = $tabs.user;
    } else if ($stateParams.category) {
      this.category = $stateParams.category;
    } else {
      ltDataAuth.getUserInfo().then(userInfo => {
        this.userInfo = userInfo;
        this.user = this.user || userInfo;
      });
    }
  }

  getCategoriesForPrefix() {
    this.ltData.getCategoriesForPrefix(this.category).then(categories => {
      this.categorySuggestions = categories;
    });
  }

  next(state = 'geolocate') {
    const files = this.titleList.join('|');
    this.$state.go(state, {files});
  }

  nextForUser(state = 'geolocate') {
    const {user, userLimit} = this;
    const userStart = angular.isDate(this.userStart) ? this.userStart.toISOString() : undefined;
    const userEnd = angular.isDate(this.userEnd) ? this.userEnd.toISOString() : undefined;
    this.$state.go(state, {user, userLimit, userStart, userEnd});
  }

  nextForCategory(state = 'geolocate') {
    const {category, categoryDepth} = this;
    this.$state.go(state, {category, categoryDepth});
  }

  get titleList() {
    return this.titles.split('\n').map(file => file && file.split('|')[0]).filter(x => x);
  }

  set titleList(files) {
    this.titles = files && files.join('\n');
  }
}
ltFilesSelector.$inject = ['ltData', 'ltDataAuth', '$state', '$stateParams'];

export default {
  template,
  controller: ltFilesSelector
};
