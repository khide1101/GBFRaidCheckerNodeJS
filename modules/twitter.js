const TwitterLib = require('twitter');

class Twitter {
    static createClient(authParams) {
        return new TwitterLib(authParams);
    }

    static connectStream(client, track, callback) {
        client.stream('statuses/filter', { track }, (stream) => {
            stream.on('data', (tweet) => {
                callback(tweet);
                // Console.output(tweetParser(tweet), 'stream', idLogs, isNewOnly, isSound, boostModeFlag);
            });
        });
    }

    static fetchSearch(client, q, successCallback, failedCallback) {
        client.get('search/tweets', { q , count: 100, result_type: 'recent', include_entities: false}, (error, tweets) => {
            if (this._checkError(error, tweets.error) === false) {
                successCallback(tweets)
            } else {
                failedCallback();
            }
        });
    }

    /**
     * エラー判別 / エラー時にはtrueを返す
     * @param {*} error 
     * @param {*} twError 
     */
    static _checkError(error, twError) {
        if(error) {
            console.log('\u001b[31mCation!! API Error responce. Lock SearchAPI 3min.');
            // console.error(error.message); // eslint-disable-line
            return true;
        }
        if (twError) {
            console.log('\u001b[31mCation!! API Error responce. Lock SearchAPI 3min.');
            // console.error(twError.message);
            return true;
        }
        return false;
    }

    static test(client) {

    }
}

module.exports = Twitter;
