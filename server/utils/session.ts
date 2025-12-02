/**
 * セッション管理ユーティリティ
 */

import type { H3Event } from 'h3'
import type { SessionData, UserSession } from '../types/auth'
import { AUTH_CONSTANTS } from '../config/constants'
import { logger } from './logger'

/**
 * セッションをKVに保存
 */
export async function saveSessionToKV(
  event: H3Event,
  sessionId: string,
  sessionData: SessionData
): Promise<void> {
  const kv = event.context.cloudflare?.env?.AUTH_SESSIONS

  if (!kv) {
    throw new Error('AUTH_SESSIONS KV namespace not configured')
  }

  const key = `session:${sessionId}`
  await kv.put(key, JSON.stringify(sessionData), {
    expirationTtl: AUTH_CONSTANTS.SESSION_TTL_SECONDS
  })
}

/**
 * KVからセッションを取得
 */
export async function getSessionFromKV(
  event: H3Event,
  sessionId: string
): Promise<SessionData | null> {
  const kv = event.context.cloudflare?.env?.AUTH_SESSIONS

  if (!kv) {
    throw new Error('AUTH_SESSIONS KV namespace not configured')
  }

  const key = `session:${sessionId}`
  const data = await kv.get(key, 'text')

  if (!data) {
    return null
  }

  try {
    return JSON.parse(data) as SessionData
  } catch (error) {
    logger.error('Session', 'セッションデータのパース失敗', {
      sessionId,
      error: error instanceof Error ? error.message : String(error)
    })
    return null
  }
}

/**
 * KVからセッションを削除
 */
export async function deleteSessionFromKV(
  event: H3Event,
  sessionId: string
): Promise<void> {
  const kv = event.context.cloudflare?.env?.AUTH_SESSIONS

  if (!kv) {
    throw new Error('AUTH_SESSIONS KV namespace not configured')
  }

  const key = `session:${sessionId}`
  await kv.delete(key)
}

/**
 * SessionDataからUserSessionに変換
 */
export function sessionDataToUserSession(sessionData: SessionData): UserSession {
  return {
    user: {
      id: sessionData.userId,
      discordId: sessionData.discordId,
      username: sessionData.username,
      displayName: sessionData.globalName || sessionData.username,
      avatar: sessionData.avatar
    },
    loggedInAt: sessionData.createdAt
  }
}

/**
 * ランダムなセッションIDを生成
 * 暗号学的に安全な32バイトのランダム値を16進数文字列として返す
 */
export function generateSessionId(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * セッションの有効性を検証
 * @param sessionData - 検証するセッションデータ
 * @returns 有効な場合true、期限切れの場合false
 */
export function isSessionValid(sessionData: SessionData): boolean {
  const now = Date.now()
  return sessionData.expiresAt > now
}

/**
 * セッションの残り時間を取得（ミリ秒）
 * @param sessionData - セッションデータ
 * @returns 残り時間（ミリ秒）、負の値は期限切れを示す
 */
export function getSessionTimeRemaining(sessionData: SessionData): number {
  const now = Date.now()
  return sessionData.expiresAt - now
}

/**
 * セッションの有効期限を延長
 * @param event - H3Event
 * @param sessionId - セッションID
 * @param sessionData - 現在のセッションデータ
 * @returns 更新されたセッションデータ
 */
export async function renewSession(
  event: H3Event,
  sessionId: string,
  sessionData: SessionData
): Promise<SessionData> {
  const now = Date.now()
  const updatedSessionData: SessionData = {
    ...sessionData,
    expiresAt: now + AUTH_CONSTANTS.SESSION_TTL_MS
  }

  await saveSessionToKV(event, sessionId, updatedSessionData)
  return updatedSessionData
}

/**
 * セッションを検証し、必要に応じて更新
 * @param event - H3Event
 * @param sessionId - セッションID
 * @param sessionData - セッションデータ
 * @param autoRenew - 残り時間が1日未満の場合に自動更新するか（デフォルト: true）
 * @returns 検証結果と更新されたセッションデータ（更新された場合）
 */
export async function validateSession(
  event: H3Event,
  sessionId: string,
  sessionData: SessionData,
  autoRenew: boolean = true
): Promise<{ valid: boolean; sessionData?: SessionData; renewed?: boolean }> {
  // 有効期限チェック
  if (!isSessionValid(sessionData)) {
    // 期限切れのセッションを削除
    await deleteSessionFromKV(event, sessionId)
    return { valid: false }
  }

  // 自動更新チェック（残り時間が1日未満の場合）
  const oneDayInMs = 24 * 60 * 60 * 1000
  const timeRemaining = getSessionTimeRemaining(sessionData)

  if (autoRenew && timeRemaining < oneDayInMs) {
    const renewedSessionData = await renewSession(event, sessionId, sessionData)
    logger.info('Session', 'セッション自動更新完了', {
      sessionId,
      timeRemainingMinutes: Math.floor(timeRemaining / 1000 / 60)
    })
    return {
      valid: true,
      sessionData: renewedSessionData,
      renewed: true
    }
  }

  return {
    valid: true,
    sessionData,
    renewed: false
  }
}
