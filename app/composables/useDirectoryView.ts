/**
 * ディレクトリビュー共通ロジック
 * dir/index.vue と dir/[...path].vue で共有される機能を提供
 */
import type { FileItem } from '~/types'

/**
 * DropZoneコンポーネントの公開インターフェース
 */
interface DropZoneComponent {
  uploadFiles: (files: File[]) => Promise<void>
}

export function useDirectoryView() {
  const fileInputRef = ref<HTMLInputElement | null>(null)
  const uploadDropZone = inject<Ref<DropZoneComponent | null>>('uploadDropZone')

  const contextMenu = ref({
    show: false,
    x: 0,
    y: 0
  })

  const showFolderDialog = ref(false)

  // 選択中のアイテム（ファイル/フォルダの右クリック時）
  const selectedItem = ref<FileItem | null>(null)

  // メニューの種類（背景 or アイテム）
  const menuType = ref<'background' | 'item'>('background')

  // 背景の右クリックメニュー表示
  const handleBackgroundContextMenu = (e: MouseEvent) => {
    e.preventDefault()
    selectedItem.value = null
    menuType.value = 'background'
    contextMenu.value = {
      show: true,
      x: e.clientX,
      y: e.clientY
    }
  }

  // アイテムの右クリックメニュー表示
  const handleItemContextMenu = (e: MouseEvent, item: FileItem) => {
    e.preventDefault()
    e.stopPropagation()
    selectedItem.value = item
    menuType.value = 'item'
    contextMenu.value = {
      show: true,
      x: e.clientX,
      y: e.clientY
    }
  }

  // ファイル選択ダイアログを開く
  const openFileDialog = () => {
    fileInputRef.value?.click()
  }

  // ファイル選択時の処理
  const handleFileSelect = async (event: Event) => {
    const target = event.target as HTMLInputElement
    if (target.files && target.files.length > 0 && uploadDropZone?.value) {
      const files = Array.from(target.files)
      await uploadDropZone.value.uploadFiles(files)
      // ファイル入力をリセット
      target.value = ''
    }
  }

  // 右クリックメニューを閉じる
  const closeContextMenu = () => {
    contextMenu.value.show = false
  }

  // メニューアイテム選択時の処理
  const handleMenuSelect = (item: { action?: () => void }) => {
    if (item.action) {
      item.action()
    }
  }

  // フォルダ作成ダイアログを開く
  const openFolderDialog = () => {
    showFolderDialog.value = true
  }

  // フォルダ作成ダイアログを閉じる
  const closeFolderDialog = () => {
    showFolderDialog.value = false
  }

  return {
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
  }
}

/**
 * ディレクトリビュー用のキーボードショートカットを設定
 */
export function useDirectoryKeyboard(openFileDialog: () => void, refresh: () => void) {
  onMounted(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      // Cmd+U または Ctrl+U でファイル選択ダイアログを開く
      if ((e.metaKey || e.ctrlKey) && e.key === 'u') {
        e.preventDefault()
        openFileDialog()
      }
      // F5 または Cmd+R で更新
      if (e.key === 'F5' || ((e.metaKey || e.ctrlKey) && e.key === 'r')) {
        e.preventDefault()
        refresh()
      }
    }

    window.addEventListener('keydown', handleKeydown)

    onUnmounted(() => {
      window.removeEventListener('keydown', handleKeydown)
    })
  })
}

/**
 * ディレクトリビュー用のコンテキストメニューアイテムを生成
 */
export function useDirectoryContextMenu(
  openFileDialog: () => void,
  refresh: () => void,
  isLoggedIn: ComputedRef<boolean>,
  openFolderDialog: () => void,
  selectedItem: Ref<FileItem | null>,
  menuType: Ref<'background' | 'item'>,
  callbacks: {
    onOpenItem?: (item: FileItem) => void
    onCopyPath?: (path: string) => void
    onCopyLink?: (path: string) => void
    onDeleteItem?: (item: FileItem) => void
  }
) {
  return computed(() => {
    const items: any[] = []

    if (menuType.value === 'item' && selectedItem.value) {
      // アイテム用メニュー
      const item = selectedItem.value
      const isFolder = item.type === 'folder'

      // 開く
      items.push({
        label: '開く',
        icon: isFolder ? 'i-heroicons-folder-open' : 'i-heroicons-arrow-top-right-on-square',
        action: () => callbacks.onOpenItem?.(item)
      })

      // パスをコピー
      items.push({
        label: 'パスをコピー',
        icon: 'i-heroicons-clipboard-document',
        action: () => callbacks.onCopyPath?.(item.path)
      })

      // リンクをコピー
      items.push({
        label: 'リンクをコピー',
        icon: 'i-heroicons-link',
        action: () => callbacks.onCopyLink?.(item.path)
      })

      // 削除（認証済みのみ）
      if (isLoggedIn.value) {
        items.push({ divider: true })
        items.push({
          label: '削除',
          icon: 'i-heroicons-trash',
          danger: true,
          action: () => callbacks.onDeleteItem?.(item)
        })
      }
    } else {
      // 背景用メニュー
      if (isLoggedIn.value) {
        items.push({
          label: 'ファイルをアップロード',
          icon: 'i-heroicons-cloud-arrow-up',
          shortcut: '⌘U',
          action: openFileDialog
        })
        items.push({
          label: '新しいフォルダ',
          icon: 'i-heroicons-folder-plus',
          action: openFolderDialog
        })
        items.push({ divider: true })
      }

      items.push({
        label: '更新',
        icon: 'i-heroicons-arrow-path',
        shortcut: '⌘R',
        action: refresh
      })
    }

    return items
  })
}
