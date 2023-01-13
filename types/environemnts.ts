/* eslint-disable @typescript-eslint/no-namespace */

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      SENDINBLUE_API_KEY: string;
      EMAIL: string;
      SECRET: string;
    }
  }
}

export {};
