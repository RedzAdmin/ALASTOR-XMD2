const fs = require('fs');

module.exports = {
    name: "listactive",
    alias: ["active", "activelist"],
    desc: "List most active members in group",
    category: "Group",
    usage: "listactive [limit]",
    react: "🏆",
    start: async (Miku, m, { text, prefix }) => {
        if (!m.isGroup) return m.reply("❌ This command only works in groups!");
        
        const limit = parseInt(text) || 10;
        
        if (limit < 1 || limit > 50) {
            return m.reply(`╭━━━━━━━━━━━━━━━━━┈⊷\n┃✮│➣ *ACTIVE MEMBERS*\n╰━━━━━━━━━━━━━━━━━┈⊷\n\nPlease specify limit between 1-50\nExample: ${prefix}listactive 20`);
        }
        
        try {
            // Load message count data
            const msgCountPath = './data/messageCount.json';
            if (!fs.existsSync(msgCountPath)) {
                return m.reply(`╭━━━━━━━━━━━━━━━━━┈⊷\n┃✮│➣ *NO DATA*\n╰━━━━━━━━━━━━━━━━━┈⊷\n\nNo activity data available yet.`);
            }
            
            const messageData = JSON.parse(fs.readFileSync(msgCountPath, 'utf8'));
            const groupMetadata = await Miku.groupMetadata(m.from);
            const participants = groupMetadata.participants;
            
            // Filter and sort active members
            const activeMembers = [];
            
            for (const participant of participants) {
                const userJid = participant.id;
                const userData = messageData[userJid] || {};
                const messageCount = userData.count || 0;
                const lastActive = userData.lastActive || 0;
                
                if (messageCount > 0) {
                    activeMembers.push({
                        jid: userJid,
                        count: messageCount,
                        lastActive: lastActive,
                        admin: participant.admin
                    });
                }
            }
            
            // Sort by message count (descending)
            activeMembers.sort((a, b) => b.count - a.count);
            
            if (activeMembers.length === 0) {
                return m.reply(`╭━━━━━━━━━━━━━━━━━┈⊷\n┃✮│➣ *NO ACTIVITY*\n╰━━━━━━━━━━━━━━━━━┈⊷\n\nNo activity recorded for this group yet.`);
            }
            
            let report = `╭━━━━━━━━━━━━━━━━━┈⊷\n┃✮│➣ *TOP ${limit} ACTIVE MEMBERS*\n╰━━━━━━━━━━━━━━━━━┈⊷\n\n`;
            
            activeMembers.slice(0, limit).forEach((member, index) => {
                const number = member.jid.split('@')[0];
                const lastSeen = member.lastActive ? 
                    `${Math.floor((Date.now() - member.lastActive) / (24 * 60 * 60 * 1000))} days ago` : 
                    'Never';
                
                report += `*${index + 1}.* @${number}${member.admin ? ' 👑' : ''}\n`;
                report += `   📊 Messages: ${member.count}\n`;
                report += `   ⏰ Last active: ${lastSeen}\n\n`;
            });
            
            report += `📈 *Group Stats:*\n`;
            report += `• Total members: ${participants.length}\n`;
            report += `• Active members: ${activeMembers.length}\n`;
            report += `• Total messages: ${activeMembers.reduce((sum, m) => sum + m.count, 0)}\n`;
            
            const mentionedJids = activeMembers.slice(0, limit).map(m => m.jid);
            
            Miku.sendMessage(m.from, {
                text: report,
                mentions: mentionedJids
            }, { quoted: m });
            
        } catch (error) {
            console.error(error);
            m.reply("❌ Failed to get active members list!");
        }
    }
};