# Quick Work Log

Chrome拡張機能の最初の動作スライスです。現段階では、カテゴリ名の正規化・重複判定・CRUD、保存形式の検証、予定入力フォームと入力検証、Calendar APIのカレンダー・色一覧取得・予定登録基盤、Service Worker経由のカレンダー一覧表示、エラー分類、二重登録防止、Manifest V3のポップアップ起動を提供します。OAuthの実Chrome接続と画面からの予定登録は次の段階です。

## ローカルでの起動

1. Node.js 20以降をインストールします。
2. このディレクトリで `npm test` と `npm run check` を実行します。
3. `chrome://extensions` を開き、デベロッパーモードを有効にします。
4. 「パッケージ化されていない拡張機能を読み込む」で、この `quick-work-log` ディレクトリを選択します。
5. ツールバーの拡張機能アイコン、または `Alt+Shift+C` でポップアップを開きます。

OAuthを使う段階では、`manifest.json` の仮client IDをGoogle Cloudで作成したChrome拡張機能用client IDへ置き換えます。認証情報はコミットしません。

手動確認の手順は [`docs/MANUAL_TEST.md`](../docs/MANUAL_TEST.md) に記載しています。
