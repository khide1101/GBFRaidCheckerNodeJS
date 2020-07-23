const keypress    = require('keypress');

module.exports = (callback) => {
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
};
