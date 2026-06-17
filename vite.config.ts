import { fileURLToPath, URL } from 'node:url'
import { createLogger, defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

const logger = createLogger()
const loggerWarn = logger.warn

logger.warn = (message, options) => {
  if (message.includes('[INVALID_ANNOTATION]') && message.includes('node_modules/@vueuse/core')) return
  loggerWarn(message, options)
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backend = env.VITE_API_PROXY_TARGET || 'https://xqj.lo3.cn'

  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: backend,
          changeOrigin: true,
        },
      },
    },
    build: {
      chunkSizeWarningLimit: 900,
      rolldownOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return
            if (id.includes('element-plus') || id.includes('@element-plus')) return 'vendor-element'
            if (id.includes('echarts') || id.includes('zrender')) return 'vendor-charts'
            if (id.includes('vue') || id.includes('pinia')) return 'vendor-vue'
            if (id.includes('@lucide')) return 'vendor-icons'
            return 'vendor'
          },
        },
      },
    },
    customLogger: logger,
  }
})
