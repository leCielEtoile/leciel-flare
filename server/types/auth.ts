/**
 * Discord OAuth2関連の型定義
 */

// Discordユーザー情報
export interface DiscordUser {
  id: string
  username: string
  global_name: string | null
  avatar: string | null
}

// Discordギルド（サーバー）情報
export interface DiscordGuild {
  id: string
  name: string
  icon: string | null
  owner: boolean
  permissions: string
}

// Discord OAuth2トークンレスポンス
export interface DiscordTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token: string
  scope: string
}

// セッションデータ
export interface SessionData {
  userId: string // 内部ユーザーID
  discordId: string // Discord User ID
  username: string // Discord Username
  globalName: string | null // Discord Global Name
  avatar: string | null // Avatar hash
  guilds: string[] // 参加しているギルドID配列
  createdAt: number // Unix timestamp
  expiresAt: number // Unix timestamp
}

// ユーザーセッション（クライアント向け）
// nuxt-auth-utilsのUserSessionと互換性を持たせるため、
// 必要な追加フィールドを含める
export interface UserSession extends Record<string, any> {
  user: {
    id: string
    discordId: string
    username: string
    displayName: string
    avatar: string | null
  }
  loggedInAt: number
}
