/**
 * ディレクトリビュー共通ロジック
 * dir/index.vue と dir/[...path].vue で共有される機能を提供
 */

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

  // 右クリックメニュー表示
  const handleContextMenu = (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
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
    handleContextMenu,
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
  openFolderDialog: () => void
) {
  return computed(() => {
    const items = []

    // アップロード（ログイン時のみ）
    if (isLoggedIn.value) {
      items.push({
        label: 'ファイルをアップロード',
        icon: 'i-heroicons-cloud-arrow-up',
        shortcut: '⌘U',
        action: () => {
          openFileDialog()
        }
      })
      items.push({
        label: '新しいフォルダ',
        icon: 'i-heroicons-folder-plus',
        action: () => {
          openFolderDialog()
        }
      })
      items.push({ divider: true })
    }

    // 更新（常に表示）
    items.push({
      label: '更新',
      icon: 'i-heroicons-arrow-path',
      shortcut: '⌘R',
      action: () => {
        refresh()
      }
    })

    return items
  })
}
