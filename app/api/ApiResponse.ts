export interface ApiResponse<P = never> {
  continue: {[key: string]: string} | undefined;
  batchcomplete: string;
  query: {
    pages: {[key: string]: P};
    categorymembers?: P[];
    allpages?: P[];
    allusers?: P[];
    geosearch?: P[];
  };
}

export interface Page {
  pageid: number;
  ns: number;
  title: string;
}
