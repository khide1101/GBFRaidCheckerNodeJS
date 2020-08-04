const TwitterLib = require('twitter');

class Twitter {
    /**
     * Clientを生成する
     * @param {*} authParams 認証
     */
    static createClient(authParams) {
        return new TwitterLib(authParams);
    }

    /**
     * 複数Clientの接続テストをして結果を返す
     * @param {*} client1 
     * @param {*} client2 
     * @param {*} client3 
     */
    static testVerifyClients(client1, client2, client3) {
        const promise1 = this.testVerifyClient(client1);
        const promise2 = this.testVerifyClient(client2);
        const promise3 = this.testVerifyClient(client3);
        return Promise.all([ promise1, promise2, promise3 ]);
    }

    /**
     * 単一Clientの接続テストをして結果を返す
     * @param {*} client 
     */
    static testVerifyClient(client) {
        return new Promise((resolve) => {
            if (!client) resolve(false);
            client.get('application/rate_limit_status', (error, res) => {
                if (error) resolve(false);
                if (res.error) resolve(false);
                try {
                    // const rateLimit = res.resources.search['/search/tweets'].limit;
                    resolve(true);
                } catch(e) {
                    resolve(false);
                }
            });
        });
    }

    /**
     * StreamAPIに接続する
     * @param {*} client ユーザー認証Client
     * @param {*} keyword streamAPIKeyword
     * @param {*} callback 
     */
    static connectStream(client, keyword, callback) {
        client.stream('statuses/filter', { track: keyword }, (stream) => {
            stream.on('data', (tweet) => callback(tweet));
        });
    }

    /**
     * SearchAPIを叩く
     * @param {*} client アプリケーション認証Client
     * @param {*} keyword searchAPIKeyword
     * @param {*} successCallback 
     * @param {*} failedCallback 
     */
    static fetchSearch(client, keyword, successCallback, failedCallback) {
        client.get('search/tweets', { q: keyword , count: 100, result_type: 'recent', include_entities: false}, (error, tweets) => {
            if (this._checkError(error, tweets.error) === false) {
                successCallback(tweets)
            } else {
                failedCallback();
            }
        });
    }

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
}

module.exports = Twitter;
