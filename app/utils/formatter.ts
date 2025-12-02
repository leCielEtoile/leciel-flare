/**
 * ファイルサイズフォーマット
 * バイト数を人間が読みやすい形式に変換
 * @param bytes - バイト数
 * @returns フォーマットされた文字列 (例: "1.5 MB")
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
}
