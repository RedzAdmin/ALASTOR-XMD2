const fs = require('fs');
const path = require('path');

module.exports = {
    name: "addowner",
    alias: ["addadmin", "makeowner", "owneradd"],
    desc: "Add a new bot owner",
    category: "Owner",
    usage: "addowner <number>",
    react: "👑",
    start: async (Miku, m, { text, prefix, isCreator }) => {
        try {
            if (!isCreator) {
                return m.reply(`╭━━━━━━━━━━━━━━━━━━┈⊷\n┃✮│➣ *🚫 ACCESS DENIED*\n╰━━━━━━━━━━━━━━━━━━┈⊷\n\nOnly existing bot owners can add new owners.`);
            }

            if (!text) {
                return m.reply(`╭━━━━━━━━━━━━━━━━━━┈⊷\n┃✮│➣ *👑 ADD OWNER*\n╰━━━━━━━━━━━━━━━━━━┈⊷\n\n*Usage:* ${prefix}addowner <number>\n\n*Example:* ${prefix}addowner 2348123456789\n\n*Note:* This will give full bot access.`);
            }

            // Clean the number
            const cleanNumber = text.replace(/\D/g, '');
            
            if (cleanNumber.length < 10) {
                return m.reply(`╭━━━━━━━━━━━━━━━━━━┈⊷\n┃✮│➣ *❌ INVALID NUMBER*\n╰━━━━━━━━━━━━━━━━━━┈⊷\n\nPlease provide a valid phone number (10+ digits).\n\n*Example:* 2348123456789`);
            }
            
            const userJid = cleanNumber + '@s.whatsapp.net';
            
            // Read current owner data
            const ownerPath = path.join(__dirname, '..', 'data', 'darkempiretech.json');
            let ownerData = {};
            
            if (fs.existsSync(ownerPath)) {
                try {
                    const fileContent = fs.readFileSync(ownerPath, 'utf8');
                    ownerData = JSON.parse(fileContent);
                } catch (e) {
                    console.error('Error reading owner file:', e);
                    ownerData = {
                        owners: [],
                        createdBy: "CODEBREAKER"
                    };
                }
            } else {
                // Create default structure
                ownerData = {
                    owners: [],
                    createdBy: "CODEBREAKER"
                };
            }
            
            // Initialize owners array if not exists
            if (!ownerData.owners) ownerData.owners = [];
            
            // Check if already an owner
            const isAlreadyOwner = ownerData.owners.some(ownerJid => {
                const ownerNumber = ownerJid.replace(/:\d+@/, '@').split('@')[0];
                return ownerNumber === cleanNumber;
            });
            
            if (isAlreadyOwner) {
                return m.reply(`╭━━━━━━━━━━━━━━━━━━┈⊷\n┃✮│➣ *⚠️ ALREADY OWNER*\n╰━━━━━━━━━━━━━━━━━━┈⊷\n\n${cleanNumber} is already a bot owner.\n\n✅ User already has full access.`);
            }
            
            // Add new owner
            ownerData.owners.push(userJid);
            
            // Save to file
            try {
                fs.writeFileSync(ownerPath, JSON.stringify(ownerData, null, 2));
            } catch (writeError) {
                console.error('Error writing owner file:', writeError);
                return m.reply(`╭━━━━━━━━━━━━━━━━━━┈⊷\n┃✮│➣ *❌ SAVE ERROR*\n╰━━━━━━━━━━━━━━━━━━┈⊷\n\nFailed to save owner data.\n\nPlease check file permissions.`);
            }
            
            // Send success message
            m.reply(`╭━━━━━━━━━━━━━━━━━━┈⊷\n┃✮│➣ *✅ OWNER ADDED*\n╰━━━━━━━━━━━━━━━━━━┈⊷\n\n*Successfully added as bot owner:*\n📱 Number: ${cleanNumber}\n🔑 Access: Full bot control\n👑 Status: Bot Owner\n\n*Permissions granted:*\n• All commands access\n• Bot configuration\n• User management\n• Owner-only features`);
            
            // Try to notify the new owner
            try {
                await Miku.sendMessage(userJid, {
                    text: `👑 *BOT OWNER ACCESS GRANTED*\n\nYou have been added as an owner of ALASTOR-XD bot!\n\nYou now have full access to all bot features.\n\nUse .help to see available commands.`
                });
            } catch (notifyError) {
                console.log('Could not notify new owner:', notifyError.message);
            }
            
        } catch (error) {
            console.error('Addowner Error:', error);
            m.reply(`╭━━━━━━━━━━━━━━━━━━┈⊷\n┃✮│➣ *❌ ERROR*\n╰━━━━━━━━━━━━━━━━━━┈⊷\n\nFailed to add owner: ${error.message}\n\nPlease try again or contact support.`);
        }
    }
};