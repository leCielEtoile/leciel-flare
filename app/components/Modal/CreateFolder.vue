<script setup lang="ts">
/**
 * フォルダ作成モーダルコンポーネント
 * UI_REQUIREMENTS.md セクション5.1に準拠
 */

const props = defineProps<{
  show: boolean
  currentPath: string
}>()

const emit = defineEmits<{
  close: []
  created: []
}>()

const folderName = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
const inputRef = ref<HTMLInputElement | null>(null)

// バリデーション: 半角英数字、ハイフン、アンダースコアのみ
const isValidName = computed(() => {
  if (!folderName.value) return false
  return /^[a-zA-Z0-9_-]+$/.test(folderName.value)
})

// モーダル表示時に入力フィールドに自動フォーカス
watch(() => props.show, (newValue) => {
  if (newValue) {
    nextTick(() => {
      inputRef.value?.focus()
    })
    // リセット
    folderName.value = ''
    errorMessage.value = ''
    isLoading.value = false
  }
})

// フォルダ作成処理
const createFolder = async () => {
  if (!isValidName.value) {
    errorMessage.value = '半角英数字、ハイフン、アンダースコアのみ使用できます'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    const path = props.currentPath ? `${props.currentPath}/${folderName.value}` : folderName.value
    const response = await $fetch(`/api/folders/${path}`, {
      method: 'POST'
    })

    // トースト通知
    const toast = useToast()
    toast.add({
      title: 'フォルダ作成完了',
      description: `「${folderName.value}」を作成しました`,
      color: 'green',
      icon: 'i-heroicons-check-circle'
    })

    emit('created')
    emit('close')
  } catch (error) {
    console.error('フォルダ作成エラー:', error)
    errorMessage.value = error.data?.message || 'フォルダの作成に失敗しました'

    const toast = useToast()
    toast.add({
      title: 'フォルダ作成失敗',
      description: errorMessage.value,
      color: 'red',
      icon: 'i-heroicons-exclamation-triangle'
    })
  } finally {
    isLoading.value = false
  }
}

// キーボード操作
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && isValidName.value && !isLoading.value) {
    createFolder()
  } else if (e.key === 'Escape') {
    emit('close')
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-all duration-200"
      leave-active-class="transition-all duration-200"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        @click.self="emit('close')"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <Transition
          enter-active-class="transition-all duration-200"
          leave-active-class="transition-all duration-200"
          enter-from-class="opacity-0 scale-95"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="show"
            class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
            @click.stop
          >
            <!-- ヘッダー -->
            <div class="flex items-center gap-3 px-6 py-5 border-b border-gray-200 dark:border-slate-700">
              <UIcon
                name="i-heroicons-folder-plus"
                class="w-6 h-6 text-blue-600 dark:text-blue-400"
                aria-hidden="true"
              />
              <h2 id="modal-title" class="text-lg font-semibold text-gray-900 dark:text-white">
                新しいフォルダを作成
              </h2>
            </div>

            <!-- 本文 -->
            <div class="px-6 py-5 space-y-4">
              <!-- 入力フィールド -->
              <div>
                <label for="folder-name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  フォルダ名
                </label>
                <input
                  id="folder-name"
                  ref="inputRef"
                  v-model="folderName"
                  type="text"
                  placeholder="新しいフォルダ"
                  class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                  :disabled="isLoading"
                  @keydown="handleKeydown"
                  aria-describedby="folder-name-help folder-name-error"
                />

                <!-- ヘルプテキスト -->
                <p id="folder-name-help" class="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  半角英数字、ハイフン、アンダースコアを使用できます
                </p>

                <!-- エラーメッセージ -->
                <p
                  v-if="errorMessage"
                  id="folder-name-error"
                  class="mt-2 text-xs text-red-600 dark:text-red-400"
                  role="alert"
                >
                  {{ errorMessage }}
                </p>
              </div>
            </div>

            <!-- フッター -->
            <div class="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 dark:bg-slate-900/50 border-t border-gray-200 dark:border-slate-700">
              <UButton
                color="gray"
                variant="ghost"
                :disabled="isLoading"
                @click="emit('close')"
              >
                キャンセル
              </UButton>
              <UButton
                color="primary"
                :disabled="!isValidName || isLoading"
                :loading="isLoading"
                @click="createFolder"
              >
                作成
              </UButton>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
