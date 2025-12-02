/**
 * 認証状態管理Composable
 */

export function useAuth() {
  const config = useRuntimeConfig()
  const { data: session, refresh: refreshSession, error, status } = useFetch('/api/auth/session', {
    key: 'auth-session'
  })

  const isLoggedIn = computed(() => session.value?.loggedIn ?? false)
  const user = computed(() => session.value?.user ?? null)
  const isLoading = computed(() => status.value === 'pending')
  const hasError = computed(() => !!error.value)
  const errorMessage = computed(() => error.value?.message ?? null)

  // 開発モードかどうかを判定
  const isDevelopment = computed(() => {
    return process.dev || !config.public.siteUrl?.startsWith('https://')
  })

  const login = () => {
    navigateTo('/api/auth/discord', { external: true })
  }

  // 開発モード専用のテストログイン
  const devLogin = async () => {
    try {
      await $fetch('/api/auth/dev-login', { method: 'POST' })
      await refreshSession()
    } catch (error) {
      console.error('Dev login failed:', error)
    }
  }

  const logout = async () => {
    try {
      await $fetch('/api/auth/logout', { method: 'POST' })
      await refreshSession()
      await navigateTo('/')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return {
    isLoggedIn,
    user,
    isLoading,
    hasError,
    error: errorMessage,
    isDevelopment,
    login,
    devLogin,
    logout,
    refreshSession
  }
}
