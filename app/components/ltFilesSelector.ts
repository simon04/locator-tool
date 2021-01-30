import * as angular from 'angular';
import {StateService, StateParams} from '@uirouter/angularjs';

import template from './ltFilesSelector.html';
import LtData from '../api/ltData';
import {Profile} from '../api/OAuth2';

enum Tab {
  CATEGORY = 1,
  USER = 2,
  FILES = 3
}

class LtFilesSelectorController implements ng.IComponentController {
  $tab: Tab;
  $tabs = Tab;
  category: string;
  categoryDepth: number;
  categorySuggestions: string[];
  titles: string;
  user: string;
  userEnd: Date;
  userLimit: number;
  userStart: Date;

  public static $inject = ['ltData', 'ltProfile', '$log', '$state', '$stateParams'];
  constructor(
    private ltData: LtData,
    private ltProfile: Profile,
    private $log: ng.ILogService,
    private $state: StateService,
    $stateParams: StateParams
  ) {
    this.$tab = $stateParams.user ? Tab.USER : Tab.CATEGORY;
    this.category = $stateParams.category;
    this.categoryDepth = tryParse(parseInt, $stateParams.categoryDepth, 3);
    this.user = $stateParams.user || this.userInfo;
    this.userLimit = tryParse(parseInt, $stateParams.userLimit, undefined);
    this.userStart = tryParse(s => new Date(s), $stateParams.userStart, undefined);
    this.userEnd = tryParse(s => new Date(s), $stateParams.userEnd, undefined);
    this.titles = '';

    function tryParse<T>(parser: (string) => T, text: string, fallback: T): T {
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

  get userInfo(): string {
    return (this.ltProfile || {}).username;
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
    return this.titles
      .split('\n')
      .map(file => file && file.split('|')[0])
      .filter(x => x);
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
      this.$log.warn('Could not parse HTML clipboard content', ex);
    }
  }
}

export default {
  template,
  controller: LtFilesSelectorController
} as ng.IComponentOptions;
