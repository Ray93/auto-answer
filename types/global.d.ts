export {};

declare global {
  var authToken: string;
  
  interface GlobalThis {
    authToken: string;
  }
}
