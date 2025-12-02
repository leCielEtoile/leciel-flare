<script setup>
/**
 * グローバルドラッグ&ドロップゾーン
 * ページ全体でファイルのドラッグ&ドロップを受け付け、直接アップロードする
 */

const props = defineProps({
  currentPath: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['upload-complete', 'upload-error'])

const toast = useToast()
const { isLoggedIn, login } = useAuth()

// ドラッグ状態
const isDragging = ref(false)
const dragCounter = ref(0) // ネストされた要素の出入りを正確に追跡

// アップロード状態
const isUploading = ref(false)
const uploadProgress = ref(0)
const uploadingFiles = ref([])

// ドラッグ開始
const handleDragEnter = (e) => {
  e.preventDefault()
  dragCounter.value++

  // ログイン済みの場合のみ、ファイルがドラッグされている場合に反応
  if (isLoggedIn.value && e.dataTransfer?.types?.includes('Files')) {
    isDragging.value = true
  }
}

// ドラッグ離脱
const handleDragLeave = (e) => {
  e.preventDefault()
  dragCounter.value--

  if (dragCounter.value === 0) {
    isDragging.value = false
  }
}

// ドラッグオーバー
const handleDragOver = (e) => {
  e.preventDefault()
  if (e.dataTransfer) {
    e.dataTransfer.dropEffect = 'copy'
  }
}

// ドロップ - 直接アップロード
const handleDrop = async (e) => {
  e.preventDefault()
  isDragging.value = false
  dragCounter.value = 0

  if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
    const files = Array.from(e.dataTransfer.files)
    await uploadFiles(files)
  }
}

// ファイルアップロード処理
const uploadFiles = async (files) => {
  if (files.length === 0) return

  // 未ログインの場合はログインを促す
  if (!isLoggedIn.value) {
    toast.add({
      title: 'ログインが必要です',
      description: 'ファイルをアップロードするにはログインしてください',
      color: 'orange',
      icon: 'i-heroicons-exclamation-triangle',
      actions: [{
        label: 'ログイン',
        click: () => {
          login()
        }
      }]
    })
    return
  }

  isUploading.value = true
  uploadProgress.value = 0
  uploadingFiles.value = files

  try {
    for (let i = 0; i < files.length; i++) {
      const formData = new FormData()
      formData.append('file', files[i])
      formData.append('path', props.currentPath)

      await $fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      uploadProgress.value = ((i + 1) / files.length) * 100
    }

    toast.add({
      title: 'アップロード完了',
      description: `${files.length}個のファイルをアップロードしました`,
      color: 'green',
      icon: 'i-heroicons-check-circle'
    })

    emit('upload-complete')
  } catch (error) {
    console.error('Upload error:', error)

    // エラーメッセージを判定
    const errorMessage = error instanceof Error ? error.message : 'アップロードに失敗しました'
    const isAuthError = errorMessage.includes('認証') || errorMessage.includes('Unauthorized') || errorMessage.includes('401')

    toast.add({
      title: isAuthError ? 'ログインが必要です' : 'アップロード失敗',
      description: isAuthError ? 'ファイルをアップロードするにはログインしてください' : errorMessage,
      color: isAuthError ? 'orange' : 'red',
      icon: isAuthError ? 'i-heroicons-exclamation-triangle' : 'i-heroicons-exclamation-circle',
      ...(isAuthError && {
        actions: [{
          label: 'ログイン',
          click: () => {
            login()
          }
        }]
      })
    })
    emit('upload-error', error instanceof Error ? error : new Error('Upload failed'))
  } finally {
    isUploading.value = false
    uploadProgress.value = 0
    uploadingFiles.value = []
  }
}

// ページ離脱時のリセット
onMounted(() => {
  // ブラウザ外にドラッグした場合のリセット
  window.addEventListener('dragleave', (e) => {
    if (e.clientX === 0 && e.clientY === 0) {
      isDragging.value = false
      dragCounter.value = 0
    }
  })
})

// 外部からアップロードを実行できるようにする
defineExpose({
  uploadFiles
})
</script>

<template>
  <!-- グローバルドロップオーバーレイ -->
  <Teleport to="body">
    <!-- ドラッグ中のオーバーレイ -->
    <Transition
      enter-active-class="transition-opacity duration-200"
      leave-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isDragging && !isUploading"
        @dragenter="handleDragEnter"
        @dragleave="handleDragLeave"
        @dragover="handleDragOver"
        @drop="handleDrop"
        class="fixed inset-0 z-50 bg-blue-500/20 backdrop-blur-sm flex items-center justify-center"
      >
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-12 border-4 border-dashed border-blue-500 max-w-md mx-4">
          <UIcon name="i-heroicons-cloud-arrow-up" class="w-24 h-24 mx-auto text-blue-500 mb-6" />
          <h2 class="text-2xl font-bold text-center mb-2 text-gray-900 dark:text-white">
            ファイルをドロップ
          </h2>
          <p class="text-center text-gray-600 dark:text-gray-400">
            ここにファイルをドロップしてアップロード
          </p>
          <p class="text-center text-sm text-gray-500 dark:text-gray-500 mt-4">
            複数ファイル対応
          </p>
        </div>
      </div>
    </Transition>

    <!-- アップロード中のオーバーレイ -->
    <Transition
      enter-active-class="transition-opacity duration-200"
      leave-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isUploading"
        class="fixed inset-0 z-50 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center"
      >
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md mx-4 w-full">
          <div class="flex items-center gap-3 mb-6">
            <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 text-blue-600 animate-spin" />
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">
              アップロード中...
            </h2>
          </div>

          <!-- ファイル一覧 -->
          <div class="space-y-2 mb-4 max-h-48 overflow-y-auto">
            <div
              v-for="(file, index) in uploadingFiles"
              :key="index"
              class="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded text-sm"
            >
              <UIcon
                :name="index < Math.ceil((uploadProgress / 100) * uploadingFiles.length) ? 'i-heroicons-check-circle' : 'i-heroicons-document'"
                :class="[
                  'w-4 h-4 shrink-0',
                  index < Math.ceil((uploadProgress / 100) * uploadingFiles.length) ? 'text-green-500' : 'text-gray-400'
                ]"
              />
              <span class="truncate">{{ file.name }}</span>
            </div>
          </div>

          <!-- プログレスバー -->
          <UProgress :value="uploadProgress" class="mb-2" />
          <p class="text-center text-sm text-gray-600 dark:text-gray-400">
            {{ Math.round(uploadProgress) }}% 完了
          </p>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- 非表示のドラッグ検知エリア -->
  <div
    @dragenter="handleDragEnter"
    class="fixed inset-0 pointer-events-none"
    style="z-index: -1"
  />
</template>
