/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ISSUANCE_SERVICE_URL?: string;
  readonly VITE_VERIFICATION_SERVICE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
