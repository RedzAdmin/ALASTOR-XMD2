const fs = require('fs');

module.exports = {
    name: "blocklist",
    alias: ["listblocked", "blockedlist"],
    desc: "Show list of blocked users",
    category: "Moderation",
    usage: "blocklist",
    react: "📋",
    start: async (Miku, m, { text, prefix, isCreator }) => {
        if (!isCreator) return m.reply("❌ This command can only be used by the bot owner!");
        
        try {
            const blockedPath = './data/blocked.json';
            
            if (!fs.existsSync(blockedPath)) {
                return m.reply(`╭━━━━━━━━━━━━━━━━━┈⊷\n┃✮│➣ *BLOCKED LIST*\n╰━━━━━━━━━━━━━━━━━┈⊷\n\n📭 No users are currently blocked.`);
            }
            
            const blockedData = JSON.parse(fs.readFileSync(blockedPath, 'utf8'));
            const blockedUsers = Object.keys(blockedData);
            
            if (blockedUsers.length === 0) {
                return m.reply(`╭━━━━━━━━━━━━━━━━━┈⊷\n┃✮│➣ *BLOCKED LIST*\n╰━━━━━━━━━━━━━━━━━┈⊷\n\n📭 No users are currently blocked.`);
            }
            
            let listMessage = "╭━━━━━━━━━━━━━━━━━┈⊷\n";
            listMessage += "┃✮│➣ *BLOCKED USERS LIST*\n";
            listMessage += "╰━━━━━━━━━━━━━━━━━┈⊷\n\n";
            listMessage += `📋 Total Blocked: ${blockedUsers.length}\n\n`;
            
            blockedUsers.forEach((userJid, index) => {
                const userData = blockedData[userJid];
                const number = userJid.split('@')[0];
                const time = new Date(userData.timestamp).toLocaleString();
                
                listMessage += `*${index + 1}.* @${number}\n`;
                listMessage += `   ⏰ *Blocked:* ${time}\n`;
                listMessage += `   👤 *By:* ${userData.blockedBy?.split('@')[0] || 'Unknown'}\n`;
                listMessage += `   📝 *Reason:* ${userData.reason || 'No reason'}\n\n`;
            });
            
            // Send with mentions
            Miku.sendMessage(m.from, {
                text: listMessage,
                mentions: blockedUsers
            }, { quoted: m });
            
        } catch (error) {
            console.error(error);
            m.reply("❌ Failed to fetch block list!");
        }
    }
};