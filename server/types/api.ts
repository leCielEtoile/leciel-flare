/**
 * API レスポンス型定義
 */

/**
 * 共通APIレスポンス型
 */
export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data?: T
}

/**
 * エラーレスポンス型
 */
export interface ApiErrorResponse {
  success: false
  message: string
  statusCode: number
  error?: string
}

/**
 * アップロードAPIレスポンス型
 */
export interface UploadResponse {
  success: true
  message: string
  file: {
    name: string
    path: string
    size: number
  }
}

/**
 * 削除APIレスポンス型
 */
export interface DeleteResponse {
  success: true
  message: string
  path: string
}

/**
 * フォルダ削除APIレスポンス型
 */
export interface FolderDeleteResponse extends DeleteResponse {
  deletedCount: number
}

/**
 * セッション情報レスポンス型
 */
export interface SessionResponse {
  loggedIn: boolean
  user: {
    id: string
    discordId: string
    username: string
    displayName: string
    avatar: string | null
  } | null
}

/**
 * ログアウトレスポンス型
 */
export interface LogoutResponse {
  success: true
  message: string
}
