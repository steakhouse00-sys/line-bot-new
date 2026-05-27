const express = require("express");
const line = require("@line/bot-sdk");

const app = express();

const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};

const client = new line.Client(config);

// 紀錄資料
const counters = {};

app.post("/webhook", line.middleware(config), (req, res) => {
  Promise.all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

async function handleEvent(event) {
  if (event.type !== "message") {
    return Promise.resolve(null);
  }

  if (event.message.type !== "text") {
    return Promise.resolve(null);
  }

  const text = event.message.text;

  // 偵測 +1
  if (text.includes("+1")) {

    // 抓名稱
    const match = text.match(/@(.+?)\s*\+1/);

    if (match) {
      const name = match[1];

      if (!counters[name]) {
        counters[name] = 0;
      }

      counters[name]++;

      return client.replyMessage(event.replyToken, {
        type: "text",
        text:
`📋 ${name} 統計

目前人數：${counters[name]} 人`
      });
    }
  }

  return client.replyMessage(event.replyToken, {
    type: "text",
    text: `你說的是：${text}`,
  });
}

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log("Server running on " + port);
});
