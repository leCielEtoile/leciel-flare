/**
 * Cloudflare Workers型定義
 * Nitro環境でCloudflare Bindingsにアクセスするための型定義
 */
declare module 'h3' {
  interface H3EventContext {
    cloudflare: {
      env: {
        MY_BUCKET: R2Bucket
        UPLOAD_METADATA: KVNamespace
        AUTH_SESSIONS: KVNamespace
        MAX_UPLOAD_SIZE?: string
        ENVIRONMENT?: string
      }
    }
  }
}

export {}
