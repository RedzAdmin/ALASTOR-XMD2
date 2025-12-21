const fs = require('fs');
const path = require('path');

module.exports = {
    name: "blocklist",
    alias: ["listblocked", "blockedlist", "blocked"],
    desc: "Show list of blocked users",
    category: "Moderation",
    usage: "blocklist",
    react: "📋",
    start: async (Miku, m, { text, prefix, isCreator }) => {
        if (!isCreator) {
            return m.reply("❌ This command can only be used by the bot owner!");
        }
        
        try {
            const blockedPath = path.join(__dirname, '..', 'data', 'blocked.json');
            
            if (!fs.existsSync(blockedPath)) {
                return m.reply(`╭━━━━━━━━━━━━━━━━━┈⊷\n┃✮│➣ *BLOCKED USERS*\n╰━━━━━━━━━━━━━━━━━┈⊷\n\n📭 No users are currently blocked.`);
            }
            
            const blockedData = JSON.parse(fs.readFileSync(blockedPath, 'utf8'));
            const blockedUsers = Object.keys(blockedData);
            
            if (blockedUsers.length === 0) {
                return m.reply(`╭━━━━━━━━━━━━━━━━━┈⊷\n┃✮│➣ *BLOCKED USERS*\n╰━━━━━━━━━━━━━━━━━┈⊷\n\n📭 No users are currently blocked.`);
            }
            
            // Check WhatsApp block status
            const whatsappBlocked = [];
            try {
                // This might not work in all Baileys versions
                // const blocklist = await Miku.fetchBlocklist();
                // whatsappBlocked = blocklist || [];
            } catch (e) {
                console.log('Could not fetch WhatsApp blocklist:', e.message);
            }
            
            let listMessage = "╭━━━━━━━━━━━━━━━━━┈⊷\n";
            listMessage += "┃✮│➣ *BLOCKED USERS LIST*\n";
            listMessage += "╰━━━━━━━━━━━━━━━━━┈⊷\n\n";
            listMessage += `📋 Total Blocked: ${blockedUsers.length}\n\n`;
            
            blockedUsers.forEach((userJid, index) => {
                const userData = blockedData[userJid];
                const number = userJid.split('@')[0];
                const time = new Date(userData.timestamp).toLocaleString();
                const duration = formatDuration(Date.now() - userData.timestamp);
                const isWhatsAppBlocked = whatsappBlocked.includes(userJid);
                
                listMessage += `*${index + 1}.* @${number}\n`;
                listMessage += `   👤 *Name:* ${userData.name || 'Unknown'}\n`;
                listMessage += `   ⏰ *Blocked:* ${time}\n`;
                listMessage += `   ⏳ *Duration:* ${duration}\n`;
                listMessage += `   🛡️ *WhatsApp:* ${isWhatsAppBlocked ? '✅ Blocked' : '⚠️ Not blocked'}\n`;
                listMessage += `   👮 *By:* ${userData.blockedBy?.split('@')[0] || 'Unknown'}\n`;
                listMessage += `   📝 *Reason:* ${userData.reason || 'No reason'}\n\n`;
            });
            
            // Add footer
            listMessage += `\n📊 *Stats:*\n`;
            listMessage += `• Bot blocked: ${blockedUsers.length}\n`;
            listMessage += `• WhatsApp blocked: ${whatsappBlocked.length}\n`;
            listMessage += `• Use \`.unblock <number>\` to unblock\n`;
            listMessage += `• Use \`.block @user [reason]\` to block`;
            
            // Create mentions array
            const mentions = blockedUsers.map(jid => jid);
            
            // Send with mentions
            await Miku.sendMessage(m.from, {
                text: listMessage,
                mentions: mentions
            }, { quoted: m });
            
        } catch (error) {
            console.error('Blocklist error:', error);
            m.reply("❌ Failed to fetch block list: " + error.message);
        }
    }
};

// Helper function to format duration
function formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
}