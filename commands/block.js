const fs = require('fs');
const path = require('path');

module.exports = {
    name: "block",
    alias: ["blockuser"],
    desc: "Block a user from using the bot",
    category: "Moderation",
    usage: "block @user or .block 1234567890 [reason]",
    react: "🚫",
    start: async (Miku, m, { text, prefix, isCreator, mentionByTag }) => {
        if (!isCreator) {
            return m.reply("❌ This command can only be used by the bot owner!");
        }
        
        let userJid, reason;
        
        // Parse command
        if (m.quoted) {
            // Block quoted user
            userJid = m.quoted.sender;
            reason = text || "No reason provided";
        } else if (mentionByTag && mentionByTag.length > 0) {
            // Block mentioned user(s)
            userJid = mentionByTag[0];
            reason = text ? text.replace(/@\d+/g, '').trim() : "No reason provided";
        } else if (text) {
            // Extract number and reason from text
            const parts = text.split(' ');
            const number = parts[0].replace(/\D/g, '');
            
            if (!number) {
                return m.reply(`╭━━━━━━━━━━━━━━━━━┈⊷\n┃✮│➣ *BLOCK USER*\n╰━━━━━━━━━━━━━━━━━┈⊷\n\nPlease provide a valid phone number!\n\nUsage:\n${prefix}block @user [reason]\n${prefix}block 1234567890 [reason]\nReply to message: ${prefix}block [reason]\n\nExample:\n${prefix}block 1234567890 Spamming\n${prefix}block @user Violating rules`);
            }
            
            userJid = number + '@s.whatsapp.net';
            reason = parts.slice(1).join(' ') || "No reason provided";
        } else {
            return m.reply(`╭━━━━━━━━━━━━━━━━━┈⊷\n┃✮│➣ *BLOCK USER*\n╰━━━━━━━━━━━━━━━━━┈⊷\n\nPlease tag a user or provide a number!\n\nUsage:\n${prefix}block @user [reason]\n${prefix}block 1234567890 [reason]\nReply to message: ${prefix}block [reason]`);
        }
        
        try {
            // Prevent blocking yourself
            if (userJid === m.sender) {
                return m.reply("❌ You cannot block yourself!");
            }
            
            // Prevent blocking bot owner
            if (userJid.includes('2347030626048')) {
                return m.reply("❌ You cannot block the bot creator!");
            }
            
            // Read current blocked list
            const blockedPath = path.join(__dirname, '..', 'data', 'blocked.json');
            let blockedData = {};
            
            if (fs.existsSync(blockedPath)) {
                blockedData = JSON.parse(fs.readFileSync(blockedPath, 'utf8'));
            }
            
            // Check if already blocked
            if (blockedData[userJid]) {
                return m.reply(`❌ User ${userJid.split('@')[0]} is already blocked!`);
            }
            
            // Add user to blocked list
            blockedData[userJid] = {
                blockedBy: m.sender,
                timestamp: Date.now(),
                reason: reason,
                name: m.quoted?.pushName || "Unknown"
            };
            
            // Save to file
            fs.writeFileSync(blockedPath, JSON.stringify(blockedData, null, 2));
            
            // Block on WhatsApp
            await Miku.updateBlockStatus(userJid, 'block');
            
            // Send confirmation
            m.reply(`╭━━━━━━━━━━━━━━━━━┈⊷\n┃✮│➣ *USER BLOCKED*\n╰━━━━━━━━━━━━━━━━━┈⊷\n\n✅ Successfully blocked ${userJid.split('@')[0]}\n\n📝 Reason: ${reason}\n⏰ Time: ${new Date().toLocaleString()}\n\nUser can no longer:\n• Message the bot\n• Use bot commands\n• Join bot groups`);
            
            // Notify blocked user if in private chat
            if (!m.isGroup && userJid !== m.from) {
                try {
                    await Miku.sendMessage(userJid, {
                        text: `🚫 *YOU HAVE BEEN BLOCKED*\n\nYou have been blocked from using ALASTOR-XMD bot.\n\nReason: ${reason}\n\nIf you believe this was a mistake, contact the bot owner.`
                    });
                } catch (e) {
                    // Ignore if can't message user
                }
            }
            
        } catch (error) {
            console.error('Block error:', error);
            
            // Check specific error types
            if (error.message.includes('not authorized') || error.message.includes('block')) {
                m.reply("⚠️ User blocked on WhatsApp, but added to bot block list.");
            } else {
                m.reply("❌ Failed to block user: " + error.message);
            }
        }
    }
};