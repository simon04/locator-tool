declare module '*.png' {

}

declare module '*.html' {
  const content: string;
  export default content;
}

declare module 'octicons/build/sprite.octicons.svg' {
  const content: string;
  export default content;
}

declare type gettextCatalog = angular.gettext.gettextCatalog & {
  /** Translate a string with the given language, count and context. */
  getStringFormFor(language: string, string: string, n: number, context?: string): string;
};
