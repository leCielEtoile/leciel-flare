<script setup lang="ts">
/**
 * ファイル/フォルダアイテムコンポーネント
 * ディレクトリ一覧で使用されるカード形式のアイテム表示
 * UI_REQUIREMENTS.md セクション4.2-4.3に準拠
 */
import type { FileItem } from '~/types'
import { formatFileSize } from '~/utils/formatter'

const props = defineProps<{
  item: FileItem
}>()

const emit = defineEmits<{
  contextmenu: [event: MouseEvent, item: FileItem]
}>()

// アイコン判定
const icon = computed(() => {
  if (props.item.type === 'folder') {
    return 'i-heroicons-folder'
  }

  const ext = props.item.name.split('.').pop()?.toLowerCase()

  const iconMap = {
    // 画像
    jpg: 'i-heroicons-photo',
    jpeg: 'i-heroicons-photo',
    png: 'i-heroicons-photo',
    gif: 'i-heroicons-photo',
    svg: 'i-heroicons-photo',
    webp: 'i-heroicons-photo',

    // 動画
    mp4: 'i-heroicons-film',
    mov: 'i-heroicons-film',
    avi: 'i-heroicons-film',
    mkv: 'i-heroicons-film',
    webm: 'i-heroicons-film',

    // 音声
    mp3: 'i-heroicons-musical-note',
    wav: 'i-heroicons-musical-note',
    flac: 'i-heroicons-musical-note',
    m4a: 'i-heroicons-musical-note',

    // 文書
    pdf: 'i-heroicons-document-text',
    doc: 'i-heroicons-document-text',
    docx: 'i-heroicons-document-text',
    txt: 'i-heroicons-document-text',
    md: 'i-heroicons-document-text',

    // アーカイブ
    zip: 'i-heroicons-archive-box',
    rar: 'i-heroicons-archive-box',
    '7z': 'i-heroicons-archive-box',
    tar: 'i-heroicons-archive-box',
    gz: 'i-heroicons-archive-box',

    // コード
    js: 'i-heroicons-code-bracket',
    ts: 'i-heroicons-code-bracket',
    vue: 'i-heroicons-code-bracket',
    py: 'i-heroicons-code-bracket',
    java: 'i-heroicons-code-bracket',
    cpp: 'i-heroicons-code-bracket',
    html: 'i-heroicons-code-bracket',
    css: 'i-heroicons-code-bracket',
  }

  return iconMap[ext || ''] || 'i-heroicons-document'
})

// アイコンカラー
const iconColor = computed(() => {
  if (props.item.type === 'folder') {
    return 'text-yellow-500'
  }

  const ext = props.item.name.split('.').pop()?.toLowerCase()

  const colorMap = {
    // 画像 - 青
    jpg: 'text-blue-500',
    jpeg: 'text-blue-500',
    png: 'text-blue-500',
    gif: 'text-blue-500',
    svg: 'text-blue-500',
    webp: 'text-blue-500',

    // 動画 - 赤
    mp4: 'text-red-500',
    mov: 'text-red-500',
    avi: 'text-red-500',
    mkv: 'text-red-500',
    webm: 'text-red-500',

    // 音声 - 緑
    mp3: 'text-green-500',
    wav: 'text-green-500',
    flac: 'text-green-500',
    m4a: 'text-green-500',

    // 文書 - オレンジ
    pdf: 'text-orange-500',
    doc: 'text-orange-500',
    docx: 'text-orange-500',
    txt: 'text-orange-500',
    md: 'text-orange-500',

    // アーカイブ - 紫
    zip: 'text-purple-500',
    rar: 'text-purple-500',
    '7z': 'text-purple-500',
    tar: 'text-purple-500',
    gz: 'text-purple-500',

    // コード - インディゴ
    js: 'text-indigo-500',
    ts: 'text-indigo-500',
    vue: 'text-indigo-500',
    py: 'text-indigo-500',
    java: 'text-indigo-500',
    cpp: 'text-indigo-500',
    html: 'text-indigo-500',
    css: 'text-indigo-500',
  }

  return colorMap[ext || ''] || 'text-gray-500'
})

// クリック処理
const handleClick = () => {
  if (props.item.type === 'folder') {
    // フォルダは必ずトレーリングスラッシュをつける
    const folderPath = props.item.path.endsWith('/') ? props.item.path : `${props.item.path}/`
    navigateTo(`/dir/${folderPath}`)
  } else {
    // ファイルは直接開く
    window.open(`/file/${props.item.path}`, '_blank')
  }
}

// ファイルサイズフォーマット
const formattedSize = computed(() => {
  if (!props.item.size) return ''
  return formatFileSize(props.item.size)
})

const isFolder = computed(() => props.item.type === 'folder')

// 右クリックメニュー表示
const handleContextMenu = (e: MouseEvent) => {
  e.preventDefault()
  e.stopPropagation()
  emit('contextmenu', e, props.item)
}
</script>

<template>
  <UCard
    @click="handleClick"
    @contextmenu="handleContextMenu"
    class="cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
  >
    <div class="flex flex-col items-center space-y-2">
      <!-- アイコン -->
      <UIcon
        :name="icon"
        class="w-12 h-12"
        :class="iconColor"
      />

      <!-- ファイル/フォルダ名 -->
      <p class="text-sm font-medium text-center truncate w-full" :title="item.name">
        {{ item.name }}
      </p>

      <!-- ファイルサイズ -->
      <p v-if="item.type !== 'folder' && formattedSize" class="text-xs text-gray-500">
        {{ formattedSize }}
      </p>
    </div>
  </UCard>
</template>
