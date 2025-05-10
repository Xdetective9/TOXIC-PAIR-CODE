const PastebinAPI = require('pastebin-js'),
pastebin = new PastebinAPI('EMWTMkQAVfJa9kM-MRUrxd5Oku1U7pgL');
const { makeid } = require('./id');
const express = require('express');
const KeyedDB = require('@adiwajshing/keyed-db').default;
const pino = require("pino");
const {
  default: makeWASocket,
  fetchLatestBaileysVersion,
  delay,
  makeCacheableSignalKeyStore,
  Browsers
} = require("baileys-elite");

let router = express.Router();

// Initialize KeyedDB for session storage
const sessionDB = new KeyedDB(
  {
    id: (item) => item.sessionId,
    compare: (a, b) => a.sessionId.localeCompare(b.sessionId)
  },
  () => ({ sessionId: '', creds: {}, keys: {} })
);

// Custom auth state with KeyedDB
async function useKeyedAuthState(sessionId) {
  let session = sessionDB.get({ sessionId });
  if (!session) {
    session = sessionDB.insert({ sessionId, creds: {}, keys: {} });
  }
  return {
    state: {
      creds: session.creds,
      keys: session.keys
    },
    saveCreds: async () => {
      sessionDB.update({ sessionId }, (item) => {
        item.creds = session.creds;
        item.keys = session.keys;
      });
    }
  };
}

router.get('/', async (req, res) => {
  const id = makeid();
  let num = req.query.number;
  async function Toxic_MD_PAIR_CODE() {
    const { state, saveCreds } = await useKeyedAuthState(id);
    try {
      const { version } = await fetchLatestBaileysVersion();
      let Pair_Code_By_Toxic_Tech = makeWASocket({
        auth: {
          creds: state.creds,
          keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" }).child({ level: "silent" })),
        },
        printQRInTerminal: false,
        logger: pino({ level: "silent" }).child({ level: "silent" }),
        browser: ["Chrome (Ubuntu)", "Chrome (Linux)", "Chrome (MacOs)"],
        connectTimeoutMs: 10000,
        keepAliveIntervalMs: 15000,
        generateHighQualityLinkPreview: false,
        syncFullHistory: false
      });

      if (!Pair_Code_By_Toxic_Tech.authState.creds.registered) {
        await delay(1500);
        num = num.replace(/[^0-9]/g, '');
        const code = await Pair_Code_By_Toxic_Tech.requestPairingCode(num);
        if (!res.headersSent) {
          await res.send({ code });
        }
      }

      Pair_Code_By_Toxic_Tech.ev.on('creds.update', saveCreds);
      Pair_Code_By_Toxic_Tech.ev.on("connection.update", async (s) => {
        const { connection, lastDisconnect } = s;
        if (connection == "open") {
          await delay(5000);
          let sessionData = JSON.stringify(state);
          let paste = await pastebin.createPaste({
            text: sessionData,
            title: `Session_${id}`,
            format: 'json',
            privacy: 1
          });
          let Toxic_MD_TEXT = `
𝙎𝙀𝙎𝙎𝙄𝙊𝙉 𝘾𝙊𝙉𝙉𝙀𝘾𝙏𝙀𝘿
𝙏𝙤𝙭𝙞𝙘-𝙈𝘿 𝙇𝙤𝙜𝙜𝙚𝙙
『••• 𝗩𝗶𝘀𝗶𝘁 𝗙𝗼𝗿 𝗛𝗲𝗹𝗽 •••』
> 𝐎𝐰𝐧𝐞𝐫: _https://wa.me/254735342808_
> 𝐑𝐞𝐩𝐨: _https://github.com/xhclintohn/Toxic-MD_
> 𝐖𝐚𝐆𝐫𝐨𝐮𝐩: _https://chat.whatsapp.com/GoXKLVJgTAAC3556FXkfFI_
> 𝐖𝐚𝐂𝐡𝐚𝐧𝐧𝐞𝐥: _https://whatsapp.com/channel/0029VagJlnG6xCSU2tS1Vz19_
> 𝐈𝐧𝐬𝐭𝐚𝐠𝐫𝐚𝐦: _https://www.instagram.com/xh_clinton_
Session Data: ${paste}
Don't Forget To Give Star⭐ To My Repo :)`;
          await Pair_Code_By_Toxic_Tech.sendMessage(Pair_Code_By_Toxic_Tech.user.id, { text: Toxic_MD_TEXT });
          await delay(100);
          await Pair_Code_By_Toxic_Tech.ws.close();
          sessionDB.delete({ sessionId: id });
        } else if (connection === "close" && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode != 401) {
          await delay(10000);
          Toxic_MD_PAIR_CODE();
        }
      });
    } catch (err) {
      console.log("service restarted");
      sessionDB.delete({ sessionId: id });
      if (!res.headersSent) {
        await res.send({ code: "Service Currently Unavailable" });
      }
    }
  }
  return await Toxic_MD_PAIR_CODE();
});

module.exports = router;