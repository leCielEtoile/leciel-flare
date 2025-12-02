<script setup>
const route = useRoute()
const { isLoggedIn, user, isDevelopment, login, devLogin, logout } = useAuth()
const config = useRuntimeConfig()

// サービス名を環境変数から取得
const serviceName = computed(() => config.public.serviceName || 'leciel Flare')

// 現在のパスを取得
const currentPath = computed(() => {
  // /dir または /dir/... からパスを抽出
  if (route.path === '/' || route.path === '/dir' || route.path === '/dir/') return ''

  if (route.path.startsWith('/dir/')) {
    const pathWithoutPrefix = route.path.replace(/^\/dir\//, '')
    // 末尾のスラッシュを除去
    return pathWithoutPrefix.replace(/\/$/, '')
  }

  return Array.isArray(route.params.path)
    ? route.params.path.join('/')
    : route.params.path || ''
})

// ページリフレッシュ用
const refreshKey = ref(0)
const handleUploadComplete = () => {
  refreshKey.value++
  // ページ全体をリロード
  window.location.reload()
}

// UploadDropZoneコンポーネントのref
const uploadDropZoneRef = ref(null)

// 子コンポーネントに提供
provide('uploadDropZone', uploadDropZoneRef)
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex flex-col">
    <!-- グローバルドラッグ&ドロップゾーン -->
    <UploadDropZone ref="uploadDropZoneRef" :current-path="currentPath" @upload-complete="handleUploadComplete" />

    <!-- ヘッダー -->
    <header class="sticky top-0 z-40 bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-b border-gray-200/50 dark:border-slate-700/50">
      <UContainer>
        <div class="flex justify-between items-center h-16">
          <!-- ロゴ -->
          <NuxtLink to="/" class="flex items-center space-x-3 group">
            <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <UIcon name="i-heroicons-folder-20-solid" class="w-6 h-6 text-white" />
            </div>
            <div class="hidden sm:block">
              <h1 class="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                {{ serviceName }}
              </h1>
              <p class="text-xs text-gray-500 dark:text-gray-400 -mt-1">
                File Browser
              </p>
            </div>
          </NuxtLink>

          <!-- 右側: 認証ボタン + テーマトグル -->
          <div class="flex items-center gap-3">
            <ClientOnly>
              <!-- ログインボタン（未認証時） -->
              <UButton
                v-if="!isLoggedIn"
                @click="isDevelopment ? devLogin() : login()"
                icon="i-heroicons-user-circle"
                variant="soft"
                size="sm"
              >
                {{ isDevelopment ? 'テストログイン' : 'ログイン' }}
              </UButton>

              <!-- ユーザーメニュー（認証済み時） -->
              <div v-else class="relative group">
                <UButton icon="i-heroicons-user" variant="soft" size="sm">
                  {{ user?.username || 'User' }}
                </UButton>
                <div class="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div class="py-1">
                    <div class="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-slate-700">
                      {{ user?.displayName || 'User' }}
                    </div>
                    <button
                      @click="logout"
                      class="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center gap-2"
                    >
                      <UIcon name="i-heroicons-arrow-right-on-rectangle" class="w-4 h-4" />
                      ログアウト
                    </button>
                  </div>
                </div>
              </div>

              <!-- テーマトグル -->
              <ThemeToggle />
            </ClientOnly>
          </div>
        </div>
      </UContainer>
    </header>

    <!-- メインコンテンツ -->
    <main class="flex-1 py-6 grow">
      <UContainer>
        <slot />
      </UContainer>
    </main>

    <!-- フッター -->
    <footer class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-t border-gray-200/50 dark:border-slate-700/50">
      <UContainer>
        <div class="py-4">
          <div class="flex justify-end items-center">
            <p class="text-xs text-gray-500">
              Powered by Cloudflare Workers
            </p>
          </div>
        </div>
      </UContainer>
    </footer>
  </div>
</template>
