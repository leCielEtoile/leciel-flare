<script setup lang="ts">
/**
 * 削除確認モーダルコンポーネント
 * UI_REQUIREMENTS.md セクション5.2に準拠
 */
import type { FileItem } from '~/types'
import { formatFileSize } from '~/utils/formatter'

const props = defineProps<{
  show: boolean
  item: FileItem | null
}>()

const emit = defineEmits<{
  close: []
  deleted: []
}>()

const isLoading = ref(false)

const isFolder = computed(() => props.item?.type === 'folder')

const title = computed(() => {
  return isFolder.value ? 'フォルダを削除しますか？' : 'ファイルを削除しますか？'
})

const message = computed(() => {
  return isFolder.value
    ? 'このフォルダとその中のすべてのファイルを削除してもよろしいですか？この操作は取り消せません。'
    : 'このファイルを削除してもよろしいですか？この操作は取り消せません。'
})

// 削除処理
const confirmDelete = async () => {
  if (!props.item) return

  isLoading.value = true

  try {
    const endpoint = isFolder.value ? `/api/folders/${props.item.path}` : `/api/files/${props.item.path}`
    await $fetch(endpoint, {
      method: 'DELETE'
    })

    // トースト通知
    const toast = useToast()
    const itemType = isFolder.value ? 'フォルダ' : 'ファイル'
    toast.add({
      title: '削除完了',
      description: `${itemType}「${props.item.name}」を削除しました`,
      color: 'green',
      icon: 'i-heroicons-check-circle'
    })

    emit('deleted')
    emit('close')
  } catch (error) {
    console.error('削除エラー:', error)

    const toast = useToast()
    const itemType = isFolder.value ? 'フォルダ' : 'ファイル'
    toast.add({
      title: '削除失敗',
      description: `${itemType}の削除に失敗しました`,
      color: 'red',
      icon: 'i-heroicons-exclamation-triangle'
    })
  } finally {
    isLoading.value = false
  }
}

// キーボード操作
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    emit('close')
  }
}

// モーダル表示時にイベントリスナー登録
watch(() => props.show, (newValue) => {
  if (newValue) {
    isLoading.value = false
    window.addEventListener('keydown', handleKeydown)
  } else {
    window.removeEventListener('keydown', handleKeydown)
  }
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
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
        aria-describedby="modal-description"
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
                name="i-heroicons-exclamation-triangle"
                class="w-6 h-6 text-red-600 dark:text-red-400"
                aria-hidden="true"
              />
              <h2 id="modal-title" class="text-lg font-semibold text-gray-900 dark:text-white">
                {{ title }}
              </h2>
            </div>

            <!-- 本文 -->
            <div class="px-6 py-5 space-y-4">
              <!-- 警告メッセージ -->
              <p id="modal-description" class="text-sm text-gray-600 dark:text-gray-400">
                {{ message }}
              </p>

              <!-- アイテム情報 -->
              <div class="bg-gray-50 dark:bg-slate-900/50 rounded-lg p-4 space-y-2">
                <div class="flex items-center gap-2">
                  <UIcon
                    :name="isFolder ? 'i-heroicons-folder' : 'i-heroicons-document'"
                    class="w-5 h-5 text-gray-500 dark:text-gray-400"
                    aria-hidden="true"
                  />
                  <span class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ item?.name }}
                  </span>
                </div>

                <!-- ファイルサイズ表示（ファイルの場合のみ） -->
                <div v-if="!isFolder && item?.size" class="text-xs text-gray-500 dark:text-gray-400">
                  サイズ: {{ formatFileSize(item.size) }}
                </div>
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
                color="red"
                :disabled="isLoading"
                :loading="isLoading"
                @click="confirmDelete"
              >
                削除
              </UButton>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
