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
        if (!isCreator) {
            return m.reply("❌ This command can only be used by the bot owner!");
        }
        
        let userJid;
        
        // Parse command
        if (m.quoted) {
            // Unblock quoted user
            userJid = m.quoted.sender;
        } else if (mentionByTag && mentionByTag.length > 0) {
            // Unblock mentioned user
            userJid = mentionByTag[0];
        } else if (text) {
            // Extract number from text
            const parts = text.split(' ');
            let number = parts[0];
            
            // Clean number
            number = number.replace(/\D/g, '');
            
            if (!number) {
                return m.reply(`╭━━━━━━━━━━━━━━━━━┈⊷\n┃✮│➣ *UNBLOCK USER*\n╰━━━━━━━━━━━━━━━━━┈⊷\n\nPlease provide a valid phone number!\n\nUsage:\n${prefix}unblock @user\n${prefix}unblock 1234567890\nReply to message: ${prefix}unblock\n\nExample:\n${prefix}unblock 1234567890\n${prefix}unblock @user`);
            }
            
            userJid = number + '@s.whatsapp.net';
        } else {
            return m.reply(`╭━━━━━━━━━━━━━━━━━┈⊷\n┃✮│➣ *UNBLOCK USER*\n╰━━━━━━━━━━━━━━━━━┈⊷\n\nPlease tag a user or provide a number!\n\nUsage:\n${prefix}unblock @user\n${prefix}unblock 1234567890\nReply to message: ${prefix}unblock`);
        }
        
        try {
            // Read current blocked list
            const blockedPath = path.join(__dirname, '..', 'data', 'blocked.json');
            let blockedData = {};
            
            if (fs.existsSync(blockedPath)) {
                blockedData = JSON.parse(fs.readFileSync(blockedPath, 'utf8'));
            }
            
            // Check if user is actually blocked
            if (!blockedData[userJid]) {
                // Also check without country code variations
                const userNumber = userJid.split('@')[0];
                const blockedJid = Object.keys(blockedData).find(jid => 
                    jid.includes(userNumber)
                );
                
                if (blockedJid) {
                    userJid = blockedJid;
                } else {
                    return m.reply(`❌ User ${userJid.split('@')[0]} is not in the block list!`);
                }
            }
            
            // Get user info before removing
            const userInfo = blockedData[userJid];
            
            // Remove user from blocked list
            delete blockedData[userJid];
            
            // Save to file
            fs.writeFileSync(blockedPath, JSON.stringify(blockedData, null, 2));
            
            // Unblock on WhatsApp
            try {
                await Miku.updateBlockStatus(userJid, 'unblock');
            } catch (blockError) {
                console.log('WhatsApp unblock failed (user might not be WhatsApp blocked):', blockError.message);
            }
            
            // Send confirmation
            m.reply(`╭━━━━━━━━━━━━━━━━━┈⊷\n┃✮│➣ *USER UNBLOCKED*\n╰━━━━━━━━━━━━━━━━━┈⊷\n\n✅ Successfully unblocked ${userJid.split('@')[0]}\n\n📝 Was blocked for: ${userInfo.reason || 'No reason'}\n⏰ Block duration: ${formatDuration(Date.now() - userInfo.timestamp)}\n\nUser can now:\n• Message the bot again\n• Use bot commands\n• Join bot groups`);
            
            // Notify unblocked user
            try {
                await Miku.sendMessage(userJid, {
                    text: `✅ *YOU HAVE BEEN UNBLOCKED*\n\nYou have been unblocked from ALASTOR-XD bot.\n\nYou can now use the bot again.`
                });
            } catch (e) {
                // Ignore if can't message user
            }
            
        } catch (error) {
            console.error('Unblock error:', error);
            m.reply("❌ Failed to unblock user: " + error.message);
        }
    }
};

// Helper function to format duration
function formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''}`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    return `${seconds} second${seconds > 1 ? 's' : ''}`;
}