module.exports = (obj) => {
    const now = new Date();

    let delay = '';
    // let timeStr = '';

    if (obj.timestamp_ms) {
        const tweetTime = parseInt(obj.timestamp_ms, 10);
        delay = (now.getTime() - tweetTime) / 1000;
        // const d = new Date(tweetTime);
        // timeStr = `${d.getHours()}:${d.getMinutes()}:${d.getSeconds()} [遅延：${delay}s]`;
    }

    if (obj.created_at) {
        const d = new Date(obj.created_at);
        delay = (now.getTime() - d.getTime()) / 1000;
        // timeStr = `${d.getHours()}:${d.getMinutes()}:${d.getSeconds()} [遅延：${delay}s]`;
    }

    return { delay };
};
