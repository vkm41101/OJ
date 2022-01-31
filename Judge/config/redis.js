const redis = require("redis");

const client = redis.createClient();

(async () => {
  await client.connect();
})();

client.on("error", (err) => {
  console.log("Error: %s", err);
});

setInRedis = async (key, data) => {
  await client.set(key, data);
};

getFromRedis = async (key) => {
  return await client.get(key, (err, data) => {
    if (err) {
      throw err;
    } else {
      return data;
    }
  });
};

module.exports = { getFromRedis, setInRedis };
