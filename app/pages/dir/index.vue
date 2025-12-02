<script setup>
/**
 * ディレクトリルートページ (/dir)
 * ルートディレクトリのファイル・フォルダ一覧を表示
 */
import DirectoryLayout from '~/components/directory/Layout.vue'

const {
  items,
  pending,
  error,
  refresh,
  breadcrumbs,
  currentPath,
  handleFileDelete,
  setupSEO
} = await useDirectoryPage({ isRoot: true })

// SEOメタタグ
setupSEO('ディレクトリ')
</script>

<template>
  <DirectoryLayout
    :items="items"
    :pending="pending"
    :error="error"
    :current-path="currentPath"
    :breadcrumbs="breadcrumbs"
    :show-breadcrumbs="false"
    @refresh="refresh"
    @file-delete="handleFileDelete"
  />
</template>
