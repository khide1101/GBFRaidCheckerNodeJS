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

global.boostModeFlag  = false;

/** キー入力によるブーストモードON/OFF */
Console.initKeyPressEvent();

const usedIDs    = [];
const isNewOnly  = raidDatas.newOnly === true;
const isSound    = raidDatas.isSound === true;
const boostParam = boostProfile(raidDatas.boostLevel);

/** Client 接続テスト */
Twitter.testVerifyClients(userAuthClient, appAuthClient1, appAuthClient2)
    .then((res) => {

        const res1 = res[0] || false;
        const res2 = res[1] || false;
        const res3 = res[2] || false;

        /** StreamAPIからツイート取得 */
        if (res1 === true) {
            console.log('\u001b[36mStreamAPI StandBy!!\u001b[0m');
            Twitter.connectStream(userAuthClient, streamKeyword, (tweet) => {
                Console.output(tweet, 'stream', usedIDs, isNewOnly, isSound);
            });
        }

        /** SearchAPIからツイート取得 */
        if (res2 === true) {
            if (res3 !== true) {
                /** [シングル] */
                console.log('\u001b[36mSearchAPI1 StandBy!!\u001b[0m');
                SearchAPI.run(searchKeyword, boostParam, appAuthClient1, (tweet) => {
                    Console.output(tweet, 'search', usedIDs, isNewOnly, isSound);
                });
            } else {
                /** [ツイン] */
                console.log('\u001b[36mSearchAPI/1 StandBy!!\u001b[0m');
                console.log('\u001b[36mSearchAPI/2 StandBy!!\u001b[0m');
                Console.showTwinDriveAA();
                SearchAPI.runTwin(searchKeyword, boostParam, appAuthClient1, appAuthClient2, (tweet) => {
                    Console.output(tweet, 'search', usedIDs, isNewOnly, isSound);
                });
            }
        }
    });


console.log('Twitter Stream Connect Start!!');
console.log('==== Filters ================================');
console.log(filterKeys);
console.log(`\u001b[35mBoostMode ${raidDatas.boostLevel}\u001b[0m`);
