const Twitter     = require('twitter');
const tweetParser = require('./modules/tweet_parser.js');
const makeKeyword = require('./modules/make_keyword.js');
const Console     = require('./modules/console.js');
const consumerKey = require('./config/consumer_key.js');
const raidDatas   = require('./config/raid_datas.js');

/* Client */
const userAuthClient = new Twitter(consumerKey.userAuth);
const appAuthClient  = new Twitter(consumerKey.appAuth || consumerKey.userAuth);

/* Keyword Filter */
const filterKeys  = Object.keys(raidDatas.switch).filter((key) => raidDatas.switch[key]);
const filterDatas = filterKeys.map((key) => raidDatas.detail[key]);
const keywords  = makeKeyword(filterDatas);
const gbfTrack  = keywords.join(',');               // StreamAPI用
const gbfSearch = `(${keywords.join(') OR (')})`;   // SearchAPI用

const isNewOnly   = raidDatas.newOnly === true;
const isSound     = raidDatas.isSound === true;

const idLogs = [];         // 一度流れたIDを一時的に保持しておくバッファー配列
const APILimitPer = 900;   // Rate制限の単位時間(s)
const APILimitFetch = 420; // Rate制限のFetch回数 (ほんとは450sだけど余裕持って420設定)
let boostModeFlag = false; // ブーストモードフラグ


console.log('Twitter Stream Connect Start!!');
console.log('------- Filters --------');
console.log(filterKeys);
console.log('------------------------');


/**
 * StreamAPIからツイート取得
 */
userAuthClient.stream('statuses/filter', { track: gbfTrack }, (stream) => {
    stream.on('data', (tweet) => {
        Console.output(tweetParser(tweet), 'stream', idLogs, isNewOnly, isSound, boostModeFlag);
    });
});


/**
 * SearchAPIからツイート取得
 */
let sec = 0; // 経過秒数
let fetchCount = 0; // Fetch実行回数
let APILockFlag = false; // ロックフラグ

// 1秒毎に監視、5秒間隔でFetch実行、ただしBootModeの時は1秒間隔でFetch実行
// RateLimitに引っかかりそうな時はロックをかける。一定時間超過でロック解除
setInterval(() => {
    if ((boostModeFlag === true || sec % 5 === 0) && APILockFlag === false) {
        if (fetchCount < APILimitFetch) {

            fetchCount++;
            appAuthClient.get('search/tweets', {q: gbfSearch, count: 100, result_type: 'recent', include_entities: false}, (error, tweets, res) => {
                if (Console.checkError(error, tweets.error) === false) {
                    // ツイートが正常に取得できた => コンソール出力
                    for (let i = tweets.statuses.length - 1; i >= 0; i--) {
                        Console.output(tweetParser(tweets.statuses[i]), 'search', idLogs, isNewOnly, isSound, boostModeFlag);
                    }
                } else {
                    // エラーが返ってきた => 3分間SearchAPIロック
                    APILockFlag = true;
                    boostModeFlag = false;
                    sec = 720;
                }
            });

        } else {
            // 単位時間内(15分)のFetch回数が制限に近付いたら、SearchAPIをロックする
            console.log(`SearchAPI Locked. Waiting time ${APILimitPer - sec}s.`);
            APILockFlag = true;
            boostModeFlag = false;
        }
    }

    // RateLimitの900秒が経過したら、秒数カウント及びFetch回数をリセット + ロック解除
    if (sec > APILimitPer){
        if (APILockFlag === true) console.log('SearchAPI LimitCount Reset.');
        sec = 0;
        fetchCount = 0;
        APILockFlag = false;
    }

    sec++;
}, 1000);


/**
 * キー入力によるブーストモードON/OFF
 */
Console.onKeypress(() => {
    if (boostModeFlag === false) {
        console.log('＊＊＊＊ Boost Start!!!! ＊＊＊＊');
        boostModeFlag = true;
    } else {
        console.log('＊＊＊＊ Boost End!!!! ＊＊＊＊');
        boostModeFlag = false;
    }
});
