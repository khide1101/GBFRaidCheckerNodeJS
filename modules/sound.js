const player = require('play-sound')(opts = {})
const path = require('path');
const exec = require('child_process').exec;

const wavPath = path.resolve('./sound.wav').replace(/\\/g, '//');
const winCmd = `powershell.exe -Command (New-Object Media.SoundPlayer "${wavPath}").PlaySync()`;

module.exports = (volume, osPlatform) => {
    if (osPlatform === 'win32') {
        // Widows
        exec(winCmd);
    } else {
        // Mac, Linux
        player.play('sound.wav', { afplay: ['-v', volume ? volume : 0.5 ] });
    }
};
