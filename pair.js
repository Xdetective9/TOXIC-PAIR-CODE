const PastebinAPI = require('pastebin-js'),
pastebin = new PastebinAPI('EMWTMkQAVfJa9kM-MRUrxd5Oku1U7pgL');
const { makeid } = require('./id');
const express = require('express');
const fs = require('fs');
const PhoneNumber = require('awesome-phonenumber');
let router = express.Router();
const pino = require("pino");
const {
  default: makeWASocket,
  useMultiFileAuthState,
  delay,
  makeCacheableSignalKeyStore,
  Browsers
} = require("baileys-elite");

function removeFile(FilePath) {
  if (!fs.existsSync(FilePath)) return false;
  fs.rmSync(FilePath, { recursive: true, force: true });
}

router.get('/', async (req, res) => {
  const id = makeid();
  let num = req.query.number;
  if (!num) {
    return res.status(400).json({ error: "Phone number is required" });
  }
  num = num.replace(/[^0-9]/g, '');
  const pn = new PhoneNumber('+' + num);
  if (!pn.isValid()) {
    return res.status(400).json({ error: "Invalid phone number" });
  }

  async function Toxic_MD_PAIR_CODE() {
    const { state, saveCreds } = await useMultiFileAuthState('./temp/' + id);
    try {
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
          let data = fs.readFileSync(__dirname + `/temp/${id}/creds.json`);
          let b64data = Buffer.from(data).toString('base64');
          let paste;
          try {
            paste = await pastebin.createPaste({
              text: b64data,
              title: `Session_${id}`,
              format: 'json',
              privacy: 1
            });
          } catch (pasteErr) {
            console.error("Pastebin error:", pasteErr);
            paste = "Failed to upload to Pastebin";
          }
          let Toxic_MD_TEXT = `
𝙎𝙀𝙎𝙎𝙄𝙊𝙉 𝘾𝙊𝙉𝙉𝙀𝘾𝙏𝙀𝘿
𝙏𝙤𝙭𝙞𝙘-𝙈𝘿 𝙇𝙤𝙜𝙴𝙙
『••• �_V𝗶𝘀𝗶𝘁 𝗙𝗼𝗿 𝗛𝗲𝗹𝗽 •••』
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
          await removeFile('./temp/' + id);
        } else if (connection === "close" && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode != 401) {
          await delay(10000);
          Toxic_MD_PAIR_CODE();
        }
      });
    } catch (err) {
      console.error("Error in pair.js:", err);
      await removeFile('./temp/' + id);
      if (!res.headersSent) {
        await res.status(503).json({ error: "Service Currently Unavailable" });
      }
    }
  }
  return await Toxic_MD_PAIR_CODE();
});

module.exports = router;