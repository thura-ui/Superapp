/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_PRODUCTS_API_BASE_URL?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
