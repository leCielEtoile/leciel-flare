/**
 * バリデーションユーティリティ
 */
import { UPLOAD_CONSTANTS } from '../config/constants'

/**
 * パスをサニタイズする
 * 相対パスコンポーネント、危険な文字、空のセグメントを除去
 * @param path - サニタイズするパス
 * @returns 正規化されたパス
 */
export function sanitizePath(path: string): string {
  if (!path) {
    return ''
  }

  // 危険な文字を除去: < > : " | ? *
  const dangerousCharsRemoved = path.replace(/[<>:"|?*]/g, '')

  // パスをセグメントに分割
  const segments = dangerousCharsRemoved.split('/')

  // 相対パスコンポーネント（.. と .）と空のセグメントを除去
  const sanitizedSegments = segments.filter(segment => {
    return segment !== '..' && segment !== '.' && segment !== ''
  })

  // 再結合
  return sanitizedSegments.join('/')
}

/**
 * パスが安全かどうかを検証する
 * @param path - 検証するパス
 * @returns 安全な場合true
 */
export function isValidPath(path: string): boolean {
  if (!path) {
    return false
  }

  // 危険な文字が含まれていないか
  if (/[<>:"|?*]/.test(path)) {
    return false
  }

  // 相対パスコンポーネントが含まれていないか
  const segments = path.split('/')
  for (const segment of segments) {
    if (segment === '..' || segment === '.') {
      return false
    }
  }

  return true
}

/**
 * ファイル名をサニタイズする
 * 危険な文字を除去/置換し、長さを制限
 * @param filename - サニタイズするファイル名
 * @returns 正規化されたファイル名
 */
export function sanitizeFileName(filename: string): string {
  if (!filename) {
    return ''
  }

  // Null文字を除去
  let sanitized = filename.replace(/\0/g, '')

  // 制御文字を除去
  sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '')

  // パス区切り文字を除去（Unix/Windows両対応）
  sanitized = sanitized.replace(/[/\\]/g, '_')

  // 危険な文字を除去: < > : " | ? *
  sanitized = sanitized.replace(/[<>:"|?*]/g, '')

  // 先頭・末尾のスペースやドットを除去
  sanitized = sanitized.trim().replace(/^\.+|\.+$/g, '')

  // 連続するスペースを1つに
  sanitized = sanitized.replace(/\s+/g, ' ')

  // ファイル名が空になった場合のフォールバック
  if (!sanitized) {
    sanitized = 'unnamed_file'
  }

  // 長さ制限
  if (sanitized.length > UPLOAD_CONSTANTS.MAX_FILENAME_LENGTH) {
    // 拡張子を保持しながらトリミング
    const lastDotIndex = sanitized.lastIndexOf('.')
    if (lastDotIndex > 0 && lastDotIndex < sanitized.length - 1) {
      const extension = sanitized.slice(lastDotIndex)
      const nameWithoutExt = sanitized.slice(0, lastDotIndex)
      const maxNameLength = UPLOAD_CONSTANTS.MAX_FILENAME_LENGTH - extension.length
      sanitized = nameWithoutExt.slice(0, maxNameLength) + extension
    } else {
      sanitized = sanitized.slice(0, UPLOAD_CONSTANTS.MAX_FILENAME_LENGTH)
    }
  }

  return sanitized
}

/**
 * MIMEタイプが許可されているかを検証
 * @param mimeType - 検証するMIMEタイプ
 * @returns 許可されている場合true
 */
export function isAllowedMimeType(mimeType: string): boolean {
  if (!mimeType) {
    return false
  }

  // 明示的にブロックされているタイプをチェック
  if (UPLOAD_CONSTANTS.BLOCKED_MIME_TYPES.includes(mimeType)) {
    return false
  }

  // 許可パターンにマッチするかチェック
  return UPLOAD_CONSTANTS.ALLOWED_MIME_PATTERNS.some(pattern => pattern.test(mimeType))
}

/**
 * ファイルサイズが制限内かを検証
 * @param fileSize - ファイルサイズ（バイト）
 * @param maxSize - 最大サイズ（バイト）
 * @returns 制限内の場合true
 */
export function isValidFileSize(fileSize: number, maxSize: number = UPLOAD_CONSTANTS.DEFAULT_MAX_FILE_SIZE): boolean {
  return fileSize > 0 && fileSize <= maxSize
}

/**
 * ファイルサイズを人間が読みやすい形式に変換
 * @param bytes - バイト数
 * @returns フォーマットされた文字列（例: "10.5 MB"）
 */
export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let size = bytes
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`
}
