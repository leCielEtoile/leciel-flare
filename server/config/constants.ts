/**
 * アプリケーション定数
 */

/**
 * 認証関連の定数
 */
export const AUTH_CONSTANTS = {
  /** セッションTTL（秒） - 7日間 */
  SESSION_TTL_SECONDS: 604800,

  /** セッションTTL（ミリ秒） - 7日間 */
  SESSION_TTL_MS: 604800000,

  /** OAuth state TTL（秒） - 10分 */
  OAUTH_STATE_TTL_SECONDS: 600,

  /** セッションCookie名 */
  SESSION_COOKIE_NAME: 'session_id',

  /** OAuth state Cookie名 */
  OAUTH_STATE_COOKIE_NAME: 'oauth_state'
} as const

/**
 * アップロード関連の定数
 */
export const UPLOAD_CONSTANTS = {
  /** デフォルトのファイルサイズ上限（バイト） - 500MB */
  DEFAULT_MAX_FILE_SIZE: 500 * 1024 * 1024,

  /** ファイル名の最大長 */
  MAX_FILENAME_LENGTH: 255,

  /** 許可されるMIMEタイプのパターン */
  ALLOWED_MIME_PATTERNS: [
    /^image\//,
    /^video\//,
    /^audio\//,
    /^application\/pdf$/,
    /^text\//,
    /^application\/zip$/,
    /^application\/x-zip-compressed$/
  ],

  /** 明示的に拒否されるMIMEタイプ */
  BLOCKED_MIME_TYPES: [
    'application/x-executable',
    'application/x-msdownload',
    'application/x-msdos-program',
    'application/x-dosexec',
    'application/x-sh',
    'application/x-csh',
    'application/x-bat',
    'application/x-exe',
    'application/vnd.microsoft.portable-executable'
  ]
} as const
