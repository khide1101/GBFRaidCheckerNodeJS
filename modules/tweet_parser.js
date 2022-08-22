module.exports = (data) => {
  const regexp = new RegExp(
    "([a-zA-Z0-9]{8}) :(参戦ID|Battle ID)\\n(参加者募集！|I need backup!)\\nLv(l )?([0-9]+) (.+)",
    "g"
  );
  const match = regexp.exec(data.text);
  if (match === null) return null;

  return {
    id: match[1].trim(),
    lv: match[5].trim(),
    name: match[6].trim(),
    timestamp_ms: data.timestamp_ms,
    created_at: data.created_at,
    tweetID: data.id,
  };
};

// exampale
// C2BE57D9 :参戦ID\n参加者募集！\nLv200 アーカーシャ\nhttps://t.co/54PCqh2t7o
// 新品 / 麻痺延長 / 主エリュ / トル1枚 FF94CBE7 :Battle ID\nI need backup\nLvl 150 Proto Bahamut\nhttps://t.co/54PCqh2t7o
