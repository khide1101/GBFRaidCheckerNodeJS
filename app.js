const Twitter     = require('twitter');
const os          = require('os');

const consumerKey = require('./config/consumer_key.js');
const raidDatas   = require('./config/raid_datas.js');
const tweetParser = require('./modules/tweet_parser.js');
const tweetFilter = require('./modules/tweet_filter.js');
const tweetCombo  = require('./modules/tweet_combo.js');
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
const idLogs = [];
const logMax = 1000;

const consoleColors = {
    true: raidDatas.consoleColorA || '\u001b[0m',
    false: raidDatas.consoleColorB || '\u001b[0m',
};

let _toggle = false;

client.stream('statuses/filter', { track: gbfTrack }, (stream) => {

    console.log('Twitter Stream Connect Start!!');
    console.log('------- Filters --------');
    console.log(filterKeys);
    console.log('------------------------');

    stream.on('data', (data) => {
        // const tweetObj = tweetFilter(tweetParser(data), filterDatas);
        const tweetObj = tweetParser(data);

        if (tweetObj !== null && idLogs.indexOf(tweetObj.id) === -1) {
            console.log(`${consoleColors[_toggle]}{ id: ${tweetObj.id} , name: "${tweetObj.name}" }\u001b[0m`);
            _toggle = !_toggle;

            copyText(tweetObj.id, osPlatform);
            sound(0.005, osPlatform);

            if (isNewOnly) {
                idLogs.unshift(tweetObj.id);
                if (idLogs.length > logMax) idLogs.pop();
            }
        }
    });

    // stream.on('error', (error) => {
    //     console.error("Twitter Streaming Error.");
    // });

});
