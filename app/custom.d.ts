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
