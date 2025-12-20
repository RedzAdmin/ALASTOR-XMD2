const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

module.exports = {
    name: "vcf",
    alias: ["vcard", "contact"],
    desc: "Create and send vCard contact file",
    category: "Utility",
    usage: "vcf <name> <number> or reply to contact",
    react: "📇",
    start: async (Miku, m, { text, prefix, quoted }) => {
        let contactName, contactNumber;
        
        if (quoted && quoted.contact) {
            // Extract from quoted contact message
            contactName = quoted.contact.displayName || "Unknown";
            contactNumber = quoted.contact.vcard.match(/TEL[^:]*:([^\n\r]*)/)?.[1]?.trim() || "";
        } else if (text) {
            // Parse from text: "vcf John Doe 1234567890"
            const parts = text.split(' ');
            if (parts.length >= 2) {
                contactNumber = parts.pop(); // Last part is number
                contactName = parts.join(' ');
            } else {
                return m.reply(`╭━━━━━━━━━━━━━━━━━┈⊷\n┃✮│➣ *VCARD CREATOR*\n╰━━━━━━━━━━━━━━━━━┈⊷\n\nUsage: ${prefix}vcf <name> <number>\nExample: ${prefix}vcf John Doe 1234567890\n\nOr reply to a contact message.`);
            }
        } else {
            return m.reply(`╭━━━━━━━━━━━━━━━━━┈⊷\n┃✮│➣ *VCARD CREATOR*\n╰━━━━━━━━━━━━━━━━━┈⊷\n\nUsage: ${prefix}vcf <name> <number>\nExample: ${prefix}vcf John Doe 1234567890\n\nOr reply to a contact message.`);
        }
        
        // Clean number
        contactNumber = contactNumber.replace(/[^0-9+]/g, '');
        
        if (!contactNumber) {
            return m.reply("❌ Invalid phone number!");
        }
        
        try {
            // Create vCard content
            const vcardContent = `BEGIN:VCARD
VERSION:3.0
FN:${contactName}
N:${contactName};;;
TEL;TYPE=CELL:${contactNumber}
UID:${uuidv4()}
END:VCARD`;
            
            // Save to temporary file
            const tempPath = path.join(__dirname, '..', 'temp', `${contactName}_${Date.now()}.vcf`);
            fs.writeFileSync(tempPath, vcardContent);
            
            // Send vCard file
            await Miku.sendMessage(m.from, {
                document: fs.readFileSync(tempPath),
                fileName: `${contactName}.vcf`,
                mimetype: 'text/vcard',
                caption: `╭━━━━━━━━━━━━━━━━━┈⊷\n┃✮│➣ *CONTACT CARD*\n╰━━━━━━━━━━━━━━━━━┈⊷\n\n📇 *Name:* ${contactName}\n📞 *Number:* ${contactNumber}\n\n✅ Contact card created successfully!`
            }, { quoted: m });
            
            // Clean up temp file
            fs.unlinkSync(tempPath);
            
        } catch (error) {
            console.error(error);
            m.reply("❌ Failed to create contact card!");
        }
    }
};