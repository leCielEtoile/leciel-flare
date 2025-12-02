// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-11-16',

  future: {
    compatibilityVersion: 4,
  },

  modules: [
    '@nuxt/ui',
    '@vueuse/nuxt',
    'nuxt-auth-utils'
  ],

  ui: {
    global: true
  },

  css: [
    '~/assets/css/main.css'
  ],

  typescript: {
    strict: true,
    typeCheck: false  // Disabled during development to avoid @volar dependency issues
  },

  nitro: {
    preset: 'cloudflare-module',
    rollupConfig: {
      output: {
        manualChunks: undefined
      }
    },
    commonJS: {
      // unenv-preset の sideEffects 設定を尊重しない
      ignoreDynamicRequires: false
    }
  },

  app: {
    head: {
      titleTemplate: '%s - File Browser',
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      meta: [
        { name: 'description', content: 'File Browser powered by Cloudflare R2' }
      ]
    }
  },

  devServer: {
    port: 3000
  },

  runtimeConfig: {
    // サーバーサイドのみで利用可能
    discordGuildId: '',
    oauth: {
      discord: {
        clientId: '',
        clientSecret: ''
      }
    },
    // クライアントサイドでも利用可能
    public: {
      siteUrl: 'http://localhost:3000',
      serviceName: 'leciel Flare'
    }
  },

  vite: {
    build: {
      sourcemap: true,
      rollupOptions: {
        external: []
      }
    },
    optimizeDeps: {
      include: [
        '@cloudflare/unenv-preset'
      ]
    }
  },

  // パフォーマンス最適化
  experimental: {
    payloadExtraction: true,
    renderJsonPayloads: true
  },

  devtools: { enabled: true }
})