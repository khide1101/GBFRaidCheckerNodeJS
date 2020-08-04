class Keyword {
    static create(raidDatas) {
        const filterKeys    = Object.keys(raidDatas.switch).filter((key) => raidDatas.switch[key]);
        const filterDatas   = filterKeys.map((key) => raidDatas.detail[key]);
        const keywords      = this._makeKeywords(filterDatas);
        const streamKeyword = keywords.join(',');
        const searchKeyword = `(${keywords.join(') OR (')})`;
        return { streamKeyword, searchKeyword, filterKeys };
    }

    static _makeKeywords(datas) {
        const keywords = [];
        const jaPrefix = '参加者募集！';
        const enPrefix = 'I need backup!';
        datas.forEach((data) => {
            if (data.ja) keywords.push(`${jaPrefix} ${data.ja}`);
            if (data.en) keywords.push(`${enPrefix} ${data.en}`);
        });
        return keywords;
    }
}

module.exports = Keyword;
