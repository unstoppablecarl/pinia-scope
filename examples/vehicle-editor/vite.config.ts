import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { fileURLToPath, URL } from 'node:url'
import fs from 'node:fs/promises'

export default defineConfig({
  plugins: [vue()],
  define: {
    __DEV__: true,
    __TEST__: false,
  },
  resolve: {
    dedupe: ['vue', 'pinia', 'pinia-scope'],
    alias: {
      'pinia-scope': fileURLToPath(new URL('../../src/index.ts', import.meta.url)),
      '~bootstrap': path.resolve(__dirname, 'node_modules/bootstrap'),
    },
  },
  optimizeDeps: {
    exclude: ['@vueuse/shared', '@vueuse/core', 'pinia', 'pinia-scope'],
  },
  server: {
    port: 8080,
  },
  css: {
    preprocessorOptions: {
      scss: {
        // maybe one day bootstrap will update
        // to the lastest version of sass
        quietDeps: true
      },
    },
  },
})
