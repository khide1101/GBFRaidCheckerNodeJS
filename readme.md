# グラブル救援チェッカー By NodeJS

- TwitterStreamAPIを利用して、Twitter上にあるマルチ救援をリアルタイム取得
- フィルターで通知したいマルチだけを絞り込み
- 救援がきたら、自動でマルチIDをクリップボードへコピー

## 準備
- nodeJS(v10.4.0) インストール
- `npm install`

## 設定

### シークレットアクセストークンの設置
- TwitterDevアカウント登録・App申請をして
- MyAppからアクセストークンを取得
- `config/consumer_key.js.sample` を `consumer_key.js` にリネーム
- 上記アクセストークン群を記入

### フィルター設定
- `config/raid_datas.js` を開く
- フィルター有効にしたいマルチを`true`に書き換える

## 起動
`node app.js`
