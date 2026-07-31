import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  return {
    // 'mode' is explicitly passed by Vite ('development' or 'production')
    base: mode === 'production' ? '/primerize-1d-local/' : '/',
    plugins: [react(), tailwindcss()],
  };
});
