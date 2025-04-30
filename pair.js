const PastebinAPI = require('pastebin-js'),
pastebin = new PastebinAPI('EMWTMkQAVfJa9kM-MRUrxd5Oku1U7pgL')
const {makeid} = require('./id');
const express = require('express');
const fs = require('fs');
const path = require('path');
let router = express.Router()
const pino = require("pino");
const logger = pino({ level: "info" });
const {
    default: Xhclinton_Tech,
    useMultiFileAuthState,
    delay,
    makeCacheableSignalKeyStore,
    Browsers
} = require("maher-zubair-baileys");

function removeFile(FilePath) {
    if (!fs.existsSync(FilePath)) return false;
    try {
        fs.rmSync(FilePath, { recursive: true, force: true });
        logger.info(`Removed directory: ${FilePath}`);
        return true;
    } catch (err) {
        logger.error(`Failed to remove directory ${FilePath}: ${err.message}`);
        return false;
    }
}

router.get('/code', async (req, res) => {
    const id = makeid();
    let num = req.query.number;

    if (!num) {
        logger.warn("No phone number provided");
        return res.status(400).send({ code: "Phone number is required", error: "No number provided" });
    }

    num = num.replace(/[^0-9]/g, '');
    if (num.length < 10 || num.length > 15) {
        logger.warn(`Invalid phone number format: ${num}`);
        return res.status(400).send({ code: "Invalid phone number format", error: "Number must be 10-15 digits" });
    }

    // Ensure temp directory exists
    const tempDir = path.join(__dirname, 'temp');
    try {
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
            logger.info(`Created temp directory: ${tempDir}`);
        }
    } catch (err) {
        logger.error(`Failed to create temp directory: ${err.message}`);
        return res.status(500).send({ code: "Server Error", error: "Failed to initialize temp directory" });
    }

    async function XHCLINTON_MD_PAIR_CODE() {
        try {
            logger.info(`Initializing auth state for ID: ${id}`);
            const { state, saveCreds } = await useMultiFileAuthState(path.join(__dirname, 'temp', id));

            let Pair_Code_By_Xhclinton_Tech = Xhclinton_Tech({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
                },
                printQRInTerminal: false,
                logger: pino({ level: "fatal" }).child({ level: "fatal" }),
                browser: ["Chrome (Ubuntu)", "Chrome (Linux)", "Chrome (MacOs)"]
            });

            if (!Pair_Code_By_Xhclinton_Tech.authState.creds.registered) {
                await delay(1500);
                logger.info(`Requesting pairing code for number: ${num}`);
                const code = await Pair_Code_By_Xhclinton_Tech.requestPairingCode(num);
                if (!res.headersSent) {
                    logger.info(`Pairing code generated: ${code}`);
                    await res.send({ code });
                }
            }

            Pair_Code_By_Xhclinton_Tech.ev.on('creds.update', saveCreds);
            Pair_Code_By_Xhclinton_Tech.ev.on("connection.update", async (s) => {
                const { connection, lastDisconnect } = s;
                if (connection == "open") {
                    await delay(5000);
                    let data = fs.readFileSync(path.join(__dirname, `temp/${id}/creds.json`));
                    await delay(800);
                    let b64data = Buffer.from(data).toString('base64');
                    let session = await Pair_Code_By_Xhclinton_Tech.sendMessage(Pair_Code_By_Xhclinton_Tech.user.id, { text: '' + b64data });

                    let XHCLINTON_MD_TEXT = `
        𝙎𝙀𝙎𝙎𝙄𝙊𝙉 𝘾𝙊𝙉𝙉𝙀𝘾𝙏𝙀𝘿
        
         𝙏𝙤𝙭𝙞𝙘-𝙈𝘿 𝙇𝙤𝙜𝙜𝙚𝙙  

『••• 𝗩𝗶𝘀𝗶𝘁 𝗙𝗼𝗿 𝗛𝗲𝗹𝗽 •••』
> 𝐎𝐰𝐧𝐞𝐫: 
_https://wa.me/254735342808_

> 𝐑𝐞𝐩𝐨: 
_https://github.com/xhclintohn/Toxic-MD_

> 𝐖𝐚𝐆𝐫𝐨𝐮𝐩: 
_https://chat.whatsapp.com/GoXKLVJgTAAC3556FXkfFI_

> 𝐖𝐚𝐂𝐡𝐚𝐧𝐧𝐞𝐥:
 _https://whatsapp.com/channel/0029VagJlnG6xCSU2tS1Vz19_
 
> 𝐈𝐧𝐬𝐭𝐚𝐠𝐫𝐚𝐦:
 _https://www.instagram.com/xh_clinton_

Don't Forget To Give Star and fork My Repo :)`

                    await Pair_Code_By_Xhclinton_Tech.sendMessage(Pair_Code_By_Xhclinton_Tech.user.id, { text: XHCLINTON_MD_TEXT }, { quoted: session });

                    await delay(100);
                    await Pair_Code_By_Xhclinton_Tech.ws.close();
                    await removeFile(path.join(__dirname, 'temp', id));
                } else if (connection === "close" && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode != 401) {
                    logger.warn(`Connection closed, retrying: ${lastDisconnect.error.message}`);
                    await delay(10000);
                    XHCLINTON_MD_PAIR_CODE();
                }
            });
        } catch (err) {
            logger.error(`Error in XHCLINTON_MD_PAIR_CODE: ${err.message}`);
            await removeFile(path.join(__dirname, 'temp', id));
            if (!res.headersSent) {
                let errorMessage = "Service Currently Unavailable";
                if (err.message.includes("network")) {
                    errorMessage = "Network error connecting to WhatsApp servers";
                } else if (err.message.includes("invalid")) {
                    errorMessage = "Invalid phone number or request format";
                }
                await res.status(500).send({ code: "Service Unavailable", error: errorMessage });
            }
        }
    }

    return await XHCLINTON_MD_PAIR_CODE();
});

module.exports = router;