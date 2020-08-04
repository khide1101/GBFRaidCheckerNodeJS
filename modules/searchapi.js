const g = global;

const Twitter = require('./twitter.js');

const API_LIMIT_PER = 900000; // Rate制限の単位時間(ms)
const API_LIMIT_FETCH = 430;  // Rate制限のFetch回数 (ほんとは450sだけど余裕持って430設定)

let continuouslyBoostFetchCount = 0; // ブースト時の連続Fetch回数
let mostTweetID = 0; // 最も新しいTweetIDバッファー

class SearchAPI {
    /**
     * SearchAPI定期実行を走らせる
     * ※わざと非同期処理を解決せずにループさせているので、実行時間 > ループ間隔 になると処理がスタックされて不具合が起きる可能性あり
     * @param {*} keyword
     * @param {*} boostParam
     * @param {*} client1 primary
     * @param {*} client2 secondary
     * @param {*} callback tweetObjectをコールバックする
     */
    static run(keyword, boostParam, client1, client2, callback) {
        let intervalSec = boostParam.boost; // ループ実行間隔(秒)
        let passedSec   = 0; // 経過秒数
        let fetchCount  = 0; // Fetch実行回数

        setInterval(() => {

            // 条件クリアでFetch実行、回数超過でAPIロック
            if (g.searchLockFlag === false) {
                if (g.boostModeFlag === true || passedSec % boostParam.default === 0) {
                    if (API_LIMIT_FETCH > fetchCount) {
                        fetchCount++;
                        this.fetch(client1, keyword, callback);
                    } else {
                        this.lock(passedSec);
                    }
                }
            }

            // 一定時間経過でカウントリセット
            if (passedSec > API_LIMIT_PER) {
                this.reset();
                passedSec  = 0;
                fetchCount = 0;
            }

            passedSec += intervalSec;
        }, intervalSec);
    }

    /**
     * SearchAPIへツイートを取得しに行く
     * @param {*} client twitterClient
     * @param {*} keyword 検索キーワード
     * @param {*} callback 取得成功時にTweetObjectをコールバックする
     */
    static fetch(client, keyword, callback) {
        Twitter.fetchSearch(client, keyword, (tweets) => {
            // tweets 取得成功
            const filteredTweets = tweets.statuses.filter((v) => v.id > mostTweetID); // 使用済み除外
            if (filteredTweets.length > 0) {
                mostTweetID = Math.max.apply(null, filteredTweets.map((v) => v.id));
                for (let i = filteredTweets.length - 1; i >= 0; i--) {
                    callback(filteredTweets[i]);
                }
            }
            this.safetyLock();
        }, () => {
            // エラー
            this.lock(720000); // 3分
        });
    }

    /*
    * [ロックをかける]
    * 引数秒数の間、APIをロックする
    */
    static lock(_sec = 0) {
        console.log(`SearchAPI Locked. Waiting time ${(API_LIMIT_PER - _sec) / 1000}s.`);
        g.searchLockFlag = true;
        g.boostModeFlag = false;
    }

    /*
    * [安全装置]
    * ブースト状態のまま一定回数連続Fetchしたら、自動的にブーストモードをOFFにする
    */
    static safetyLock() {
        if (g.boostModeFlag === true) {
            continuouslyBoostFetchCount++;
            if (continuouslyBoostFetchCount > 60) {
                console.log('＊＊＊＊ SafetyLock. Boost END. ＊＊＊＊');
                g.boostModeFlag = false;
            }
        } else {
            continuouslyBoostFetchCount = 0;
        }
    }

    /**
     * [リセット]
     * ロックを解除し、秒数・Fetch回数を初期化する
     */
    static reset() {
        if (g.searchLockFlag === true) {
            console.log('SearchAPI LimitCount Reset.');
        }
        g.searchLockFlag = false;
    }
}

module.exports = SearchAPI;
