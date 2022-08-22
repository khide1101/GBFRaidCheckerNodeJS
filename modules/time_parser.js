module.exports = (obj) => {
  const now = new Date();

  let delay = "";

  if (obj.created_at) {
    const d = new Date(obj.created_at);

    delay = (now.getTime() - d.getTime()) / 1000;
  }

  return { delay };
};
