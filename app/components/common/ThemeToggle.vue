<script setup>
/**
 * テーマ切り替えコンポーネント
 * ライト/ダークモードを切り替え
 */

const colorMode = useColorMode()

const toggleTheme = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

const isDark = computed(() => colorMode.value === 'dark')
</script>

<template>
  <UButton
    :icon="isDark ? 'i-heroicons-moon' : 'i-heroicons-sun'"
    color="gray"
    variant="ghost"
    @click="toggleTheme"
    aria-label="テーマ切り替え"
  />
</template>
