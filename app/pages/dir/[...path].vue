<script setup>
/**
 * 動的ディレクトリページ (/dir/...)
 * 任意のパスのディレクトリ内容を表示
 */
import DirectoryLayout from '~/components/directory/Layout.vue'

const route = useRoute()

// 現在のパス取得
const path = computed(() => {
  return Array.isArray(route.params.path)
    ? route.params.path.join('/')
    : route.params.path || ''
})

const {
  items,
  pending,
  error,
  refresh,
  breadcrumbs,
  currentPath,
  handleFileDelete,
  setupSEO
} = await useDirectoryPage({ path: path.value })

// SEO
setupSEO()
</script>

<template>
  <DirectoryLayout
    :items="items"
    :pending="pending"
    :error="error"
    :current-path="currentPath"
    :breadcrumbs="breadcrumbs"
    :show-breadcrumbs="true"
    @refresh="refresh"
    @file-delete="handleFileDelete"
  />
</template>
