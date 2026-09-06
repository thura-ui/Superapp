import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import obfuscator from 'rollup-plugin-obfuscator';

export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: false,
    rollupOptions: {
      plugins: [
        (obfuscator as any)({
          global: true,
          compact: true,
          controlFlowFlattening: true,
        }),
      ],
    },
  },
});