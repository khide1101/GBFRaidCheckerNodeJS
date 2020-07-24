# グラブル救援チェッカー By NodeJS

- TwitterAPIを利用して、Twitter上にあるマルチ救援をリアルタイム取得
- フィルターで通知したいマルチだけを絞り込み
- 一度流れたIDは再表示しない = 新品のみでフィルター
- IDを自動でクリップボードへコピー(音も鳴らせる)
- SearchAPIとStreamAPIの両方から取得を行うため、StreamAPIのみで取得を行なっている他所のツールより取得が格段に速い
- ブーストモードを搭載。ブーストモード時はSearchAPIのXHR頻度を爆上げさせるため、SearcAPIを使ってる他所のツールより取得が早い(ケースが多くなる)

## NodeJS準備
- nodeJS(v10.4.0) インストール
- `npm install`

## Twitter開発者アカウント準備
Twitter開発者アカウントを用意して、App登録。API_KEYを取得する。
(この辺は各々ググって)

##  アクセストークンの類を取得する
- `config/consumer_key.js.sample` を `consumer_key.js` にリネーム
- ここに、TwitterDevのAppsに書いてあるアクセストークン群を記入
 (consumerKey, consumerSecretKey, AccessToken, AccessSecretToken)

- consumerKey, consumerSecretKeyからBearerTokenを生成、上記に記入する。
方法1: ./generate_bearer.jsを実行する(curl必要,Winで動くか動作確認してません)
方法2: ./generate_bearer.jsに書いてあるのと同じことを別の方法でやる
方法3: ググって
https://developer.twitter.com/ja/docs/basics/authentication/guides/bearer-tokens

- 計5種のキー群を入力できたら準備完了。


### フィルター設定
- `config/raid_datas.js` を開く
- フィルター有効にしたいマルチを`true`に書き換える

## 起動
`node app.js`

![スクリーンショット](https://github.com/khide1101/GBFRaidCheckerNodeJS/blob/master/screenshot.png)

## ブーストモード
SearchAPIへのXHR頻度を「5秒に1回」から「1秒に１回」に爆上げする機能。
より速い頻度でツイートの取得が行えるようになる。

`Ctrl + B`でブーストモード開始、もう１度押すと終了。
`15分(900秒)で450回アクセスまで`というAPI制限があるため、長い時間ブーストモードにしっぱなしにすると制限に引っかかるので注意。
引っかかったら一定時間SearchAPIへの接続ができなくなる。

## API接続ロジック
![スクリーンショット](https://github.com/khide1101/GBFRaidCheckerNodeJS/blob/master/graph.png)

## あとがき
グラブルで忙しいのでサポートはしたくないです。
わかる人だけ使ってください。
こうしたらもっと早くなりそう、改善しそうなどのアイディアは超待ってます。
