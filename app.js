const Twitter     = require('twitter');
const os          = require('os');

const consumerKey = require('./config/consumer_key.js');
const raidDatas   = require('./config/raid_datas.js');
const tweetParser = require('./modules/tweet_parser.js');
const timeParser  = require('./modules/time_parser.js');
const tweetCombo  = require('./modules/tweet_combo.js');
const keypress    = require('./modules/keypress.js');
const copyText    = require('./modules/copy_text.js');
const sound       = require('./modules/sound.js');

const filterKeys  = Object.keys(raidDatas.switch).filter((key) => raidDatas.switch[key]);
const filterDatas = filterKeys.map((key) => raidDatas.detail[key]);
const isNewOnly   = raidDatas.newOnly === true;
const osPlatform  = os.platform();


/* ----------------------------------------- */
/* Twitter Stream Connection */
/* ----------------------------------------- */
const client   = new Twitter(consumerKey);
const keywords = tweetCombo(filterDatas);
const gbfTrack = keywords.join(',');
const gbfSearch = `(${keywords.join(') OR (')})`
const idLogs = [];
const logMax = 1000;
const APILimitPer = 900; // Rate制限の単位時間(s)
const APILimitFetch = 420; // Rate制限のFetch回数 (ほんとは450sだけど余裕持って420設定)

const consoleColors = {
    true: raidDatas.consoleColorA || '\u001b[0m',
    false: raidDatas.consoleColorB || '\u001b[0m',
};

let boostModeFlag = false;


console.log('Twitter Stream Connect Start!!');
console.log('------- Filters --------');
console.log(filterKeys);
console.log('------------------------');


/* =================================== */
/* コンソール出力 */
/* =================================== */
let _toggle = false;
const output = (obj, from = '-') => {
    if (obj !== null && idLogs.indexOf(obj.id) === -1) {
        copyText(obj.id, osPlatform);

        const { delay, timeStr} = timeParser(obj);
        console.log(`${boostModeFlag ? '\u001b[31m[boost]' : ''}${consoleColors[_toggle]}{ id: ${obj.id} , get: '${from}', name: "${obj.name}", delay: "${delay}s" }\u001b[0m`);
        // sound(0.005, osPlatform);

        if (isNewOnly) {
            idLogs.unshift(obj.id);
            if (idLogs.length > logMax) idLogs.pop();
        }
        _toggle = !_toggle;
    }
};


/**
 * StreamAPIからツイート取得
 */
client.stream('statuses/filter', { track: gbfTrack }, (stream) => {
    stream.on('data', (data) => {
        output(tweetParser(data), 'stream');
    });
});


/**
 * SearchAPIからツイート取得
 */
let sec = 0;
let fetchCount = 0;
let APILockFlag = false;

// 1秒毎に監視、5秒間隔でFetch実行、ただしBootModeの時は1秒間隔でFetch実行
// RateLimitに引っかかりそうな時はロックをかける。一定時間超過でロック解除
setInterval(() => {
    if ((boostModeFlag === true || sec % 5 === 0) && APILockFlag === false) {
        if (fetchCount < APILimitFetch) {
            fetchCount++;
            // console.log(`searchAPI Fetch!(${fetchCount})`);
            client.get('search/tweets', {q: gbfSearch, count: 100, result_type: 'recent', include_entities: false}, (error, tweets, res) => {
                if(error) {
                    if (error.message === 'Rate Limit exceeded') {
                        console.log('Rate Limit exceeded responce. Lock SearchAPI 5min.');
                        APILockFlag = true;
                        boostMode = false;
                        sec = 600;
                        return;
                    }
                }
                if (tweets.statuses !== undefied) {
                    for (let i = tweets.statuses.length - 1; i >= 0; i--) {
                        output(tweetParser(tweets.statuses[i]), 'search');
                    }
                } else {
                    console.log('tweets.statuses is udefiend. Lock SearchAPI 3min.');
                    APILockFlag = true;
                    boostMode = false;
                    sec = 720;
                    return;
                }
            });
        } else {
            // 単位時間内(15分)のFetch回数が制限に近付いたら、SearchAPIをロックする
            console.log(`SearchAPI Locked. Waiting time ${APILimitPer - sec}s.`);
            APILockFlag = true;
            boostMode = false;
        }
    }

    // RateLimitの900秒が経過したら、秒数カウント及びFetch回数をリセット + ロック解除
    if (sec > APILimitPer){
        console.log('SearchAPI LimitCount Reset.');
        sec = 0;
        fetchCount = 0;
        APILockFlag = false;
    }

    sec++;
}, 1000);


/**
 * キー入力によるブーストモードON/OFF
 */
keypress(() => {
    if (boostModeFlag === false) {
        console.log('＊＊＊＊ Boost Start!!!! ＊＊＊＊');
        boostModeFlag = true;
    } else {
        console.log('＊＊＊＊ Boost End!!!! ＊＊＊＊');
        boostModeFlag = false;
    }
});
