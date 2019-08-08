const player = require('play-sound')(opts = {})

module.exports = (volume) => {
    if (!volume) volume = 0.5;
    player.play('sound.wav', { afplay: ['-v', volume ] }, function(err){
        // if (err) throw err
    });
};
