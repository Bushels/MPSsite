/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GA_MEASUREMENT_ID?: string;
  readonly VITE_CAREERS_PUBLIC_APPLICATION_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

type GtagCommand = (...args: unknown[]) => void;

interface Window {
  dataLayer?: unknown[];
  gtag?: GtagCommand;
}
