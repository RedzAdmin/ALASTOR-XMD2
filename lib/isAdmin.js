// isAdmin.js - Robust version
async function isAdmin(sock, m) {
    try {
        // Extract parameters safely
        let chatId = '';
        let senderId = '';
        
        if (typeof m === 'object' && m !== null) {
            // Called as isAdmin(sock, m)
            chatId = m?.from || m?.chatId || m?.key?.remoteJid || '';
            senderId = m?.sender || m?.userId || m?.author || 
                      (m?.key?.participant || m?.key?.remoteJid || '');
        } else if (typeof m === 'string') {
            // Called as isAdmin(sock, chatId, senderId)
            chatId = m;
            senderId = arguments[2] || '';
        }
        
        // Validate chatId
        if (!chatId || typeof chatId !== 'string' || !chatId.endsWith('@g.us')) {
            return { isSenderAdmin: false, isBotAdmin: false };
        }
        
        // Get group metadata
        const metadata = await sock.groupMetadata(chatId);
        const participants = metadata.participants || [];
        
        // Get bot user info
        const botUser = sock.user;
        let botJid = '';
        
        if (botUser?.id) {
            botJid = botUser.id.includes(':') ? 
                    botUser.id.split(':')[0] + '@s.whatsapp.net' : 
                    botUser.id;
        } else if (botUser?.jid) {
            botJid = botUser.jid.includes(':') ? 
                    botUser.jid.split(':')[0] + '@s.whatsapp.net' : 
                    botUser.jid;
        }
        
        // Format sender ID
        let cleanSenderId = senderId;
        if (cleanSenderId && typeof cleanSenderId === 'string') {
            if (cleanSenderId.includes(':')) {
                cleanSenderId = cleanSenderId.split(':')[0] + '@s.whatsapp.net';
            } else if (!cleanSenderId.includes('@')) {
                cleanSenderId = cleanSenderId + '@s.whatsapp.net';
            }
        }
        
        // Check bot admin status
        let isBotAdmin = false;
        if (botJid) {
            const botParticipant = participants.find(p => {
                let participantJid = p.id || '';
                if (participantJid.includes(':')) {
                    participantJid = participantJid.split(':')[0] + '@s.whatsapp.net';
                }
                return participantJid === botJid;
            });
            
            isBotAdmin = botParticipant ? 
                (botParticipant.admin === 'admin' || botParticipant.admin === 'superadmin') : 
                false;
        }
        
        // Check sender admin status
        let isSenderAdmin = false;
        if (cleanSenderId) {
            const senderParticipant = participants.find(p => {
                let participantJid = p.id || '';
                if (participantJid.includes(':')) {
                    participantJid = participantJid.split(':')[0] + '@s.whatsapp.net';
                }
                return participantJid === cleanSenderId;
            });
            
            isSenderAdmin = senderParticipant ? 
                (senderParticipant.admin === 'admin' || senderParticipant.admin === 'superadmin') : 
                false;
        }
        
        return { isSenderAdmin, isBotAdmin };
        
    } catch (error) {
        console.error('❌ Error in isAdmin:', error.message);
        return { isSenderAdmin: false, isBotAdmin: false };
    }
}

module.exports = isAdmin;