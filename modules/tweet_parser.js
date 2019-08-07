module.exports = (data) => {
    try {

        const rowText = data.text;

        let battleID = '';
        let bossName = '';
        let bossLevel = '';

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

        return {
            id: battleID,
            lv: bossLevel,
            name: bossName,
        };

    } catch(e) {
        return null;
    }
};
