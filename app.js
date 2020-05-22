const Twitter     = require('twitter');
const os          = require('os');

const consumerKey = require('./config/consumer_key.js');
const raidDatas   = require('./config/raid_datas.js');
const tweetParser = require('./modules/tweet_parser.js');
const tweetFilter = require('./modules/tweet_filter.js');
const copyText    = require('./modules/copy_text.js');
const sound       = require('./modules/sound.js');

const filterKeys  = Object.keys(raidDatas.switch).filter((key) => raidDatas.switch[key]);
const filterDatas = filterKeys.map((key) => raidDatas.detail[key]);
const osPlatform  = os.platform();


/* ----------------------------------------- */
/* Twitter Stream Connection */
/* ----------------------------------------- */
const client   = new Twitter(consumerKey);
const keywords = [ '参加者募集！', 'I need backup!' ];
const gbfTrack = keywords.join(',');


client.stream('statuses/filter', { track: gbfTrack }, (stream) => {

    console.log('Twitter Stream Connect Start!!');
    console.log('------- Filters --------');
    console.log(filterKeys);
    console.log('------------------------');

    stream.on('data', (data) => {
        const tweetObj = tweetFilter(tweetParser(data), filterDatas);
        if (tweetObj !== null) {
            console.log(tweetObj);
            copyText(tweetObj.id, osPlatform);
            sound(0.005);
        }
    });

    // stream.on('error', (error) => {
    //     console.error("Twitter Streaming Error.");
    // });

});
