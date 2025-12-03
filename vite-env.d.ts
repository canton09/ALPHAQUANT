// Fix: Removed reference to vite/client to resolve "Cannot find type definition file" error

declare namespace NodeJS {
  interface ProcessEnv {
    API_KEY: string;
    [key: string]: any;
  }
}