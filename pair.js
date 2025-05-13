const PastebinAPI = require("pastebin-js");
const pastebin = new PastebinAPI("EMWTMkQAVfJa9kM-MRUrxd5Oku1U7pgL");
const { makeid } = require("./id");
const express = require("express");
const fs = require("fs");
const pino = require("pino");
const {
    default: Toxic_Tech,
    useMultiFileAuthState,
    delay,
    makeCacheableSignalKeyStore,
} = require("maher-zubair-baileys");

const router = express.Router();

function removeFile(filePath) {
    if (!fs.existsSync(filePath)) return false;
    fs.rmSync(filePath, { recursive: true, force: true });
    return true;
}

router.get("/", async (req, res) => {
    const id = makeid();
    let num = req.query.number;

    async function Toxic_MD_PAIR_CODE() {
        try {
            const { state, saveCreds } = await useMultiFileAuthState(`./temp/${id}`);

            const Pair_Code_By_Toxic_Tech = Toxic_Tech({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" })),
                },
                printQRInTerminal: false,
                logger: pino({ level: "silent" }),
                browser: ["TOXIC", "Safari", "3.0"], // Match original browser config
            });

            if (!Pair_Code_By_Toxic_Tech.authState.creds.registered) {
                await delay(1500);
                num = num.replace(/[^0-9]/g, "");
                const code = await Pair_Code_By_Toxic_Tech.requestPairingCode(num);
                if (!res.headersSent) {
                    res.send({ code });
                }
            }

            Pair_Code_By_Toxic_Tech.ev.on("creds.update", saveCreds);

            Pair_Code_By_Toxic_Tech.ev.on("connection.update", async (s) => {
                const { connection, lastDisconnect } = s;
                if (connection === "open") {
                    await delay(5000);
                    const data = fs.readFileSync(`./temp/${id}/creds.json`);
                    const b64data = Buffer.from(data).toString("base64");

                    const Toxic_MD_TEXT = `
𝙎𝙀𝙎𝙎𝙄𝙊𝙉 𝘾𝙊𝙉𝙉𝙀𝘾𝙏𝙀𝘿

𝙏𝙤𝙭𝙞𝙘-𝙈𝘿 𝙇𝙤𝙜𝙜𝙚𝙙  

『••• 𝗩𝗶𝘀𝗶𝘁 𝗙𝗼𝗿 𝗛𝗲𝗹𝗽 •••』
> 𝐎𝐰𝐧𝐞𝐫: 
https://wa.me/254735342808

> 𝐑𝐞𝐩𝐨: 
https://github.com/xhclintohn/Toxic-MD

> 𝐖𝐚𝐆𝐫𝐨𝐮𝐩: 
https://chat.whatsapp.com/GoXKLVJgTAAC3556FXkfFI

> 𝐖𝐚𝐂𝐡𝐚𝐧𝐧𝐞𝐥:
https://whatsapp.com/channel/0029VagJlnG6xCSU2tS1Vz19

> 𝐈𝐧𝐬𝐭𝐚𝐠𝐫𝐚𝐦:
https://www.instagram.com/xh_clinton

Don't Forget To Give Star⭐ To My Repo :)`;

                    const session = await Pair_Code_By_Toxic_Tech.sendMessage(Pair_Code_By_Toxic_Tech.user.id, { text: b64data });
                    await Pair_Code_By_Toxic_Tech.sendMessage(Pair_Code_By_Toxic_Tech.user.id, { text: Toxic_MD_TEXT }, { quoted: session });

                    await delay(100);
                    await Pair_Code_By_Toxic_Tech.ws.close();
                    removeFile(`./temp/${id}`);
                } else if (connection === "close" && lastDisconnect?.error?.output?.statusCode !== 401) {
                    await delay(10000);
                    Toxic_MD_PAIR_CODE(); // Retry connection
                } else if (lastDisconnect?.error?.output?.statusCode === 401) {
                    removeFile(`./temp/${id}`);
                    if (!res.headersSent) {
                        res.send({ code: "Session logged out. Please try again." });
                    }
                }
            });
        } catch (err) {
            console.error("Error in Toxic_MD_PAIR_CODE:", err);
            removeFile(`./temp/${id}`);
            if (!res.headersSent) {
                res.send({ code: "Service Currently Unavailable" });
            }
        }
    }

    await Toxic_MD_PAIR_CODE();
});

module.exports = router;