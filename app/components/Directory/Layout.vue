<script setup lang="ts">
/**
 * ディレクトリレイアウトコンポーネント
 * dir/index.vue と dir/[...path].vue で共有されるUIレイアウト
 */
import type { FileItem, BreadcrumbItem } from '~/types'
import FileItemComponent from '~/components/directory/FileItem.vue'
import ContextMenu from '~/components/common/ContextMenu.vue'
import ModalCreateFolder from '~/components/modal/CreateFolder.vue'
import ModalDeleteConfirm from '~/components/modal/DeleteConfirm.vue'

interface DirectoryLayoutProps {
  items: FileItem[] | null | undefined
  pending: boolean
  error: Error | null
  currentPath: string
  breadcrumbs?: BreadcrumbItem[]
  showBreadcrumbs?: boolean
}

const props = withDefaults(defineProps<DirectoryLayoutProps>(), {
  showBreadcrumbs: false,
  breadcrumbs: () => []
})

const emit = defineEmits<{
  refresh: []
  fileDelete: []
}>()

const { user } = useAuth()
const { copyPath, copyLink } = useClipboard()

// コンテキストメニューとモーダル
const {
  fileInputRef,
  contextMenu,
  showFolderDialog,
  selectedItem,
  menuType,
  handleBackgroundContextMenu,
  handleItemContextMenu,
  openFileDialog,
  handleFileSelect,
  closeContextMenu,
  handleMenuSelect,
  openFolderDialog,
  closeFolderDialog
} = useDirectoryView()

// 削除確認モーダル
const showDeleteModal = ref(false)
const itemToDelete = ref<FileItem | null>(null)

// アイテムを開く
const openItem = (item: FileItem) => {
  if (item.type === 'folder') {
    const folderPath = item.path.endsWith('/') ? item.path : `${item.path}/`
    navigateTo(`/dir/${folderPath}`)
  } else {
    window.open(`/file/${item.path}`, '_blank')
  }
}

// 削除モーダルを開く
const openDeleteModal = (item: FileItem) => {
  itemToDelete.value = item
  showDeleteModal.value = true
}

// 削除完了後
const handleDeleted = () => {
  showDeleteModal.value = false
  itemToDelete.value = null
  emit('fileDelete')
}

// キーボードショートカット
useDirectoryKeyboard(openFileDialog, () => emit('refresh'))

// コンテキストメニュー項目
const contextMenuItems = useDirectoryContextMenu(
  openFileDialog,
  () => emit('refresh'),
  computed(() => !!user.value),
  openFolderDialog,
  selectedItem,
  menuType,
  {
    onOpenItem: openItem,
    onCopyPath: copyPath,
    onCopyLink: copyLink,
    onDeleteItem: openDeleteModal
  }
)

// 統計情報
const statistics = computed(() => {
  if (!props.items) return null
  return {
    folders: props.items.filter((i) => i.type === 'folder').length,
    files: props.items.filter((i) => i.type !== 'folder').length
  }
})

// フォルダ作成後の処理
const handleFolderCreated = () => {
  closeFolderDialog()
  emit('refresh')
}
</script>

<template>
  <div
    class="directory-view min-h-[calc(100vh-180px)] flex flex-col"
    @contextmenu="handleBackgroundContextMenu"
  >
    <!-- 隠しファイル入力 -->
    <input
      ref="fileInputRef"
      type="file"
      multiple
      class="hidden"
      @change="handleFileSelect"
    />

    <!-- パンくずナビゲーション -->
    <UBreadcrumb
      v-if="showBreadcrumbs && breadcrumbs.length > 0"
      :links="breadcrumbs"
      class="mb-6"
    />

    <!-- 統計情報 -->
    <UCard v-if="statistics" class="mb-4">
      <div class="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
        <span>{{ statistics.folders }} フォルダ</span>
        <span>{{ statistics.files }} ファイル</span>
      </div>
    </UCard>

    <!-- ローディング -->
    <div v-if="pending" class="flex justify-center items-center py-12">
      <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-blue-600" />
      <span class="ml-3 text-gray-600 dark:text-gray-400">読み込み中...</span>
    </div>

    <!-- エラー表示 -->
    <UAlert v-else-if="error" color="error" icon="i-heroicons-exclamation-triangle" class="mb-4">
      <template #title>エラーが発生しました</template>
      <template #description>{{ error.message }}</template>
      <template #actions>
        <UButton color="error" variant="soft" @click="emit('refresh')">再試行</UButton>
      </template>
    </UAlert>

    <!-- ファイル一覧 -->
    <div
      v-else-if="items?.length"
      class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
    >
      <FileItemComponent
        v-for="item in items"
        :key="item.path"
        :item="item"
        @contextmenu="handleItemContextMenu"
      />
    </div>

    <!-- 空の場合 -->
    <UCard v-else class="text-center py-12">
      <UIcon
        name="i-heroicons-folder-open"
        class="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4"
      />
      <p class="text-gray-500 dark:text-gray-400">このディレクトリは空です</p>
    </UCard>

    <!-- 空白領域を埋める（右クリック領域を拡張） -->
    <div class="flex-grow min-h-[100px]"></div>

    <!-- コンテキストメニュー（一元管理） -->
    <ContextMenu
      :show="contextMenu.show"
      :items="contextMenuItems"
      :x="contextMenu.x"
      :y="contextMenu.y"
      @close="closeContextMenu"
      @select="handleMenuSelect"
    />

    <!-- フォルダ作成モーダル -->
    <ModalCreateFolder
      :show="showFolderDialog"
      :current-path="currentPath"
      @close="closeFolderDialog"
      @created="handleFolderCreated"
    />

    <!-- 削除確認モーダル（一元管理） -->
    <ModalDeleteConfirm
      v-if="itemToDelete"
      :show="showDeleteModal"
      :item="itemToDelete"
      @close="showDeleteModal = false; itemToDelete = null"
      @deleted="handleDeleted"
    />
  </div>
</template>
