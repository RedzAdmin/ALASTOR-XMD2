const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

module.exports = {
    name: "vcf",
    alias: ["vcard", "contact", "exportcontacts"],
    desc: "Create and send vCard contact files",
    category: "Utility",
    usage: "vcf <name> <number> or reply to contact or use in group to export all contacts",
    react: "📇",
    start: async (Miku, m, { text, prefix, quoted, isGroup }) => {
        try {
            if (m.quoted) {
                // Handle quoted message (single contact)
                return await handleSingleContact(Miku, m, quoted);
            } else if (isGroup && !text) {
                // Handle group export (all members)
                return await handleGroupExport(Miku, m);
            } else if (text) {
                // Handle manual contact creation
                return await handleManualContact(Miku, m, text);
            } else {
                return m.reply(`╭━━━━━━━━━━━━━━━━━┈⊷\n┃✮│➣ *VCARD CREATOR*\n╰━━━━━━━━━━━━━━━━━┈⊷\n\nUsage:\n• ${prefix}vcf <name> <number> - Create contact\n• ${prefix}vcf (in group) - Export all group contacts\n• Reply to message with ${prefix}vcf - Create contact from quoted user\n\nExamples:\n${prefix}vcf John Doe 1234567890\n${prefix}vcf (in group)`);
            }
        } catch (error) {
            console.error(error);
            m.reply("❌ Failed to create contact card!");
        }
    }
};

// Handle single contact from quoted message
async function handleSingleContact(Miku, m, quoted) {
    let contactName, contactNumber;
    
    if (quoted.contact) {
        // Extract from quoted contact message
        contactName = quoted.contact.displayName || "Unknown";
        contactNumber = quoted.contact.vcard.match(/TEL[^:]*:([^\n\r]*)/)?.[1]?.trim() || "";
    } else {
        // Extract from quoted user
        contactName = quoted.pushName || "User";
        contactNumber = quoted.sender.split('@')[0];
    }
    
    return await createAndSendVCF(Miku, m, contactName, contactNumber);
}

// Handle group export
async function handleGroupExport(Miku, m) {
    await m.reply("📊 Collecting group members...");
    
    try {
        const groupMetadata = await Miku.groupMetadata(m.from);
        const participants = groupMetadata.participants;
        
        if (participants.length === 0) {
            return m.reply("❌ No members found in this group!");
        }
        
        let vcardContent = "";
        let contactsCount = 0;
        
        // Create vCard for each member
        for (const participant of participants) {
            const contactName = participant.notify || participant.id.split('@')[0] || "User";
            const contactNumber = participant.id.split('@')[0];
            
            if (contactNumber) {
                vcardContent += `BEGIN:VCARD
VERSION:3.0
FN:${contactName}
N:${contactName};;;
TEL;TYPE=CELL:${contactNumber}
UID:${uuidv4()}
END:VCARD\n\n`;
                contactsCount++;
            }
        }
        
        if (contactsCount === 0) {
            return m.reply("❌ Could not extract any phone numbers!");
        }
        
        // Save to temporary file
        const groupName = groupMetadata.subject.replace(/[^a-zA-Z0-9]/g, '_');
        const tempPath = path.join(__dirname, '..', 'temp', `${groupName}_contacts_${Date.now()}.vcf`);
        fs.writeFileSync(tempPath, vcardContent);
        
        // Send vCard file
        await Miku.sendMessage(m.from, {
            document: fs.readFileSync(tempPath),
            fileName: `${groupName}_contacts.vcf`,
            mimetype: 'text/vcard',
            caption: `╭━━━━━━━━━━━━━━━━━┈⊷\n┃✮│➣ *GROUP CONTACTS EXPORT*\n╰━━━━━━━━━━━━━━━━━┈⊷\n\n📇 *Group:* ${groupMetadata.subject}\n👥 *Members Exported:* ${contactsCount}\n📁 *File:* ${groupName}_contacts.vcf\n\n✅ Successfully exported ${contactsCount} contacts!`
        }, { quoted: m });
        
        // Clean up temp file after sending
        setTimeout(() => {
            if (fs.existsSync(tempPath)) {
                fs.unlinkSync(tempPath);
            }
        }, 5000);
        
    } catch (error) {
        console.error(error);
        m.reply("❌ Failed to export group contacts!");
    }
}

// Handle manual contact creation
async function handleManualContact(Miku, m, text) {
    const parts = text.split(' ');
    if (parts.length >= 2) {
        const contactNumber = parts.pop().replace(/[^0-9+]/g, '');
        const contactName = parts.join(' ');
        
        if (!contactNumber) {
            return m.reply("❌ Invalid phone number!");
        }
        
        return await createAndSendVCF(Miku, m, contactName, contactNumber);
    } else {
        return m.reply(`╭━━━━━━━━━━━━━━━━━┈⊷\n┃✮│➣ *VCARD CREATOR*\n╰━━━━━━━━━━━━━━━━━┈⊷\n\nUsage: ${prefix}vcf <name> <number>\nExample: ${prefix}vcf John Doe 1234567890`);
    }
}

// Create and send single vCard
async function createAndSendVCF(Miku, m, contactName, contactNumber) {
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
    setTimeout(() => {
        if (fs.existsSync(tempPath)) {
            fs.unlinkSync(tempPath);
        }
    }, 5000);
}