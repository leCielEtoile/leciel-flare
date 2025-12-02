/**
 * クリップボード操作用composable
 * UI_REQUIREMENTS.md セクション3.Eに準拠
 */

export function useClipboard() {
  const toast = useToast()

  /**
   * パスをクリップボードにコピー
   */
  const copyPath = async (path: string) => {
    try {
      await navigator.clipboard.writeText(path)
      toast.add({
        title: 'コピー完了',
        description: 'パスをクリップボードにコピーしました',
        color: 'green',
        icon: 'i-heroicons-check-circle',
        timeout: 2000
      })
      return true
    } catch (error) {
      console.error('パスコピーエラー:', error)
      toast.add({
        title: 'コピー失敗',
        description: 'パスのコピーに失敗しました',
        color: 'red',
        icon: 'i-heroicons-exclamation-triangle'
      })
      return false
    }
  }

  /**
   * URLをクリップボードにコピー
   */
  const copyLink = async (path: string) => {
    try {
      const url = `${window.location.origin}/file/${path}`
      await navigator.clipboard.writeText(url)
      toast.add({
        title: 'コピー完了',
        description: 'リンクをクリップボードにコピーしました',
        color: 'green',
        icon: 'i-heroicons-check-circle',
        timeout: 2000
      })
      return true
    } catch (error) {
      console.error('リンクコピーエラー:', error)
      toast.add({
        title: 'コピー失敗',
        description: 'リンクのコピーに失敗しました',
        color: 'red',
        icon: 'i-heroicons-exclamation-triangle'
      })
      return false
    }
  }

  return {
    copyPath,
    copyLink
  }
}
