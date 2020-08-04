const g = global;

const keypress    = require('keypress');
const os          = require('os');
const osPlatform  = os.platform();
const copyText    = require('./copy_text.js');
const sound       = require('./sound.js');

// 使用済みID配列バッファー 最大保持サイズ
const idLogsLength = 300;

class Console {
    /**
     * コンソールに救援情報を出力する
     * @param {*} obj
     * @param {*} getType stream or search
     * @param {*} idLogs 一度流れたIDバッファー配列
     * @param {*} isNewOnly 新品のみ出力する
     * @param {*} isSound 音を鳴らす
     */
    static output(tweetObject, getType = '-', usedIDs = [], isNewOnly = true, isSound = false) {
        const obj = this._parseTweet(tweetObject);
        if (obj === null || usedIDs.indexOf(obj.id) !== -1) return;

        // クリップボードにIDコピー
        copyText(obj.id, osPlatform);

        // コンソール出力
        const { delay } = this._parseTime(obj);
        console.log(`${g.boostModeFlag ? '\u001b[31m[boost]' : ''}${consoleColors[_toggle]}{ id: ${obj.id} , get: '${getType}', name: "${obj.name}", delay: "${delay}s" }\u001b[0m`);

        // 音を鳴らす
        if (isSound) sound(0.005, osPlatform);

        // 一度出力したIDは使用済みID配列へ
        if (isNewOnly) {
            usedIDs.unshift(obj.id);
            if (usedIDs.length > idLogsLength) usedIDs.pop();
        }

        _toggle = !_toggle;
    }

    /**
     * Tweetオブジェクトをパースする
     * @param {*} tweetObject
     */
    static _parseTweet(tweetObject) {
        const regexp = new RegExp("([a-zA-Z0-9]{8}) :(参戦ID|Battle ID)\\n(参加者募集！|I need backup!)\\nLv(l )?([0-9]+) (.+)", "g");
        const match  = regexp.exec(tweetObject.text);
        if (match === null) return null;
        return {
            id: match[1].trim(),
            lv: match[5].trim(),
            name: match[6].trim(),
            timestamp_ms: tweetObject.timestamp_ms,
            created_at: tweetObject.created_at,
            tweetID: tweetObject.id
        };
    }

    /**
     * キー入力を監視し'Ctrl + B'を検知したらコールバックを返す
     * @param {*} callback 
     */
    static initKeyPressEvent() {
        this._onKeypress(() => {
            if (g.boostModeFlag === false) {
                console.log('＊＊＊＊ Boost Start!!!! ＊＊＊＊');
                g.boostModeFlag = true;
            } else {
                console.log('＊＊＊＊ Boost End. ＊＊＊＊');
                g.boostModeFlag = false;
            }
        });
    }

    static _onKeypress(callback) {
        keypress(process.stdin);
        process.stdin.on('keypress', (ch, key) => {
            if (key && key.ctrl && key.name == 'b') {
                callback();
            }
            if (key && key.ctrl && key.name == 'c') {
                process.stdin.pause();
                process.exit(0);
            }
        });
        process.stdin.setRawMode(true);
        process.stdin.resume();
    }

    /**
     * TweetObjectから時間に関する計算をして返す
     * @param {*} obj 
     */
    static _parseTime(obj) {
        const now = new Date();
    
        let delay = '';
        // let timeStr = '';
    
        if (obj.timestamp_ms) {
            const tweetTime = parseInt(obj.timestamp_ms, 10);
            delay = (now.getTime() - tweetTime) / 1000;
            // const d = new Date(tweetTime);
            // timeStr = `${d.getHours()}:${d.getMinutes()}:${d.getSeconds()} [遅延：${delay}s]`;
        }
    
        if (obj.created_at) {
            const d = new Date(obj.created_at);
            delay = (now.getTime() - d.getTime()) / 1000;
            // timeStr = `${d.getHours()}:${d.getMinutes()}:${d.getSeconds()} [遅延：${delay}s]`;
        }
    
        return { delay };
    }
}

// 出力に交互に色をつける
let _toggle = false;
const consoleColors = {
    true: '\u001b[32m',  // 偶数行を緑色に
    false: '\u001b[33m', // 機数行を黄色に
};

module.exports = Console;
