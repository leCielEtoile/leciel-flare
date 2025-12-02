# コンポーネント構造ガイドライン

## ディレクトリ構造

```
app/components/
├── common/              # 共通コンポーネント
│   ├── ContextMenu.vue
│   └── ThemeToggle.vue
├── directory/           # ディレクトリページ関連
│   ├── FileItem.vue
│   └── Layout.vue
├── modal/               # モーダルコンポーネント
│   ├── CreateFolder.vue
│   └── DeleteConfirm.vue
└── upload/              # アップロード関連
    └── DropZone.vue
```

## 命名規則

### ディレクトリ名
- **小文字のケバブケース**を使用
- 例: `common/`, `directory/`, `modal/`, `upload/`

### ファイル名
- **PascalCase**を使用（Nuxt推奨）
- 例: `ContextMenu.vue`, `FileItem.vue`, `CreateFolder.vue`

### コンポーネント名（使用時）

Nuxtのauto-importにより、以下のようにコンポーネント名が自動生成されます：

| ファイルパス | 使用時のコンポーネント名 |
|-------------|------------------------|
| `common/ContextMenu.vue` | `<CommonContextMenu>` または `<ContextMenu>` |
| `common/ThemeToggle.vue` | `<CommonThemeToggle>` または `<ThemeToggle>` |
| `directory/FileItem.vue` | `<DirectoryFileItem>` または `<FileItem>` |
| `directory/Layout.vue` | `<DirectoryLayout>` |
| `modal/CreateFolder.vue` | `<ModalCreateFolder>` |
| `modal/DeleteConfirm.vue` | `<ModalDeleteConfirm>` |
| `upload/DropZone.vue` | `<UploadDropZone>` |

**推奨**: 名前の衝突を避けるため、プレフィックス付きの名前を使用
- ✅ `<DirectoryLayout>` （明確）
- ⚠️ `<Layout>` （他のLayoutと衝突の可能性）

**例外**: 共通コンポーネントで衝突がない場合は短縮形も可
- ✅ `<ThemeToggle>` （衝突なし）
- ✅ `<ContextMenu>` （衝突なし）

## カテゴリ別ガイドライン

### 1. common/ - 共通コンポーネント
**用途**: アプリケーション全体で使用される汎用コンポーネント

**配置基準**:
- 複数のページや機能で再利用される
- ドメインロジックに依存しない
- UIパターンやユーティリティ

**例**:
- `ContextMenu.vue` - 右クリックメニュー
- `ThemeToggle.vue` - ダーク/ライトモード切り替え
- `Button.vue`, `Badge.vue` など（将来追加される場合）

### 2. directory/ - ディレクトリページ関連
**用途**: ファイル/フォルダ一覧表示に特化したコンポーネント

**配置基準**:
- ディレクトリページ（`/dir/*`）で使用される
- ファイル/フォルダの表示・操作に関連

**例**:
- `FileItem.vue` - ファイル/フォルダアイテム表示
- `Layout.vue` - ディレクトリページのレイアウト
- `FileGrid.vue` （将来追加予定）- グリッド表示

### 3. modal/ - モーダルコンポーネント
**用途**: ダイアログやモーダルウィンドウ

**配置基準**:
- オーバーレイで表示される
- ユーザーの確認や入力を求める
- モーダル固有のロジックを持つ

**例**:
- `CreateFolder.vue` - フォルダ作成ダイアログ
- `DeleteConfirm.vue` - 削除確認ダイアログ

### 4. upload/ - アップロード関連
**用途**: ファイルアップロード機能

**配置基準**:
- ファイルのドラッグ&ドロップ
- アップロード進捗表示
- アップロード関連のUI

**例**:
- `DropZone.vue` - ドラッグ&ドロップゾーン
- `ProgressBar.vue` （将来追加予定）- アップロード進捗

## TypeScript型定義

コンポーネントのpropsとemitsは厳密に型定義します：

```vue
<script setup lang="ts">
import type { FileItem } from '~/types'

// Props定義
const props = defineProps<{
  item: FileItem
  disabled?: boolean
}>()

// Emits定義
const emit = defineEmits<{
  delete: []
  select: [item: FileItem]
}>()
</script>
```

## インポート

Nuxtのauto-importにより、コンポーネントは自動的にインポートされます。
明示的な `import` 文は**不要**です。

```vue
<!-- ❌ 不要 -->
<script setup>
import ContextMenu from '~/components/common/ContextMenu.vue'
</script>

<!-- ✅ 推奨 -->
<script setup>
// auto-importにより自動的に利用可能
</script>

<template>
  <CommonContextMenu />
  <!-- または -->
  <ContextMenu />
</template>
```

## 新しいコンポーネントの追加

1. **適切なカテゴリを選択**
   - 既存のカテゴリに合致するか確認
   - 新しいカテゴリが必要な場合は慎重に検討

2. **ファイル名をPascalCaseで作成**
   ```bash
   touch app/components/directory/FileGrid.vue
   ```

3. **TypeScriptで型安全に実装**
   ```vue
   <script setup lang="ts">
   // 型定義
   </script>
   ```

4. **使用時はプレフィックス付きで参照**
   ```vue
   <DirectoryFileGrid />
   ```

## ベストプラクティス

### ✅ DO
- コンポーネントは単一責任の原則に従う
- TypeScriptで厳密に型定義する
- 再利用可能な設計にする
- プレフィックス付きのコンポーネント名を使う（衝突回避）

### ❌ DON'T
- 複数の責務を1つのコンポーネントに詰め込まない
- `any` 型を使わない
- グローバルな状態に依存しすぎない
- 深いネストのディレクトリ構造を作らない（最大2階層）

## リファクタリング時の注意点

コンポーネントを移動する場合：

1. **Git管理下で移動**
   ```bash
   git mv app/components/OldPath.vue app/components/new/NewPath.vue
   ```

2. **Nuxtのauto-importは自動更新**
   - コンポーネント名が変わる場合のみ使用箇所を更新

3. **型定義の更新**
   - `~/types` からインポートしている場合は影響なし

4. **ビルドエラーの確認**
   ```bash
   npm run build
   ```

## 参考リンク

- [Nuxt Components Directory](https://nuxt.com/docs/guide/directory-structure/components)
- [Vue.js Style Guide](https://vuejs.org/style-guide/)
- [TypeScript with Vue 3](https://vuejs.org/guide/typescript/overview.html)
