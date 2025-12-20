const fs = require('fs');

module.exports = {
    name: "listinactive",
    alias: ["inactive", "inactivelist"],
    desc: "List inactive members in group",
    category: "Group",
    usage: "listinactive [days]",
    react: "💤",
    start: async (Miku, m, { text, prefix }) => {
        if (!m.isGroup) return m.reply("❌ This command only works in groups!");
        
        const days = parseInt(text) || 7;
        
        if (days < 1 || days > 365) {
            return m.reply(`╭━━━━━━━━━━━━━━━━━┈⊷\n┃✮│➣ *INACTIVE MEMBERS*\n╰━━━━━━━━━━━━━━━━━┈⊷\n\nPlease specify days between 1-365\nExample: ${prefix}listinactive 30`);
        }
        
        try {
            const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000);
            
            // Load message count data
            const msgCountPath = './data/messageCount.json';
            const messageData = fs.existsSync(msgCountPath) ? 
                JSON.parse(fs.readFileSync(msgCountPath, 'utf8')) : {};
            
            const groupMetadata = await Miku.groupMetadata(m.from);
            const participants = groupMetadata.participants;
            
            const inactiveMembers = [];
            const activeMembers = [];
            
            for (const participant of participants) {
                const userJid = participant.id;
                const userData = messageData[userJid] || {};
                const lastActive = userData.lastActive || 0;
                
                if (lastActive < cutoffTime) {
                    inactiveMembers.push({
                        jid: userJid,
                        lastActive: lastActive,
                        admin: participant.admin
                    });
                } else {
                    activeMembers.push(userJid);
                }
            }
            
            if (inactiveMembers.length === 0) {
                return m.reply(`╭━━━━━━━━━━━━━━━━━┈⊷\n┃✮│➣ *ALL ACTIVE*\n╰━━━━━━━━━━━━━━━━━┈⊷\n\n✅ All members have been active in the last ${days} days!`);
            }
            
            // Sort by last active (oldest first)
            inactiveMembers.sort((a, b) => a.lastActive - b.lastActive);
            
            let report = `╭━━━━━━━━━━━━━━━━━┈⊷\n┃✮│➣ *INACTIVE MEMBERS (${days}+ days)*\n╰━━━━━━━━━━━━━━━━━┈⊷\n\n`;
            
            report += `📊 *Stats:*\n`;
            report += `• Total members: ${participants.length}\n`;
            report += `• Active members: ${activeMembers.length}\n`;
            report += `• Inactive members: ${inactiveMembers.length}\n\n`;
            report += `👥 *Inactive Members:*\n`;
            
            inactiveMembers.forEach((member, index) => {
                const number = member.jid.split('@')[0];
                const inactiveDays = Math.floor((Date.now() - member.lastActive) / (24 * 60 * 60 * 1000));
                
                report += `${index + 1}. @${number}${member.admin ? ' 👑' : ''}\n`;
                report += `   💤 Inactive: ${inactiveDays} days\n\n`;
            });
            
            const mentionedJids = inactiveMembers.map(m => m.jid);
            
            Miku.sendMessage(m.from, {
                text: report,
                mentions: mentionedJids
            }, { quoted: m });
            
        } catch (error) {
            console.error(error);
            m.reply("❌ Failed to get inactive members list!");
        }
    }
};