/*
 * ブースト強度設定
 * - default: boostOFF時に、SearchAPIを叩く間隔の秒数(ms)
 * - boost: boostON時に、SearchAPIを叩く間隔の秒数(ms)
 * ※ 自前でカスタムする場合、default値 ÷ boost値 の 余りが0になるようにする事。
 */

const boostProfile = {
    normal: { default: 5000, boost: 1000 },
    highSpeed: { default: 2100, boost: 2100 },
    accelerate: { default: 10000, boost: 500 }
};

module.exports = (level) => {
    return boostProfile[level] || boostProfile['normal'];
};
