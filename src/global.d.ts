export {};
declare global {
  interface Window {
    storage?: {
      get: (key: string, shared?: boolean) => Promise<{ value: any } | null>;
      set: (key: string, value: any, shared?: boolean) => Promise<{ value: any } | null>;
    };
  }
}
