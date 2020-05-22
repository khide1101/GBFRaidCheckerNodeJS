module.exports = (raidDatas) => {
    const keywords = [];
    const jaPrefix = '参加者募集！';
    const enPrefix = 'I need backup!';

    raidDatas.forEach((data) => {
        if (data.ja) keywords.push(`${jaPrefix} ${data.ja}`);
        if (data.en) keywords.push(`${enPrefix} ${data.en}`);
    });

    return keywords;
};
