const keypress    = require('keypress');
const os          = require('os');
const osPlatform  = os.platform();
const copyText    = require('./copy_text.js');
const sound       = require('./sound.js');
const timeParser  = require('./time_parser.js');

let _toggle = false;

const consoleColors = {
    true: '\u001b[32m', // Green
    false: '\u001b[33m', // Yellow
};

class Console {
    /**
     * コンソールに救援情報を出力する
     * @param {*} obj
     * @param {*} getType stream or search
     * @param {*} idLogs 一度流れたIDバッファー配列
     * @param {*} isNewOnly 新品のみ出力する
     * @param {*} isSound 音を鳴らす
     * @param {*} boostModeFlag ブーストモードON/OFF
     */
    static output(obj, getType = '-', idLogs = [], isNewOnly = true, isSound = false, boostModeFlag = false) {
        if (obj !== null && idLogs.indexOf(obj.id) === -1) {

            // クリップボードにIDコピー
            copyText(obj.id, osPlatform);

            // コンソール出力
            const { delay, timeStr} = timeParser(obj);
            console.log(`${boostModeFlag ? '\u001b[31m[boost]' : ''}${consoleColors[_toggle]}{ id: ${obj.id} , get: '${getType}', name: "${obj.name}", delay: "${delay}s" }\u001b[0m`);

            // 音を鳴らす
            if (isSound) sound(0.005, osPlatform);
   
            if (isNewOnly) {
                idLogs.unshift(obj.id);
                if (idLogs.length > 1000) idLogs.pop();
            }
            _toggle = !_toggle;
        }
    }

    /**
     * エラー判別 / エラー時にはtrueを返す
     * @param {*} error 
     * @param {*} twError 
     */
    static checkError(error, twError) {
        if(error) {
            console.log('Error responce. Lock SearchAPI 3min.');
            console.error(error.message); // eslint-disable-line
            return true;
        }
        if (twError) {
            console.log('Error responce. Lock SearchAPI 3min.');
            console.error(twError.message);
            return true;
        }
        return false;
    }

    /**
     * キー入力を監視し'Ctrl + B'を検知したらコールバックを返す
     * @param {*} callback 
     */
    static onKeypress(callback) {
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
}

module.exports = Console;
