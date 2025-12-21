// isAdmin.js
async function isAdmin(sock, m) {
    try {
        // Extract parameters from m object
        const chatId = m.from || m.chatId;
        const senderId = m.sender || m.userId || m.author;
        
        if (!chatId.endsWith('@g.us')) {
            return { isSenderAdmin: false, isBotAdmin: false };
        }

        const metadata = await sock.groupMetadata(chatId);
        const participants = metadata.participants || [];

        // Get bot ID
        const botUser = sock.user;
        let botJid = '';
        
        if (botUser && botUser.id) {
            botJid = botUser.id.includes(':') ? botUser.id.split(':')[0] : botUser.id;
        } else if (botUser && botUser.jid) {
            botJid = botUser.jid.includes(':') ? botUser.jid.split(':')[0] : botUser.jid;
        }

        // Ensure botJid ends with @s.whatsapp.net
        if (botJid && !botJid.includes('@')) {
            botJid = botJid + '@s.whatsapp.net';
        }

        // Clean sender ID
        let cleanSenderId = senderId;
        if (senderId.includes(':')) {
            cleanSenderId = senderId.split(':')[0] + '@s.whatsapp.net';
        } else if (!senderId.includes('@')) {
            cleanSenderId = senderId + '@s.whatsapp.net';
        }

        // Check if bot is admin
        let isBotAdmin = false;
        if (botJid) {
            const botParticipant = participants.find(p => {
                let participantJid = p.id;
                if (participantJid.includes(':')) {
                    participantJid = participantJid.split(':')[0] + '@s.whatsapp.net';
                }
                return participantJid === botJid;
            });
            
            isBotAdmin = botParticipant ? (botParticipant.admin === 'admin' || botParticipant.admin === 'superadmin') : false;
        }

        // Check if sender is admin
        let isSenderAdmin = false;
        const senderParticipant = participants.find(p => {
            let participantJid = p.id;
            if (participantJid.includes(':')) {
                participantJid = participantJid.split(':')[0] + '@s.whatsapp.net';
            }
            return participantJid === cleanSenderId;
        });
        
        isSenderAdmin = senderParticipant ? (senderParticipant.admin === 'admin' || senderParticipant.admin === 'superadmin') : false;

        return { isSenderAdmin, isBotAdmin };
    } catch (err) {
        console.error('❌ Error in isAdmin:', err);
        return { isSenderAdmin: false, isBotAdmin: false };
    }
}

module.exports = isAdmin;