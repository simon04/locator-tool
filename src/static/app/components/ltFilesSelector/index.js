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
      $tab: $stateParams.user ? $tabs.user : $tabs.category,
      $tabs,
      ltData,
      $state,
      category: $stateParams.category,
      categoryDepth: tryParse(parseInt, $stateParams.categoryDepth, 3),
      user: $stateParams.user,
      userLimit: tryParse(parseInt, $stateParams.userLimit, undefined),
      userStart: tryParse(s => new Date(s), $stateParams.userStart, undefined),
      userEnd: tryParse(s => new Date(s), $stateParams.userEnd, undefined),
      titles: ''
    });
    ltDataAuth.getUserInfo().then(userInfo => {
      this.userInfo = userInfo;
      this.user = this.user || userInfo;
    });

    function tryParse(parser, text, fallback) {
      if (!text) {
        return fallback;
      }
      try {
        return parser(text);
      } catch (ex) {
        return fallback;
      }
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

  onFilesPaste($event) {
    /* eslint-env browser */
    try {
      if (!$event.clipboardData) return;
      const html = $event.clipboardData.getData('text/html');
      if (!html) return;
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const links = doc.getElementsByTagName('a');
      const files = {};
      [].slice
        .call(links)
        .map(a => decodeURI(a.href))
        .filter(href => !!href)
        .map(href => href.replace(/.*File:/, 'File:'))
        .forEach(file => (files[file] = true));
      this.titleList = Object.keys(files);
      $event.preventDefault();
    } catch (ex) {
      console.warn('Could not parse HTML clipboard content', ex);
    }
  }
}
ltFilesSelector.$inject = ['ltData', 'ltDataAuth', '$state', '$stateParams'];

export default {
  template,
  controller: ltFilesSelector
};
