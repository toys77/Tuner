import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/Tuner/',
  plugins: [react()],
  server: {
    watch: { ignored: ['**/work/**', '**/outputs/**'] },
  },
  build: { target: 'es2020' },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    globals: true,
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
