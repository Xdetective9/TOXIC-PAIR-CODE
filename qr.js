const PastebinAPI = require('pastebin-js'),
pastebin = new PastebinAPI('EMWTMkQAVfJa9kM-MRUrxd5Oku1U7pgL');
const { makeid } = require('./id');
const QRCode = require('qrcode');
const express = require('express');
const KeyedDB = require('@adiwajshing/keyed-db').default;
const pino = require("pino");
const {
  default: makeWASocket,
  fetchLatestBaileysVersion,
  Browsers,
  delay
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
  async function Toxic_MD_QR_CODE() {
    const { state, saveCreds } = await useKeyedAuthState(id);
    try {
      const { version } = await fetchLatestBaileysVersion();
      let Qr_Code_By_Toxic_Tech = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: "silent" }),
        browser: Browsers.macOS("Desktop"),
        connectTimeoutMs: 10000,
        keepAliveIntervalMs: 15000,
        generateHighQualityLinkPreview: false,
        syncFullHistory: false
      });

      Qr_Code_By_Toxic_Tech.ev.on('creds.update', saveCreds);
      Qr_Code_By_Toxic_Tech.ev.on("connection.update", async (s) => {
        const { connection, lastDisconnect, qr } = s;
        if (qr) {
          await res.end(await QRCode.toBuffer(qr));
        }
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
*𝙏𝙤𝙭𝙞𝙘 𝙈𝘿 𝙇𝙊𝙂𝙂𝙀𝘿*
______________________________
╔════◇
『••• 𝗩𝗶𝘀𝗶𝘁 𝗙𝗼𝗿 𝗛𝗲𝗹𝗽 •••』
║❍ 𝐎𝐰𝐧𝐞𝐫: _https://wa.me/254735342808_
║❍ 𝐑𝐞𝐩𝐨: _https://github.com/xhclintohn/Toxic-MD_
║❍ 𝐖𝐚𝐆𝐫𝐨𝐮𝐩: _https://chat.whatsapp.com/GoXKLVJgTAAC3556FXkfFI_
║❍ 𝐖𝐚𝐂𝐡𝐚𝐧𝐧𝐞𝐥: _https://whatsapp.com/channel/0029VagJlnG6xCSU2tS1Vz19_
║❍ 𝐈𝐧𝐬𝐭𝐚𝐠𝐫𝐚𝐦: _https://www.instagram.com/mr.xh_clusive_
______________________________
Session Data: ${paste}
Don't Forget To Give Star⭐ To My Repo`;
          await Qr_Code_By_Toxic_Tech.sendMessage(Qr_Code_By_Toxic_Tech.user.id, { text: Toxic_MD_TEXT });
          await delay(100);
          await Qr_Code_By_Toxic_Tech.ws.close();
          sessionDB.delete({ sessionId: id });
        } else if (connection === "close" && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode != 401) {
          await delay(10000);
          Toxic_MD_QR_CODE();
        }
      });
    } catch (err) {
      if (!res.headersSent) {
        await res.json({ code: "Service is Currently Unavailable" });
      }
      console.log(err);
      sessionDB.delete({ sessionId: id });
    }
  }
  return await Toxic_MD_QR_CODE();
});

module.exports = router;