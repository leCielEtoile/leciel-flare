/**
 * アプリケーション全体で使用する型定義
 */

/**
 * ファイル/フォルダアイテム
 */
export interface FileItem {
  /** ファイル/フォルダ名 */
  name: string
  /** フルパス */
  path: string
  /** タイプ */
  type: 'file' | 'folder'
  /** ファイルサイズ（バイト） */
  size?: number
  /** 最終更新日時 */
  lastModified?: string | Date
  /** 変更日時（後方互換性のため残す） */
  modifiedAt?: string
  /** MIMEタイプ（ファイルのみ） */
  mimeType?: string
  /** カスタムメタデータ */
  metadata?: Record<string, any>
}

/**
 * DirectoryItemはFileItemのエイリアス（後方互換性のため）
 */
export type DirectoryItem = FileItem

/**
 * コンテキストメニューアイテム
 */
export interface ContextMenuItem {
  /** ラベル（dividerの場合は不要） */
  label?: string
  /** アイコン名（Nuxt UIのアイコン形式） */
  icon?: string
  /** キーボードショートカット表示 */
  shortcut?: string
  /** クリック時のアクション */
  action?: () => void | Promise<void>
  /** 無効化フラグ */
  disabled?: boolean
  /** 危険なアクションフラグ（赤色表示） */
  danger?: boolean
  /** 区切り線フラグ */
  divider?: boolean
}

/**
 * ディレクトリ統計情報
 */
export interface DirectoryStats {
  /** フォルダ数 */
  folders: number
  /** ファイル数 */
  files: number
  /** 合計サイズ（バイト） */
  totalSize?: number
}

/**
 * FileStatisticsはDirectoryStatsのエイリアス（後方互換性のため）
 */
export type FileStatistics = DirectoryStats

/**
 * パンくずナビゲーションアイテム
 */
export interface BreadcrumbItem {
  /** 表示ラベル */
  label: string
  /** リンク先 */
  to: string
  /** アイコン名（オプション） */
  icon?: string
}

/**
 * アップロードファイル情報
 */
export interface UploadFileInfo {
  /** ファイル名 */
  name: string
  /** ファイルサイズ */
  size: number
  /** アップロード先パス */
  path: string
  /** アップロード進捗（0-100） */
  progress?: number
  /** アップロード状態 */
  status?: 'pending' | 'uploading' | 'completed' | 'error'
  /** エラーメッセージ */
  error?: string
}
