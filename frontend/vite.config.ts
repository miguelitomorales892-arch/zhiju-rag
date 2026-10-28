import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { parseEnv } from 'node:util'
import vue from '@vitejs/plugin-vue'
import { defineConfig, type UserConfig } from 'vite'
import { readDevSettings } from './config/dev.ts'

export default defineConfig((): UserConfig => {
  const envFile = fileURLToPath(new URL('../.env', import.meta.url))
  const fileEnv = existsSync(envFile) ? parseEnv(readFileSync(envFile, 'utf8')) : {}
  const keys = ['API_HOST', 'API_PORT', 'FRONTEND_PORT', 'FRONTEND_API_BASE_PATH']
  const selectedEnv = Object.fromEntries(keys.map((key) => [key, process.env[key] ?? fileEnv[key]]))
  const settings = readDevSettings(selectedEnv)

  return {
    plugins: [vue()],
    // 禁用 Vite 的自动 env 注入，浏览器仅获得下面显式指定的公开路径。
    envDir: false,
    envPrefix: [],
    define: { __API_BASE_PATH__: JSON.stringify(settings.apiBasePath) },
    server: {
      host: '127.0.0.1',
      port: settings.port,
      strictPort: true,
      proxy: {
        [`^${settings.apiBasePath}(?:/|$)`]: {
          target: settings.apiTarget,
          changeOrigin: true,
          proxyTimeout: 5000,
          rewrite: (path: string) => path.slice(settings.apiBasePath.length) || '/',
        },
      },
    },
  }
})
