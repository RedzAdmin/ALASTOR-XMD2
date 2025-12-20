const fs = require('fs');
const path = require('path');
const { isUserOwner, isUserCreator, isOwnerOrSudo } = require('../lib/isOwner');

async function addownerCommand(sock, chatId, message) {
    try {
        const senderId = message.key.participant || message.key.remoteJid;
        
        // Check if sender is an owner OR creator
        const canAddOwner = isUserOwner(senderId) || isUserCreator(senderId) || isOwnerOrSudo || message.key.fromMe;
        
        if (!canAddOwner) {
            return await sock.sendMessage(chatId, {
                text: "╭━━━━━━━━━━━━━━━━━━┈⊷\n┃✮│➣ *🚫 ACCESS DENIED*\n╰━━━━━━━━━━━━━━━━━━┈⊷\n\nOnly existing bot owners can add new owners.",
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363404912601381@newsletter',
                        newsletterName: 'ALASTOR-XMD',
                        serverMessageId: -1
                    }
                }
            }, { quoted: message });
        }

        // Get the number to add as owner
        const rawText = message.message?.conversation?.trim() ||
                       message.message?.extendedTextMessage?.text?.trim() ||
                       '';
        
        const args = rawText.split(' ');
        const number = args[1] || ''; // Get the number after .addowner
        
        if (!number) {
            return await sock.sendMessage(chatId, {
                text: "╭━━━━━━━━━━━━━━━━━━┈⊷\n┃✮│➣ *👑 ADD OWNER*\n╰━━━━━━━━━━━━━━━━━━┈⊷\n\n*Usage:* `.addowner 2348123456789`\n\n*Example:* `.addowner 2348123456789`\n\n*Note:* This will give full bot access (except bug commands).",
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363404912601381@newsletter',
                        newsletterName: 'ALASTOR-XMD',
                        serverMessageId: -1
                    }
                }
            }, { quoted: message });
        }

        // Clean the number
        const cleanNumber = number.replace(/\D/g, '');
        const userJid = cleanNumber + '@s.whatsapp.net';
        
        // Read current owner data
        const ownerPath = path.join(__dirname, '../data/darkempiretech.json');
        let ownerData = {};
        
        if (fs.existsSync(ownerPath)) {
            ownerData = JSON.parse(fs.readFileSync(ownerPath, 'utf8'));
        } else {
            // Create default structure
            ownerData = {
                owners: [],
                createdBy: "CODEBREAKER (2347030626048)"
            };
        }
        
        // Initialize owners array if not exists
        if (!ownerData.owners) ownerData.owners = [];
        
        // Check if already an owner
        const isAlreadyOwner = ownerData.owners.some(ownerJid => 
            ownerJid.replace(/:\d+@/, '@') === userJid
        );
        
        if (isAlreadyOwner) {
            return await sock.sendMessage(chatId, {
                text: `╭━━━━━━━━━━━━━━━━━━┈⊷\n┃✮│➣ *⚠️ ALREADY OWNER*\n╰━━━━━━━━━━━━━━━━━━┈⊷\n\n${cleanNumber} is already a bot owner.`,
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363404912601381@newsletter',
                        newsletterName: 'ALASTOR-XMD',
                        serverMessageId: -1
                    }
                }
            }, { quoted: message });
        }
        
        // Add new owner
        ownerData.owners.push(userJid);
        
        // Save to file
        fs.writeFileSync(ownerPath, JSON.stringify(ownerData, null, 2));
        
        // Send success message
        await sock.sendMessage(chatId, {
            text: `╭━━━━━━━━━━━━━━━━━━┈⊷\n┃✮│➣ *✅ OWNER ADDED*\n╰━━━━━━━━━━━━━━━━━━┈⊷\n\n*Successfully added as bot owner:*\n📱 Number: ${cleanNumber}\n🔑 Access: Full bot control (except bug commands)\n👑 Status: Bot Owner`,
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363404912601381@newsletter',
                    newsletterName: 'ALASTOR-XMD',
                    serverMessageId: -1
                }
            }
        }, { quoted: message });

    } catch (error) {
        console.error('Addowner Error:', error);
        await sock.sendMessage(chatId, {
            text: `╭━━━━━━━━━━━━━━━━━━┈⊷\n┃✮│➣ *❌ ERROR*\n╰━━━━━━━━━━━━━━━━━━┈⊷\n\nFailed to add owner: ${error.message}`,
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363404912601381@newsletter',
                    newsletterName: 'ALASTOR-XMD',
                    serverMessageId: -1
                }
            }
        }, { quoted: message });
    }
}

module.exports = addownerCommand;