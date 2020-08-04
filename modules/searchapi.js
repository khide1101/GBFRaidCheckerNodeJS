const g = global;

const Twitter = require('./twitter.js');

const API_LIMIT_PER = 900000; // Rate制限の単位時間(ms)
let API_LIMIT_FETCH = 430;  // Rate制限のFetch回数 (ほんとは450sだけど余裕持って430設定)
let BOOST_FETCH_MAX = 60;     // Boost状態での連続Fetch回数制限
let boostingFetchCount = 0;
let mostTweetID  = 0;
let apiLockFlag  = false;
let apiLockFlags = { 0: false, 1: false };


class SearchAPI {
    /**
     * SearchAPI定期実行を走らせる
     * ※わざと非同期処理を解決せずにループさせているので、実行時間 > ループ間隔 になると処理がスタックされて不具合が起きる可能性あり
     * @param {*} keyword
     * @param {*} boostParam
     * @param {*} client
     * @param {*} callback tweetObjectをコールバックする
     */
    static run(keyword, boostParam, client, callback) {
        let intervalSec = boostParam.boost; // ループ実行間隔(秒)
        let passedSec   = 0; // 経過秒数
        let fetchCount  = 0; // Fetch実行回数

        setInterval(() => {

            // 条件クリアでFetch実行、回数超過でAPIロック
            if (g.boostModeFlag === true || passedSec % boostParam.default === 0) {
                if (API_LIMIT_FETCH > fetchCount) {
                    if (apiLockFlag === false) {
                        fetchCount++;
                        this.fetch(client, keyword, callback);
                    }
                } else {
                    this.lock(passedSec);
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
     * SearchAPI定期実行を、２つのClientで交互に走らせる
     * @param {*} keyword
     * @param {*} boostParam
     * @param {*} client1 primary
     * @param {*} client2 secondary
     * @param {*} callback tweetObjectをコールバックする
     */
    static runTwin(keyword, boostParam, client1, client2, callback) {
        API_LIMIT_FETCH *= 2; // Fetch回数2倍
        BOOST_FETCH_MAX *= 2; // BoostFetch回数2倍

        let intervalSec = boostParam.boost; // ループ実行間隔(秒)
        let passedSec   = 0; // 経過秒数
        let fetchCount  = 0; // Fetch実行回数
        const clients = [ client1, client2 ];

        setInterval(() => {
            const n = fetchCount % 2;

            if (g.boostModeFlag === true || passedSec % boostParam.default === 0) {
                if (API_LIMIT_FETCH > fetchCount) {
                    if (apiLockFlags[n] === false) {
                        fetchCount++;
                        this.fetchTwin(clients[n], keyword, n, callback);
                    }
                } else {
                    this.lockTwin(n, passedSec);
                }
            }

            // 一定時間経過でカウントリセット
            if (passedSec > API_LIMIT_PER) {
                this.resetTwin();
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
            const filteredTweets = tweets.statuses.filter((v) => v.id > mostTweetID); // 使用済み除外
            if (filteredTweets.length > 0) {
                mostTweetID = Math.max.apply(null, filteredTweets.map((v) => v.id));
                for (let i = filteredTweets.length - 1; i >= 0; i--) {
                    callback(filteredTweets[i]);
                }
            }
            this.safetyLock();
        }, () => {
            this.lock(720000); // 3分
        });
    }

    static fetchTwin(client, keyword, n, callback) {
        Twitter.fetchSearch(client, keyword, (tweets) => {
            const filteredTweets = tweets.statuses.filter((v) => v.id > mostTweetID); // 使用済み除外
            if (filteredTweets.length > 0) {
                mostTweetID = Math.max.apply(null, filteredTweets.map((v) => v.id));
                for (let i = filteredTweets.length - 1; i >= 0; i--) {
                    callback(filteredTweets[i]);
                }
            }
            this.safetyLock();
        }, () => {
            this.lockTwin(n, 720000); // 3分
        });
    }

    /*
    * [ロックをかける]
    * 引数秒数の間、APIをロックする
    */
    static lock(_sec = 0) {
        console.log(`\u001b[31mSearchAPI Locked. Waiting time ${(API_LIMIT_PER - _sec) / 1000}s.\u001b[0m`);
        apiLockFlag = true;
        g.boostModeFlag = false;
    }

    static lockTwin(n, _sec = 0) {
        console.log(`\u001b[31mSearchAPI['${n + 1}'] Locked. Waiting time ${(API_LIMIT_PER - _sec) / 1000}s.\u001b[0m`);
        apiLockFlags[n] = true;
        g.boostModeFlag = false;
    }

    /*
    * [安全装置]
    * ブースト状態のまま一定回数連続Fetchしたら、自動的にブーストモードをOFFにする
    */
    static safetyLock() {
        if (g.boostModeFlag === true) {
            boostingFetchCount++;
            if (boostingFetchCount > BOOST_FETCH_MAX) {
                console.log('＊＊＊＊ SafetyLock. Boost END. ＊＊＊＊');
                g.boostModeFlag = false;
            }
        } else {
            boostingFetchCount = 0;
        }
    }

    /**
     * [リセット]
     * ロックを解除し、秒数・Fetch回数を初期化する
     */
    static reset() {
        if (apiLockFlag === true) {
            console.log('SearchAPI LimitCount Reset.');
        }
        apiLockFlag = false;
    }

    static resetTwin() {
        if (apiLockFlags[0] === true || apiLockFlags[1] === true) {
            console.log('SearchAPI LimitCount Reset.');
        }
        apiLockFlags = { 0: false, 1: false };
    }
}

module.exports = SearchAPI;
