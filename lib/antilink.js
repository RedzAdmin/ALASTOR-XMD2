const { isJidGroup } = require('@whiskeysockets/baileys');

const WARN_COUNT = 3; // Default warning count

/**
 * Checks if a string contains a URL.
 *
 * @param {string} str - The string to check.
 * @returns {boolean} - True if the string contains a URL, otherwise false.
 */
function containsURL(str) {
    if (!str || typeof str !== 'string') return false;
    const urlRegex = /(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(\/[^\s]*)?/i;
    return urlRegex.test(str);
}

/**
 * Handles the Antilink functionality for group chats.
 *
 * @param {object} msg - The message object to process.
 * @param {object} sock - The socket object to use for sending messages.
 */
async function Antilink(msg, sock) {
    try {
        const jid = msg.key?.remoteJid;
        if (!jid || !isJidGroup(jid)) return;

        const SenderMessage = msg.message?.conversation || 
                             msg.message?.extendedTextMessage?.text || '';
        if (!SenderMessage || typeof SenderMessage !== 'string') return;

        const sender = msg.key?.participant || msg.key?.remoteJid;
        if (!sender) return;
        
        // Check for URLs
        if (!containsURL(SenderMessage.trim())) return;
        
        // Delete the message with link
        try {
            await sock.sendMessage(jid, { delete: msg.key });
        } catch (deleteError) {
            console.log('Could not delete message:', deleteError.message);
        }
        
        // Warn the user
        await sock.sendMessage(jid, { 
            text: `╭━━━━━━━━━━━━━━━━━┈⊷\n│⚠️ *LINK DETECTED*\n╰━━━━━━━━━━━━━━━━━┈⊷\n\n@${sender.split('@')[0]} Links are not allowed here!`,
            mentions: [sender] 
        });
        
    } catch (error) {
        console.error('Error in Antilink:', error);
    }
}

module.exports = { Antilink };