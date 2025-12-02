/**
 * 現在のセッション情報を取得
 * GET /api/auth/session
 */

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)

  if (!session || !session.user) {
    return {
      loggedIn: false,
      user: null
    }
  }

  return {
    loggedIn: true,
    user: session.user
  }
})
