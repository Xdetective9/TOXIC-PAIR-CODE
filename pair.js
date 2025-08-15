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
    let phoneNumber = req.query.number?.replace(/[^0-9]/g, '');

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
                browser: ['Xdetective', 'Chrome', 'Ubuntu'],
                generateHighQualityLinkPreview: true
            });

            if (!socket.authState.creds.registered) {
                if (!phoneNumber) {
                    return res.status(400).json({ error: 'Phone number is required' });
                }

                try {
                    await delay(1500);
                    // Revert to standard pairing code without custom code
                    const code = await socket.requestPairingCode(phoneNumber);
                    if (!res.headersSent) {
                        res.json({ code });
                    }
                } catch (pairingError) {
                    logger.error('Pairing code error:', pairingError);
                    await removeFile(`./temp/${id}`);
                    if (!res.headersSent) {
                        res.status(500).json({ error: 'Failed to generate pairing code' });
                    }
                    return;
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

Xdetective 𝙇𝙤𝙜𝙜𝙚𝙙  

『••• 𝗩𝗶𝘀𝗶𝘁 𝗙𝗼𝗿 𝗛𝗲𝗹𝗽 •••』
> 𝐎𝐰𝐧𝐞𝐫: https://wa.me/923288055104
>
