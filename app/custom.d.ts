declare module '*.png' {

}

declare module '*.html' {
  const content: string;
  export default content;
}
