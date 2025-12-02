# Discord認証セットアップガイド

このガイドでは、leciel FlareにDiscord OAuth2認証を設定する手順を説明します。

## 前提条件

- Discord Developer Portal へのアクセス
- Cloudflare Workers アカウント
- Wrangler CLI インストール済み

---

## Step 1: Discord OAuth2アプリケーションの作成

### 1.1 Discord Developer Portalにアクセス

1. [Discord Developer Portal](https://discord.com/developers/applications) にアクセス
2. 「New Application」をクリック
3. アプリケーション名を入力（例: "leciel Flare"）

### 1.2 OAuth2設定

1. 左メニューから「OAuth2」→「General」を選択
2. **Client ID**をコピー（後で使用）
3. 「Reset Secret」をクリックして**Client Secret**を生成・コピー

### 1.3 Redirect URIsの設定

「Redirects」セクションで以下のURLを追加:

**開発環境:**
```
http://localhost:3000/api/auth/discord/callback
```

**本番環境:**
```
https://your-domain.com/api/auth/discord/callback
```

（`your-domain.com`を実際のドメインに置き換える）

### 1.4 必要なスコープ

OAuth2 URLジェネレーターで以下のスコープを選択:
- `identify` - ユーザー情報取得
- `guilds` - サーバー一覧取得

---

## Step 2: Discord サーバーIDの取得

認可対象のDiscordサーバー（ギルド）IDを取得します。

### 方法1: Discord アプリから取得

1. Discordアプリで「設定」→「詳細設定」を開く
2. 「開発者モード」を有効化
3. 対象サーバーを右クリック→「サーバーIDをコピー」

### 方法2: Discord Web版から取得

1. Discord Web版でサーバーを開く
2. URLの数字部分がサーバーID
   ```
   https://discord.com/channels/123456789012345678/...
                                 ^^^^^^^^^^^^^^^^^^
                                  これがサーバーID
   ```

---

## Step 3: 環境変数の設定

### 3.1 ローカル開発環境

プロジェクトルートに `.env` ファイルを作成:

```bash
cp .env.example .env
```

`.env` ファイルを編集:

```env
# Discord OAuth2設定
DISCORD_CLIENT_ID=your_discord_client_id_here
DISCORD_CLIENT_SECRET=your_discord_client_secret_here

# 認可対象のDiscordサーバーID
DISCORD_GUILD_ID=your_discord_server_id_here

# セッション暗号化キー（32文字以上のランダムな文字列）
NUXT_SESSION_PASSWORD=your-32-character-or-longer-secret-key-here

# OAuth2設定（Discordの値を自動参照）
NUXT_OAUTH_DISCORD_CLIENT_ID=${DISCORD_CLIENT_ID}
NUXT_OAUTH_DISCORD_CLIENT_SECRET=${DISCORD_CLIENT_SECRET}

# サイトURL（本番環境では変更）
NUXT_PUBLIC_SITE_URL=http://localhost:3000
```

**重要:** `.env`ファイルは`.gitignore`に含まれているため、Gitにコミットされません。

### 3.2 セッション暗号化キーの生成

以下のコマンドでランダムなキーを生成できます:

```bash
# Node.jsを使用
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# OpenSSLを使用
openssl rand -base64 32
```

生成されたキーを`NUXT_SESSION_PASSWORD`に設定してください。

### 3.3 本番環境（Cloudflare Workers）

Wrangler CLI を使用してシークレットを設定:

```bash
# DISCORD_CLIENT_SECRETを設定
wrangler secret put DISCORD_CLIENT_SECRET --env production
# プロンプトでClient Secretを入力

# NUXT_SESSION_PASSWORDを設定
wrangler secret put NUXT_SESSION_PASSWORD --env production
# プロンプトでセッションパスワードを入力
```

`wrangler.toml`に環境変数を追加（既に設定済み）:

```toml
[env.production.vars]
DISCORD_CLIENT_ID = "your_production_discord_client_id"
DISCORD_GUILD_ID = "your_production_discord_server_id"
NUXT_PUBLIC_SITE_URL = "https://your-domain.com"
```

---

## Step 4: Cloudflare KV ネームスペースの作成

### 4.1 KVネームスペースの作成

```bash
# AUTH_SESSIONSネームスペース作成
wrangler kv:namespace create AUTH_SESSIONS
wrangler kv:namespace create AUTH_SESSIONS --preview

# 出力例:
# { binding = "AUTH_SESSIONS", id = "abc123..." }
# { binding = "AUTH_SESSIONS", preview_id = "xyz789..." }
```

### 4.2 wrangler.tomlの更新

出力されたIDを `wrangler.toml` に設定:

```toml
# 開発環境
[[kv_namespaces]]
binding = "AUTH_SESSIONS"
id = "preview_id_from_output"
preview_id = "preview_id_from_output"

# 本番環境
[[env.production.kv_namespaces]]
binding = "AUTH_SESSIONS"
id = "production_id_from_output"
```

---

## Step 5: 動作確認

### 5.1 開発サーバー起動

```bash
npm run dev
```

### 5.2 認証フローのテスト

1. ブラウザで `http://localhost:3000` を開く
2. 「Discordでログイン」ボタンをクリック
3. Discordの認証ページにリダイレクト
4. 「認証」をクリック
5. アプリケーションにリダイレクトされる

### 5.3 確認ポイント

- ✅ ヘッダーにユーザー名が表示される
- ✅ ドロップダウンメニューから「ログアウト」が可能
- ✅ ファイルアップロードが可能（認証済みのみ）
- ✅ 未認証時はアップロード時に401エラー

---

## Step 6: 本番デプロイ

### 6.1 ビルド&デプロイ

```bash
npm run deploy
```

### 6.2 本番環境での確認

1. 本番URLにアクセス
2. Discord認証フローをテスト
3. セッションの永続性を確認（ページリロード後もログイン状態維持）

---

## トラブルシューティング

### エラー: `invalid_request`

**原因:** 環境変数が正しく設定されていない

**解決策:**
1. `.env`ファイルの内容を確認
2. 開発サーバーを再起動

### エラー: `invalid_state`

**原因:** CSRF保護によるstateパラメータの不一致

**解決策:**
1. Cookieが有効になっているか確認
2. ブラウザのキャッシュをクリア
3. 開発サーバーを再起動

### エラー: `unauthorized_server`

**原因:** ユーザーが指定されたDiscordサーバーに参加していない

**解決策:**
1. `DISCORD_GUILD_ID`が正しいか確認
2. ユーザーが対象サーバーに参加しているか確認

### エラー: `AUTH_SESSIONS KV namespace not configured`

**原因:** KVネームスペースが正しく設定されていない

**解決策:**
1. `wrangler kv:namespace create AUTH_SESSIONS`を実行
2. `wrangler.toml`に正しいIDを設定
3. 開発サーバーを再起動

### 401エラー: `Authentication required`

**原因:** ファイルアップロード時に認証が必要

**解決策:**
1. Discordでログインしているか確認
2. セッションが有効か確認（7日間で自動期限切れ）

---

## セキュリティのベストプラクティス

1. **環境変数の管理**
   - `.env`ファイルは絶対にGitにコミットしない
   - 本番環境ではWrangler Secretsを使用

2. **セッションパスワード**
   - 32文字以上のランダムな文字列を使用
   - 定期的に更新する

3. **Discord Client Secret**
   - 決して公開リポジトリに含めない
   - チーム内でも慎重に共有

4. **HTTPS必須**
   - 本番環境では必ずHTTPSを使用
   - Cloudflare Workersは自動対応

---

## 認証フローの詳細

```
1. ユーザーが「ログイン」をクリック
   ↓
2. /api/auth/discord にアクセス
   ↓
3. Discord認証ページにリダイレクト
   ↓
4. ユーザーが認証を許可
   ↓
5. /api/auth/discord/callback にリダイレクト
   ↓
6. 認証コードをトークンに交換
   ↓
7. Discordユーザー情報を取得
   ↓
8. Discordサーバー一覧を取得
   ↓
9. 指定サーバーへの参加を確認
   ↓
10. セッションをKVに保存
    ↓
11. Cookieにセッション ID を保存
    ↓
12. /dir にリダイレクト
```

---

## サポート

問題が解決しない場合は、以下を確認してください:

1. [要件定義書](./AUTHENTICATION_REQUIREMENTS.md) - 詳細な技術仕様
2. Discord Developer Portal のエラーログ
3. ブラウザのコンソールログ
4. サーバーログ（`console.log`出力）

---

**Document Version**: 1.0
**Last Updated**: 2025-11-23
**Author**: Claude (Anthropic)
**Project**: leciel Flare - File Browser
