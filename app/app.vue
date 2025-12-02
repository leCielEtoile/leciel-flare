<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup>
const colorMode = useColorMode()

onMounted(() => {
  const savedTheme = localStorage.getItem('leciel-flare-theme')
  if (savedTheme) {
    colorMode.preference = savedTheme
  }
})
</script>
