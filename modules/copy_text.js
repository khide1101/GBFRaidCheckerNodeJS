module.exports = (text, osName) => {

    // Windows
    if (osName === 'win32') {
        const proc = require('child_process').spawn('clip');
        proc.stdin.write(text);
        proc.stdin.end();
    }
    
    // Linux
    if (osName === 'linux') {
        const proc = require('child_process').spawn('clip.exe');
        proc.stdin.write(text);
        proc.stdin.end();
    }

    // Mac
    if (osName === 'darwin') {
        const proc = require('child_process').spawn('pbcopy');
        proc.stdin.write(text);
        proc.stdin.end();
    }

};
