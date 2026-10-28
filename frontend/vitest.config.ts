import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [vue()],
  define: { __API_BASE_PATH__: JSON.stringify('/api') },
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.ts'],
    clearMocks: true,
    restoreMocks: true,
  },
})
