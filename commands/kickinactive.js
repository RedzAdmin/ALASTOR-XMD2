const fs = require('fs');

module.exports = {
    name: "kickinactive",
    alias: ["kickdead", "removeinactive"],
    desc: "Kick inactive members from group",
    category: "Group",
    usage: "kickinactive <days>",
    react: "👢",
    start: async (Miku, m, { text, prefix, isAdmin }) => {
        if (!m.isGroup) return m.reply("❌ This command only works in groups!");
        if (!isAdmin) return m.reply("❌ Only admins can use this command!");
        
        const days = parseInt(text) || 30;
        
        if (days < 1 || days > 365) {
            return m.reply(`╭━━━━━━━━━━━━━━━━━┈⊷\n┃✮│➣ *KICK INACTIVE*\n╰━━━━━━━━━━━━━━━━━┈⊷\n\nPlease specify days between 1-365\nExample: ${prefix}kickinactive 30`);
        }
        
        try {
            m.reply(`╭━━━━━━━━━━━━━━━━━┈⊷\n┃✮│➣ Checking activity...\n╰━━━━━━━━━━━━━━━━━┈⊷`);
            
            const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000);
            const groupMetadata = await Miku.groupMetadata(m.from);
            const participants = groupMetadata.participants;
            
            // Load message count data
            const msgCountPath = './data/messageCount.json';
            let messageData = {};
            
            if (fs.existsSync(msgCountPath)) {
                messageData = JSON.parse(fs.readFileSync(msgCountPath, 'utf8'));
            }
            
            const inactiveMembers = [];
            const activeMembers = [];
            
            for (const participant of participants) {
                const userJid = participant.id;
                const userData = messageData[userJid] || {};
                const lastActive = userData.lastActive || 0;
                
                if (lastActive < cutoffTime && !participant.admin) {
                    inactiveMembers.push(userJid);
                } else {
                    activeMembers.push(userJid);
                }
            }
            
            if (inactiveMembers.length === 0) {
                return m.reply(`╭━━━━━━━━━━━━━━━━━┈⊷\n┃✮│➣ *NO INACTIVE MEMBERS*\n╰━━━━━━━━━━━━━━━━━┈⊷\n\n*All members have been active in the last ${days} days!*`);
            }
            
            let report = `╭━━━━━━━━━━━━━━━━━┈⊷\n┃✮│➣ *INACTIVE MEMBERS*\n╰━━━━━━━━━━━━━━━━━┈⊷\n\n`;
            report += `📊 *Stats:*\n`;
            report += `• Total members: ${participants.length}\n`;
            report += `• Active members: ${activeMembers.length}\n`;
            report += `• Inactive members: ${inactiveMembers.length}\n`;
            report += `• Days inactive: ${days}+ days\n\n`;
            report += `👥 *Inactive List:*\n`;
            
            // Show first 10 inactive members
            inactiveMembers.slice(0, 10).forEach((jid, index) => {
                const number = jid.split('@')[0];
                report += `${index + 1}. @${number}\n`;
            });
            
            if (inactiveMembers.length > 10) {
                report += `... and ${inactiveMembers.length - 10} more\n`;
            }
            
            report += `\nUse ${prefix}kick @user to remove specific members.`;
            
            Miku.sendMessage(m.from, {
                text: report,
                mentions: inactiveMembers.slice(0, 10)
            }, { quoted: m });
            
        } catch (error) {
            console.error(error);
            m.reply("❌ Failed to check inactive members!");
        }
    }
};