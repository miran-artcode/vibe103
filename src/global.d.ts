export {};
declare global {
  interface Window {
    storage?: {
      get: (key: string, shared?: boolean) => Promise<{ value: any } | null>;
      set: (key: string, value: any, shared?: boolean) => Promise<{ value: any } | null>;
      push?: (key: string, item: any) => Promise<void>;
      merge?: (key: string, patch: Record<string, any>) => Promise<void>;
      subscribe?: (key: string, cb: (value: any) => void) => () => void;
    };
    storageStatus?: { state: "connecting" | "ok" | "error"; detail: string };
  }
}
