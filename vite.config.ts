import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import obfuscator from 'rollup-plugin-obfuscator';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // 🟢 Node.js Backend Server အတွက် Proxy ချိတ်ဆက်ခြင်း 🟢
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist',
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