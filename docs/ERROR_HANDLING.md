# エラーハンドリングガイド

このドキュメントでは、leciel Flareにおける一貫したエラーハンドリングの実装方法を説明します。

## 概要

すべてのサーバーAPIハンドラーで統一されたエラー処理を実装しています：

- **エラーコードの定数化**: `ERROR_CODES` による一貫したエラー識別
- **型安全なエラーレスポンス**: `ApiError` 型による型安全性
- **統一されたエラーハンドリング**: `handleApiError` と `createApiError` ユーティリティ
- **グローバルエラーログ**: Nitroプラグインによる統一されたエラーログ

## エラーコード定数

すべてのエラーコードは [`server/types/error.ts`](../server/types/error.ts) で定義されています：

```typescript
import { ERROR_CODES } from '~/server/types/error'

// 利用可能なエラーコード
ERROR_CODES.UNAUTHORIZED          // 認証エラー
ERROR_CODES.FORBIDDEN             // 認可エラー
ERROR_CODES.INVALID_REQUEST       // 不正なリクエスト
ERROR_CODES.MISSING_PARAMETER     // パラメータ不足
ERROR_CODES.INVALID_FILE_NAME     // 無効なファイル名
ERROR_CODES.FILE_NOT_FOUND        // ファイル未検出
ERROR_CODES.FOLDER_NOT_FOUND      // フォルダ未検出
ERROR_CODES.ALREADY_EXISTS        // リソース重複
ERROR_CODES.FILE_TOO_LARGE        // ファイルサイズ超過
ERROR_CODES.INVALID_MIME_TYPE     // 無効なMIMEタイプ
ERROR_CODES.INTERNAL_ERROR        // 内部エラー
ERROR_CODES.UPLOAD_FAILED         // アップロード失敗
```

## エラーの作成

### createApiError の使用

エラーコード付きのエラーを作成する場合：

```typescript
import { createApiError } from '~/server/utils/error'
import { ERROR_CODES } from '~/server/types/error'

// 基本的な使用
throw createApiError(
  400,
  'ファイルが指定されていません',
  ERROR_CODES.MISSING_PARAMETER
)

// 詳細情報付き
throw createApiError(
  413,
  `ファイルサイズが制限を超えています`,
  ERROR_CODES.FILE_TOO_LARGE,
  { maxSize: 10485760, uploadedSize: 15728640 }
)

// 404エラー
throw createApiError(
  404,
  'ファイルが見つかりません',
  ERROR_CODES.FILE_NOT_FOUND
)
```

## エラーハンドリング

### handleApiError の使用

APIハンドラー内でのエラーキャッチに使用：

```typescript
import { handleApiError } from '~/server/utils/error'

export default defineEventHandler(async (event) => {
  try {
    // API処理
    const result = await someOperation()
    return { success: true, data: result }
  } catch (error) {
    // 統一されたエラーハンドリング
    handleApiError(error, 'Operation Name')
  }
})
```

`handleApiError` の動作：
- **既知のエラー**（`statusCode`付き）: そのまま再スロー
- **未知のエラー**: 500エラーに変換して再スロー
- **開発環境**: 詳細なエラー情報をログ出力
- **本番環境**: 最小限のログのみ出力

## APIハンドラーの実装パターン

### 推奨パターン

```typescript
/**
 * サンプルAPI
 * POST /api/sample
 */
import { handleApiError, createApiError } from '~/server/utils/error'
import { ERROR_CODES } from '~/server/types/error'

export default defineEventHandler(async (event) => {
  // 認証チェック（必要に応じて）
  await requireGuildMembership(event)

  try {
    // リクエストデータの取得
    const body = await readBody(event)

    // バリデーション
    if (!body.requiredField) {
      throw createApiError(
        400,
        '必須フィールドが指定されていません',
        ERROR_CODES.MISSING_PARAMETER
      )
    }

    // ビジネスロジック
    const result = await performOperation(body)

    // 成功レスポンス
    return {
      success: true,
      data: result
    }
  } catch (error) {
    // エラーハンドリング
    handleApiError(error, 'Sample API')
  }
})
```

## エラーレスポンス形式

すべてのエラーレスポンスは以下の形式で返されます：

```typescript
{
  statusCode: 400,
  statusMessage: "Bad Request",
  message: "ファイルが指定されていません",
  data: {
    code: "MISSING_PARAMETER",
    // 追加の詳細情報（オプション）
    details?: {
      maxSize: 10485760,
      uploadedSize: 15728640
    }
  }
}
```

## 実装済みAPI

以下のAPIエンドポイントで一貫したエラーハンドリングが実装されています：

- ✅ [`server/api/upload.post.ts`](../server/api/upload.post.ts) - ファイルアップロード
- ✅ [`server/api/folders/[...path].post.ts`](../server/api/folders/[...path].post.ts) - フォルダ作成
- ✅ [`server/api/files/[...path].delete.ts`](../server/api/files/[...path].delete.ts) - ファイル削除
- ✅ [`server/api/folders/[...path].delete.ts`](../server/api/folders/[...path].delete.ts) - フォルダ削除

## グローバルエラーハンドリング

### Nitroプラグイン

[`server/plugins/error-handler.ts`](../server/plugins/error-handler.ts) により、すべてのエラーが統一された形式でログ出力されます。

### エラーミドルウェア

[`server/middleware/error.ts`](../server/middleware/error.ts) により、エラーレスポンスのログ出力が行われます。

## ベストプラクティス

1. **常にエラーコードを使用**
   - `createApiError` を使用してエラーコードを付与
   - カスタムエラーメッセージでユーザーフレンドリーに

2. **適切なHTTPステータスコード**
   - 400: バリデーションエラー
   - 401: 認証エラー
   - 403: 認可エラー
   - 404: リソース未検出
   - 409: リソース重複
   - 413: ファイルサイズ超過
   - 415: 無効なMIMEタイプ
   - 500: サーバー内部エラー

3. **コンテキスト情報の提供**
   - `handleApiError` の第2引数でコンテキストを指定
   - ログから問題箇所を特定しやすくする

4. **詳細情報の追加（必要に応じて）**
   - `createApiError` の第4引数で追加情報を提供
   - デバッグやクライアント側の処理に有用

5. **セキュリティ考慮**
   - 本番環境では機密情報を含めない
   - スタックトレースは開発環境のみ

## 新しいエラーコードの追加

新しいエラーコードが必要な場合は、[`server/types/error.ts`](../server/types/error.ts) に追加してください：

```typescript
export const ERROR_CODES = {
  // ... 既存のコード

  // 新しいエラーコード
  NEW_ERROR_CODE: 'NEW_ERROR_CODE',
} as const
```

## 参考資料

- [H3 Error Handling](https://h3.unjs.io/guide/errors)
- [Nuxt Error Handling](https://nuxt.com/docs/getting-started/error-handling)
- [HTTP Status Codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)
