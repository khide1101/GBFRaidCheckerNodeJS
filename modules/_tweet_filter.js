module.exports = (tweetObj, filterDatas) => {

    if (tweetObj === null || tweetObj === undefined) return null;

    const res = filterDatas.some((data) => {
        if (String(tweetObj.lv) === String(data.lv)) {
            const match = data.ja.concat(data.en).join(' ');
            const matchWords = match.split(',');
            for (let i = 0; i < matchWords.length; i++) {
                if (tweetObj.name.indexOf(matchWords[i]) >= 0) {
                    return true;
                }
            }
        } 
        return false;
    });

    return (res) ? tweetObj : null;
};
