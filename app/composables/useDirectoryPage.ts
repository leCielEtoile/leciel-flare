/**
 * ディレクトリページ共通ロジック
 * データフェッチ、パンくず生成、統計情報などを集約
 */
import type { BreadcrumbItem } from '~/types'

interface UseDirectoryPageOptions {
  path?: string
  isRoot?: boolean
}

export function useDirectoryPage(options: UseDirectoryPageOptions = {}) {
  const { path = '', isRoot = false } = options

  // APIエンドポイント生成
  const apiEndpoint = computed(() => {
    return isRoot ? '/api/directories' : `/api/directories/${path}`
  })

  // キャッシュキー生成
  const cacheKey = computed(() => {
    return isRoot ? 'root-directory' : `directory-${path}`
  })

  // ファイル一覧取得
  const { data: items, pending, error, refresh } = useFetch(
    () => apiEndpoint.value,
    {
      key: cacheKey.value,
      watch: [apiEndpoint]
    }
  )

  // パンくずナビゲーション生成
  const breadcrumbs = computed<BreadcrumbItem[]>(() => {
    if (isRoot) {
      return []
    }

    const paths = path.split('/').filter(Boolean)
    return [
      { label: 'Home', to: '/' },
      { label: 'ディレクトリ', to: '/dir/' },
      ...paths.map((name, index) => ({
        label: name,
        to: `/dir/${paths.slice(0, index + 1).join('/')}/`
      }))
    ]
  })

  // 現在のパス
  const currentPath = computed(() => path)

  // ファイル削除後の処理
  const handleFileDelete = () => {
    refresh()
  }

  // SEOメタタグ設定
  const setupSEO = (defaultTitle = 'ディレクトリ') => {
    const title = isRoot ? defaultTitle : `${path || defaultTitle} - leciel Flare`
    const description = isRoot
      ? 'Browse and manage files with leciel Flare'
      : `Browse directory: ${path}`

    useHead({
      title: `${title} - leciel Flare`,
      meta: [
        { name: 'description', content: description }
      ]
    })
  }

  return {
    items,
    pending,
    error,
    refresh,
    breadcrumbs,
    currentPath,
    handleFileDelete,
    setupSEO
  }
}
