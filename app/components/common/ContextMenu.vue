<script setup lang="ts">
/**
 * カスタムコンテキストメニューコンポーネント
 * 右クリックで表示される操作メニュー
 */
import { onClickOutside, onKeyStroke, useFocus } from '@vueuse/core'
import type { ContextMenuItem } from '~/types'

const props = defineProps<{
  show: boolean
  items: ContextMenuItem[]
  x: number
  y: number
}>()

const emit = defineEmits<{
  close: []
  select: [item: ContextMenuItem]
}>()

const menuRef = ref<HTMLDivElement | null>(null)
const focusedIndex = ref(0)

// メニューアイテムのみを抽出
const menuItems = computed(() => {
  return props.items.filter(item => !item.divider)
})

// メニュー位置の調整（画面外に出ないように）
const menuStyle = computed(() => {
  if (!menuRef.value) {
    return { left: `${props.x}px`, top: `${props.y}px` }
  }

  const rect = menuRef.value.getBoundingClientRect()
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight

  let left = props.x
  let top = props.y

  // 右端を超える場合は左に表示
  if (left + rect.width > viewportWidth) {
    left = viewportWidth - rect.width - 10
  }

  // 下端を超える場合は上に表示
  if (top + rect.height > viewportHeight) {
    top = viewportHeight - rect.height - 10
  }

  return {
    left: `${Math.max(0, left)}px`,
    top: `${Math.max(0, top)}px`
  }
})

// メニュー項目選択
const handleSelect = (item: ContextMenuItem) => {
  if (!item.disabled) {
    emit('select', item)
    emit('close')
  }
}

// VueUseを使用した外側クリック検出
onClickOutside(menuRef, () => {
  if (props.show) {
    emit('close')
  }
})

// VueUseを使用したキーボードナビゲーション
onKeyStroke('Escape', (e) => {
  if (props.show) {
    e.preventDefault()
    emit('close')
  }
})

onKeyStroke('ArrowDown', (e) => {
  if (props.show) {
    e.preventDefault()
    focusedIndex.value = (focusedIndex.value + 1) % menuItems.value.length
  }
})

onKeyStroke('ArrowUp', (e) => {
  if (props.show) {
    e.preventDefault()
    focusedIndex.value = (focusedIndex.value - 1 + menuItems.value.length) % menuItems.value.length
  }
})

onKeyStroke(['Enter', ' '], (e) => {
  if (props.show) {
    e.preventDefault()
    const item = menuItems.value[focusedIndex.value]
    if (item && !item.disabled) {
      handleSelect(item)
    }
  }
})

// フォーカス管理
const { focused } = useFocus(menuRef, { initialValue: false })

// メニュー表示時の初期化
watch(() => props.show, (newValue) => {
  if (newValue) {
    focusedIndex.value = 0
    nextTick(() => {
      focused.value = true
    })
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-all duration-100"
      leave-active-class="transition-all duration-100"
      enter-from-class="opacity-0 scale-95"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="show"
        ref="menuRef"
        :style="menuStyle"
        class="fixed z-60 min-w-[200px] bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-xl shadow-2xl border border-gray-200/80 dark:border-slate-600/80 py-2 overflow-hidden"
        role="menu"
        tabindex="-1"
        aria-label="コンテキストメニュー"
        @click.stop
      >
        <div
          v-for="(item, index) in items"
          :key="index"
          class="relative"
        >
          <!-- 区切り線 -->
          <div
            v-if="item.divider"
            class="my-1 border-t border-gray-200 dark:border-gray-700"
          />

          <!-- メニュー項目 -->
          <button
            v-else
            :disabled="item.disabled"
            :class="[
              'w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-all duration-200 rounded-md mx-1',
              item.disabled
                ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                : item.danger
                ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 hover:shadow-sm'
                : 'text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-slate-700 hover:shadow-sm hover:translate-x-0.5',
            ]"
            role="menuitem"
            :aria-disabled="item.disabled"
            @click.stop="handleSelect(item)"
          >
            <!-- アイコン -->
            <UIcon
              v-if="item.icon"
              :name="item.icon"
              class="w-4 h-4 shrink-0"
            />

            <!-- ラベル -->
            <span class="flex-1">{{ item.label }}</span>

            <!-- ショートカットキー表示 -->
            <span
              v-if="item.shortcut"
              class="text-xs text-gray-400 dark:text-gray-600"
            >
              {{ item.shortcut }}
            </span>
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
