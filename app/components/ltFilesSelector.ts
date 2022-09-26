import angular from 'angular';
import {StateService, StateParams} from '@uirouter/angularjs';

import template from './ltFilesSelector.html?raw';
import LtDataAuth from '../api/ltDataAuth';
import LtData from '../api/ltData';

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
  categorySuggestions: string[] = [];
  titles: string;
  user: string;
  userEnd: Date | undefined;
  userInfo: string | undefined;
  userLimit: number | undefined;
  userStart: Date | undefined;

  public static $inject = ['ltData', 'ltDataAuth', '$log', '$state', '$stateParams'];
  constructor(
    private ltData: LtData,
    private ltDataAuth: LtDataAuth,
    private $log: ng.ILogService,
    private $state: StateService,
    $stateParams: StateParams
  ) {
    this.$tab = $stateParams.user ? Tab.USER : Tab.CATEGORY;
    this.category = $stateParams.category;
    this.categoryDepth = tryParse(parseInt, $stateParams.categoryDepth, 3);
    this.user = $stateParams.user;
    this.userLimit = tryParse(parseInt, $stateParams.userLimit, undefined);
    this.userStart = tryParse(s => new Date(s), $stateParams.userStart, undefined);
    this.userEnd = tryParse(s => new Date(s), $stateParams.userEnd, undefined);
    this.titles = '';

    function tryParse<T>(parser: (string: string) => T, text: string, fallback: T): T {
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

  $onInit() {
    this.ltDataAuth.getUserInfo().then(userInfo => {
      this.userInfo = userInfo;
      this.user = this.user || userInfo;
    });
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
      .map(file => file?.split('|')[0])
      .filter(x => x);
  }

  set titleList(files) {
    this.titles = files?.join('\n');
  }

  onFilesPaste($event: ClipboardEvent) {
    /* eslint-env browser */
    try {
      if (!$event.clipboardData) return;
      const html = $event.clipboardData.getData('text/html');
      if (!html || !/<a/.test(html)) return;
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const links = doc.getElementsByTagName('a');
      const files: Record<string, boolean> = {};
      [...links]
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
