const fs = require('fs');
const path = require('path');

module.exports = {
    name: "block",
    alias: ["blockuser"],
    desc: "Block a user from using the bot",
    category: "Moderation",
    usage: "block @user or .block 1234567890",
    react: "🚫",
    start: async (Miku, m, { text, prefix, isCreator, mentionByTag }) => {
        if (!isCreator) return m.reply("❌ This command can only be used by the bot owner!");
        
        if (!text && !m.quoted) {
            return m.reply(`╭━━━━━━━━━━━━━━━━━┈⊷\n┃✮│➣ *BLOCK USER*\n╰━━━━━━━━━━━━━━━━━┈⊷\n\nPlease tag a user or provide a number!\nExample: ${prefix}block @user`);
        }
        
        let userJid;
        if (m.quoted) {
            userJid = m.quoted.sender;
        } else if (mentionByTag && mentionByTag.length > 0) {
            userJid = mentionByTag[0];
        } else if (text && text.includes('@')) {
            userJid = text.trim();
        } else if (text) {
            userJid = text.trim() + '@s.whatsapp.net';
        }
        
        if (!userJid) {
            return m.reply("❌ Could not identify user!");
        }
        
        try {
            // Read current blocked list
            let blockedData = {};
            const blockedPath = './data/blocked.json';
            
            if (fs.existsSync(blockedPath)) {
                blockedData = JSON.parse(fs.readFileSync(blockedPath, 'utf8'));
            }
            
            // Add user to blocked list
            blockedData[userJid] = {
                blockedBy: m.sender,
                timestamp: Date.now(),
                reason: text.split(' ').slice(1).join(' ') || "No reason provided"
            };
            
            // Save to file
            fs.writeFileSync(blockedPath, JSON.stringify(blockedData, null, 2));
            
            // Actually block the user on WhatsApp
            await Miku.updateBlockStatus(userJid, 'block');
            
            m.reply(`╭━━━━━━━━━━━━━━━━━┈⊷\n┃✮│➣ *USER BLOCKED*\n╰━━━━━━━━━━━━━━━━━┈⊷\n\n✅ Successfully blocked ${userJid.split('@')[0]}`);
            
        } catch (error) {
            console.error(error);
            m.reply("❌ Failed to block user!");
        }
    }
};