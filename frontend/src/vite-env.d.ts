/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_OPENAI_API_KEY: string
  readonly VITE_ENABLE_VOICE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}