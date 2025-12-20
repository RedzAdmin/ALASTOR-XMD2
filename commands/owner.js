const settings = require('../settings');

async function ownerCommand(sock, chatId, message = null) {
    try {
        const ownerInfo = `╭━━━━━━━━━━━━━━━━━━┈⊷
┃✮│➣ *👑 BOT OWNER*
╰━━━━━━━━━━━━━━━━━━┈⊷

╭━━━━━━━━━━━━━━━━━━┈⊷
┃✮│➣ *🤵 Name:* ${settings.botOwner}
┃✮│➣ *🪀 Number:* ${settings.ownerNumber}
┃✮│➣ *💻 Developer:* CODEBREAKER
┃✮│➣ *🎥 YouTube:* ${global.ytch || "unveiledhacking"}
╰━━━━━━━━━━━━━━━━━━┈⊷

╭━━━━━━━━━━━━━━━━━━┈⊷
┃✮│➣ *💬 Message:* Contact me for:
┃✮│➣ • Premium Access 🅿️
┃✮│➣ • Bug Reports 🐛
┃✮│➣ • Custom Features ⚙️
┃✮│➣ • Bot Issues 🔧
┃✮│➣ • Panel Sales
╰━━━━━━━━━━━━━━━━━━┈⊷
╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷
┃✮│➣ *📌 Note:* Only contact for legitimate business.
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷
`;
        const vcard = `
BEGIN:VCARD
VERSION:2.0
FN:${settings.botOwner}
TEL;waid=${settings.ownerNumber}:${settings.ownerNumber}
END:VCARD
`;

        // Send contact card
        await sock.sendMessage(chatId, {
            contacts: { 
                displayName: settings.botOwner, 
                contacts: [{ vcard }] 
            }
        });

        // Send owner info with design
        await sock.sendMessage(chatId, {
            text: ownerInfo,
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363404912601381@newsletter',
                    newsletterName: 'ALASTOR-XMD',
                    serverMessageId: -1
                }
            }
        }, { quoted: message });

    } catch (error) {
        console.error('Owner command error:', error);
        
        // Fallback simple message
        await sock.sendMessage(chatId, {
            text: `👑 *Bot Owner*\n\nName: ${settings.botOwner}\nNumber: ${settings.ownerNumber}\nDeveloper: CODEBREAKER`,
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363404912601381@newsletter',
                    newsletterName: 'ALASTOR-XMD',
                    serverMessageId: -1
                }
            }
        }, { quoted: message });
    }
}

module.exports = ownerCommand;