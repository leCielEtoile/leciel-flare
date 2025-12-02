<script setup>
/**
 * 404エラーページ
 * ページが見つからない場合に表示
 */

useHead({
  title: '404 - ページが見つかりません | leciel Flare'
})
</script>

<template>
  <UCard class="max-w-lg mx-auto mt-20">
    <div class="text-center py-8">
      <UIcon name="i-heroicons-exclamation-triangle" class="w-20 h-20 mx-auto text-red-500 mb-4" />
      <h1 class="text-3xl font-bold mb-2">404</h1>
      <h2 class="text-xl font-medium mb-4">ページが見つかりません</h2>
      <p class="text-gray-600 dark:text-gray-400 mb-6">
        お探しのページは存在しないか、移動した可能性があります。
      </p>
      <UButton to="/" size="lg" icon="i-heroicons-home">
        ホームに戻る
      </UButton>
    </div>
  </UCard>
</template>
