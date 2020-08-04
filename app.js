const Twitter     = require('./modules/twitter.js');
const SearchAPI   = require('./modules/searchapi.js');
const Keyword     = require('./modules/keyword.js');
const Console     = require('./modules/console.js');

const consumerKey  = require('./config/consumer_key.js');
const raidDatas    = require('./config/raid_datas.js');
const boostProfile = require('./config/boost_profile.js');

/* Client */
const userAuthClient = Twitter.createClient(consumerKey.userAuth);
const appAuthClient1 = Twitter.createClient(consumerKey.appAuth.primary);
const appAuthClient2 = Twitter.createClient(consumerKey.appAuth.secondary);

/* Keyword */
const { streamKeyword, searchKeyword, filterKeys } = Keyword.create(raidDatas);

global.boostModeFlag  = false; // BoostMode 有効フラグ
global.twinDriveFlag  = false; // TwinDriveMode 有効フラグ

console.log('Twitter Stream Connect Start!!');
console.log('------- Filters --------');
console.log(filterKeys);
console.log('------------------------');

/** キー入力によるブーストモードON/OFF */
Console.initKeyPressEvent();

const usedIDs    = []; // 一度流れたIDを一時的に保持しておくバッファー配列
const isNewOnly  = raidDatas.newOnly === true;
const isSound    = raidDatas.isSound === true;

/** Client 接続テスト */
Twitter.testVerifyClients(userAuthClient, appAuthClient1, appAuthClient2)
    .then((res) => {

        const res1 = res[0];
        const res2 = res[1];
        const res3 = res[2];

        if (res1 === true) {
            /** StreamAPIからツイート取得 */
            Twitter.connectStream(userAuthClient, streamKeyword, (tweet) => {
                Console.output(tweet, 'stream', usedIDs, isNewOnly, isSound);
            });
        }

        if (res2 === true && res3 === false) {
            /** SearchAPIからツイート取得 [シングル] */
            SearchAPI.run(searchKeyword, boostProfile(raidDatas.boostLevel), appAuthClient1, appAuthClient2, (tweet) => {
                Console.output(tweet, 'search', usedIDs, isNewOnly, isSound);
            });
        } else if (res2 === true && res3 === true) {
            /** SearchAPIからツイート取得 [ツイン] */
            global.twinDriveFlag = true;
            // SearchAPI.runTwinDrive(searchKeyword, boostProfile(raidDatas.boostLevel), appAuthClient1, appAuthClient2, (tweet) => {
            //     Console.output(tweet, 'search', usedIDs, isNewOnly, isSound);
            // });
        }
    });
