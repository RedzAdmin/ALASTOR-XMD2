const fs = require('fs');

module.exports = {
    name: "save",
    alias: ["savecontact", "addcontact"],
    desc: "Save an unsaved contact to your phone",
    category: "Utility",
    usage: "save @user or .save 1234567890",
    react: "💾",
    start: async (Miku, m, { text, prefix, mentionByTag, quoted }) => {
        let userJid, userName;
        
        if (quoted) {
            userJid = quoted.sender;
            userName = quoted.pushName || "User";
        } else if (mentionByTag && mentionByTag.length > 0) {
            userJid = mentionByTag[0];
            userName = text.split(' ').slice(1).join(' ') || "User";
        } else if (text) {
            const numberMatch = text.match(/\d+/g);
            if (numberMatch) {
                const number = numberMatch.join('');
                userJid = number + '@s.whatsapp.net';
                userName = text.replace(number, '').trim() || "User";
            }
        }
        
        if (!userJid) {
            return m.reply(`╭━━━━━━━━━━━━━━━━━┈⊷\n┃✮│➣ *SAVE CONTACT*\n╰━━━━━━━━━━━━━━━━━┈⊷\n\nUsage: ${prefix}save @user\nor: ${prefix}save 1234567890\nor: Reply to a message with ${prefix}save`);
        }
        
        try {
            const number = userJid.split('@')[0];
            
            // Create vCard
            const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${userName}
N:${userName};;;
TEL;TYPE=CELL:${number}
END:VCARD`;
            
            // Send contact
            await Miku.sendMessage(m.from, {
                contacts: {
                    displayName: userName,
                    contacts: [{
                        displayName: userName,
                        vcard: vcard
                    }]
                },
                caption: `╭━━━━━━━━━━━━━━━━━┈⊷\n┃✮│➣ *CONTACT SAVED*\n╰━━━━━━━━━━━━━━━━━┈⊷\n\n✅ Contact saved successfully!\n\n📇 *Name:* ${userName}\n📞 *Number:* ${number}\n\nClick on the contact card above to save to your phone.`
            }, { quoted: m });
            
        } catch (error) {
            console.error(error);
            m.reply("❌ Failed to save contact!");
        }
    }
};