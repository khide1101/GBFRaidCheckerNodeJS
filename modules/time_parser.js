module.exports = (obj) => {
    const now = new Date();

    if (obj.timestamp_ms) {
        const tweetTime = parseInt(obj.timestamp_ms, 10);
        const d = new Date(tweetTime);
        const delay = (now.getTime() - tweetTime) / 1000;
        return { delay, timeStr: `${d.getHours()}:${d.getMinutes()}:${d.getSeconds()} [遅延：${delay}s]` };
    }
    
    if (obj.created_at) {
        const d = new Date(obj.created_at);
        const delay = (now.getTime() - d.getTime()) / 1000;
        return { delay, timeStr: `${d.getHours()}:${d.getMinutes()}:${d.getSeconds()} [遅延：${delay}s]` };
    }

    return '';
};
