<script setup>
/**
 * トップページ
 * ロゴとウェルカムメッセージを表示
 */

const { isLoggedIn, user, login } = useAuth()
const config = useRuntimeConfig()

// サービス名を環境変数から取得
const serviceName = computed(() => config.public.serviceName || 'leciel Flare')

// SEOメタタグ
useHead({
  title: serviceName.value,
  meta: [
    { name: 'description', content: 'Modern file browser powered by Cloudflare R2' }
  ]
})
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-[60vh] px-4">
    <!-- ロゴエリア -->
    <div class="text-center mb-8">
      <div class="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
        <UIcon name="i-heroicons-folder-20-solid" class="w-20 h-20 text-white" />
      </div>
      <h1 class="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent mb-4">
        {{ serviceName }}
      </h1>
      <p class="text-xl text-gray-600 dark:text-gray-400 mb-8">
        File Browser
      </p>
    </div>

    <!-- アクションボタン -->
    <div class="flex flex-col sm:flex-row gap-4">
      <UButton to="/dir" size="xl" icon="i-heroicons-folder-open" color="primary">
        ファイルを閲覧
      </UButton>
      <UButton v-if="!isLoggedIn" @click="login" size="xl" icon="i-heroicons-user-circle" variant="outline">
        Discordでログイン
      </UButton>
      <UButton v-else to="/dir" size="xl" icon="i-heroicons-user" variant="soft">
        {{ user?.displayName || 'マイページ' }}
      </UButton>
    </div>
  </div>
</template>
