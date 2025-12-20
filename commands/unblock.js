const fs = require('fs');
const path = require('path');

module.exports = {
    name: "unblock",
    alias: ["unblockuser"],
    desc: "Unblock a user from using the bot",
    category: "Moderation",
    usage: "unblock @user or .unblock 1234567890",
    react: "✅",
    start: async (Miku, m, { text, prefix, isCreator, mentionByTag }) => {
        if (!isCreator) return m.reply("❌ This command can only be used by the bot owner!");
        
        if (!text && !m.quoted) {
            return m.reply(`╭━━━━━━━━━━━━━━━━━┈⊷\n┃✮│➣ *UNBLOCK USER*\n╰━━━━━━━━━━━━━━━━━┈⊷\n\nPlease tag a user or provide a number!\nExample: ${prefix}unblock @user`);
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
            const blockedPath = './data/blocked.json';
            let blockedData = {};
            
            if (fs.existsSync(blockedPath)) {
                blockedData = JSON.parse(fs.readFileSync(blockedPath, 'utf8'));
            }
            
            // Remove user from blocked list
            delete blockedData[userJid];
            
            // Save to file
            fs.writeFileSync(blockedPath, JSON.stringify(blockedData, null, 2));
            
            // Actually unblock the user on WhatsApp
            await Miku.updateBlockStatus(userJid, 'unblock');
            
            m.reply(`╭━━━━━━━━━━━━━━━━━┈⊷\n┃✮│➣ *USER UNBLOCKED*\n╰━━━━━━━━━━━━━━━━━┈⊷\n\n✅ Successfully unblocked ${userJid.split('@')[0]}`);
            
        } catch (error) {
            console.error(error);
            m.reply("❌ Failed to unblock user!");
        }
    }
};