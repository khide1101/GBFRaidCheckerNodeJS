/*
 * ブースト強度設定
 * - default: boost[OFF]時に、SearchAPIを叩く間隔の秒数(ms)
 * - boost:   boost[ON]時に、SearchAPIを叩く間隔の秒数(ms)
 * ※自前でカスタムする場合、default値 ÷ boost値 の 余りが0になるようにする事。
 */

const boostProfile = {
    normal: {
        default: 5000,
        boost: 1000
    },
    highSpeed: {
        default: 2100,
        boost: 2100
    },
    doubleSpeed: {
        default: 1050,
        boost: 1050
    },
    transam: {
        default: 10000,
        boost: 500
    },
    transamBurst: {
        default: 9000,
        boost: 300
    }
};

module.exports = (key) => {
    return boostProfile[key] || boostProfile.normal;
};
