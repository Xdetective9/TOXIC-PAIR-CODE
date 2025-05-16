const PastebinAPI = require('pastebin-js');
const pastebin = new PastebinAPI('EMWTMkQAVfJa9kM-MRUrxd5Oku1U7pgL');
const { makeid } = require('./id');
const express = require('express');
const fs = require('fs').promises;
const pino = require('pino');
const {
    default: makeWASocket,
    useMultiFileAuthState,
    delay,
    makeCacheableSignalKeyStore,
    DisconnectReason
} = require('baileys-elite');

const router = express.Router();
const logger = pino({ level: 'silent' }).child({ level: 'silent' });

async function removeFile(filePath) {
    try {
        if (await fs.access(filePath).then(() => true).catch(() => false)) {
            await fs.rm(filePath, { recursive: true, force: true });
            return true;
        }
        return false;
    } catch (err) {
        logger.error('Error removing file:', err);
        return false;
    }
}

router.get('/', async (req, res) => {
    const id = makeid();
    let number = req.query.number?.replace(/[^0-9]/g, '');

    async function connectToxicMD() {
        try {
            const { state, saveCreds } = await useMultiFileAuthState(`./temp/${id}`);

            const socket = makeWASocket({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, logger)
                },
                printQRInTerminal: false,
                logger,
                browser: ["Chrome (Ubuntu)"],
                generateHighQualityLinkPreview: true
            });

            if (!socket.authState.creds.registered) {
                if (!number) {
                    return res.status(400).json({ error: 'Phone number is required' });
                }

                await delay(1500);
                const code = await socket.requestPairingCode(number);
                if (!res.headersSent) {
                    res.json({ code });
                }
            }

            socket.ev.on('creds.update', saveCreds);

            socket.ev.on('connection.update', async ({ connection, lastDisconnect }) => {
                try {
                    if (connection === 'open') {
                        await delay(5000);
                        const credsData = await fs.readFile(`./temp/${id}/creds.json`);
                        const b64data = Buffer.from(credsData).toString('base64');

                        const Toxic_MD_TEXT = `
𝙎𝙀𝙎𝙎𝙄𝙊𝙉 𝘾𝙊𝙉𝙉𝙀𝘾𝙏𝙀𝘿

𝙏𝙤𝙭𝙞𝙘-𝙈𝘿 𝙇𝙤𝙜𝙜𝙚𝙙  

『••• 𝗩𝗶𝘀𝗶𝘁 𝗙𝗼𝗿 𝗛𝗲𝗹𝗽 •••』
> 𝐎𝐰𝐧𝐞𝐫: https://wa.me/254735342808
> 𝐑𝐞𝐩𝐨: https://github.com/xhclintohn/Toxic-MD
> 𝐖𝐚𝐆𝐫𝐨𝐮𝐩: https://chat.whatsapp.com/GoXKLVJgTAAC3556FXkfFI
> 𝐖𝐚𝐂𝐡𝐚𝐧𝐧𝐞𝐥: https://whatsapp.com/channel/0029VagJlnG6xCSU2tS1Vz19
> 𝐈𝐧𝐬𝐭𝐚𝐠𝐫𝐚𝐦: https://www.instagram.com/xh_clinton_

Don't Forget To Give Star⭐ To My Repo :)`;

                        const sessionMsg = await socket.sendMessage(socket.user.id, { 
                            text: b64data 
                        });

                        await socket.sendMessage(socket.user.id, {
                            text: Toxic_MD_TEXT
                        }, { quoted: sessionMsg });

                        await delay(1000);
                        socket.ws.close();
                        await removeFile(`./temp/${id}`);
                    } else if (connection === 'close') {
                        const statusCode = lastDisconnect?.error?.output?.statusCode;
                        if (statusCode !== DisconnectReason.loggedOut) {
                            await delay(10000);
                            connectToxicMD();
                        } else {
                            await removeFile(`./temp/${id}`);
                            if (!res.headersSent) {
                                res.status(500).json({ error: 'Session logged out' });
                            }
                        }
                    }
                } catch (err) {
                    logger.error('Connection update error:', err);
                    await removeFile(`./temp/${id}`);
                    if (!res.headersSent) {
                        res.status(500).json({ error: 'Connection error' });
                    }
                }
            });
        } catch (err) {
            logger.error('Connection attempt error:', err);
            await removeFile(`./temp/${id}`);
            if (!res.headersSent) {
                res.status(503).json({ error: 'Service temporarily unavailable' });
            }
        }
    }

    await connectToxicMD();
});

module.exports = router;