/// <reference types="vite/client" />

declare type gettextCatalog = angular.gettext.gettextCatalog & {
  /** Translate a string with the given language, count and context. */
  getStringFormFor(language: string, string: string, n: number, context?: string): string;
};
