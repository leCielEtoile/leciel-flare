/**
 * @cloudflare/unenv-preset の sideEffects: false を修正するパッチスクリプト
 * この警告は node:process などのインポートが副作用なしと誤認識されることで発生
 */
import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const packageJsonPath = join(__dirname, '../node_modules/@cloudflare/unenv-preset/package.json')

try {
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))

  // sideEffects を true に変更（または配列で特定ファイルを指定）
  if (packageJson.sideEffects === false) {
    packageJson.sideEffects = [
      '**/*.mjs',
      '**/*.js'
    ]

    writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))
    console.log('✓ @cloudflare/unenv-preset の sideEffects を修正しました')
  }
} catch (error) {
  // パッケージがインストールされていない場合はスキップ
  if (error.code !== 'ENOENT') {
    console.error('警告: unenv-preset のパッチに失敗しました:', error.message)
  }
}
