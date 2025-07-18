import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { fileURLToPath, URL } from 'node:url'
import fs from 'node:fs/promises'

export default defineConfig({
  plugins: [vue(), copyPiniaScopePlugin()],
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
})


function copyPiniaScopePlugin(): Plugin {
  return {
    name: 'copy-pinia',
    async generateBundle() {
      const filePath = fileURLToPath(
        new URL('../pinia/dist/pinia.mjs', import.meta.url)
      )

      // throws if file doesn't exist
      await fs.access(filePath)

      this.emitFile({
        type: 'asset',
        fileName: 'pinia.mjs',
        source: await fs.readFile(filePath, 'utf-8'),
      })
    },
  }
}

