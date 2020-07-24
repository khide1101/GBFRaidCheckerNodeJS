module.exports = (data) => {
    const regexp = new RegExp("([a-zA-Z0-9]{8}) :(参戦ID|Battle ID)\\n(参加者募集！|I need backup!)\\nLv(l )?([0-9]+) (.+)", "g");
    const match  = regexp.exec(data.text);

    if (match === null) return null;

    return {
        id: match[1].trim(),
        lv: match[5].trim(),
        name: match[6].trim(),
        timestamp_ms: data.timestamp_ms,
        created_at: data.created_at,
        tweetID: data.id
    };
};


/*
    [旧パース処理]

    const regexp1 = new RegExp("([a-zA-Z0-9]{8}) :(参戦ID|Battle ID)", "g");
    const match1  = regexp1.exec(rowText);

    if (match1 === null) throw new Error("解析に失敗(1)");
    battleID = match1[1].trim();

    const regexp2 = new RegExp('(参加者募集！|I need backup!)\\n(.+)\\n', "g");
    const match2  = regexp2.exec(rowText);

    if (match2 === null) throw new Error("解析に失敗(2)");
    bossName = match2[2].trim();

    const regexp3 = new RegExp('Lv(l )?([0-9]+) (.+)', "g");
    const match3  = regexp3.exec(bossName);
    if (match3 !== null) {
        bossName = match3[3].trim();
        bossLevel = match3[2].trim();
    }
*/

// C2BE57D9 :参戦ID\n参加者募集！\nLv200 アーカーシャ\nhttps://t.co/54PCqh2t7o
// 新品 / 麻痺延長 / 主エリュ / トル1枚 FF94CBE7 :Battle ID\nI need backup\nLvl 150 Proto Bahamut\nhttps://t.co/54PCqh2t7o
