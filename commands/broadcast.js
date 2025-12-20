const fs = require('fs');
const path = require('path');

async function broadcastCommand(sock, chatId, message) {
    try {
        const senderId = message.key.participant || message.key.remoteJid;
        
        // Owner number: 2347030626048@s.whatsapp.net
        const ownerNumber = '2347030626048@s.whatsapp.net';
        
        // Check if sender is the owner
        if (!senderId.includes(ownerNumber) && !message.key.fromMe) {
            return await sock.sendMessage(chatId, {
                text: "╭━━━━━━━━━━━━━━━━━━┈⊷\n┃✮│➣ *🚫 ACCESS DENIED*\n╰━━━━━━━━━━━━━━━━━━┈⊷\n\nThis command is only available for the bot owner.",
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

        // Get the broadcast message
        const rawText = message.message?.conversation?.trim() ||
                       message.message?.extendedTextMessage?.text?.trim() ||
                       message.message?.imageMessage?.caption?.trim() ||
                       message.message?.videoMessage?.caption?.trim() ||
                       '';
        
        // Remove .broadcast from the beginning
        const broadcastMessage = rawText.replace(/^\.broadcast\s*/i, '').trim();
        
        if (!broadcastMessage) {
            return await sock.sendMessage(chatId, {
                text: "╭━━━━━━━━━━━━━━━━━━┈⊷\n┃✮│➣ *📢 BROADCAST COMMAND*\n╰━━━━━━━━━━━━━━━━━━┈⊷\n\n*Usage:* `.broadcast <message>`\n\n*Example:* `.broadcast Hello everyone! This is a test message from the bot owner.`\n\n*Note:* This will send message to ALL chats where the bot has been used.",
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

        // Send processing message
        await sock.sendMessage(chatId, {
            text: "╭━━━━━━━━━━━━━━━━━━┈⊷\n┃✮│➣ *📡 BROADCAST STARTED*\n╰━━━━━━━━━━━━━━━━━━┈⊷\n\nCollecting all chat IDs from message history...",
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

        // Get ALL chat IDs from messageCount.json
        let chatIds = [];
        
        try {
            const messageCountPath = path.join(__dirname, '../data/messageCount.json');
            
            if (!fs.existsSync(messageCountPath)) {
                throw new Error('messageCount.json not found');
            }
            
            const messageCountData = JSON.parse(fs.readFileSync(messageCountPath, 'utf8'));
            
            // Get ALL chat IDs from the messageCount.json
            // This includes both groups and private chats
            for (const key in messageCountData) {
                // Skip non-chat entries
                if (key === 'isPublic' || key === 'totalMessages' || typeof messageCountData[key] !== 'object') {
                    continue;
                }
                
                // Add the chat ID
                chatIds.push(key);
            }
            
            console.log(`Found ${chatIds.length} chat IDs in messageCount.json`);
            
        } catch (error) {
            console.error('Error reading messageCount.json:', error);
            
            // Try alternative: look for any JSON files in data directory
            try {
                const dataDir = path.join(__dirname, '../data');
                const files = fs.readdirSync(dataDir);
                
                for (const file of files) {
                    if (file.endsWith('.json') && file !== 'darkempiretech.json') {
                        const filePath = path.join(dataDir, file);
                        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                        
                        // Extract chat IDs from any object structure
                        for (const key in data) {
                            if (key.includes('@') && (key.includes('@g.us') || key.includes('@s.whatsapp.net'))) {
                                chatIds.push(key);
                            }
                        }
                    }
                }
                
                console.log(`Found ${chatIds.length} chat IDs from data files`);
                
            } catch (e) {
                console.error('Alternative method failed:', e);
            }
        }
        
        // Remove duplicates and filter out invalid/current chat
        chatIds = [...new Set(chatIds)].filter(id => 
            id && 
            typeof id === 'string' && 
            !id.includes('status') && 
            !id.includes('broadcast') &&
            !id.includes('newsletter') &&
            id !== chatId && // Don't send to current chat
            !id.includes('@temp') && // Filter temp chats
            (id.endsWith('@g.us') || id.endsWith('@s.whatsapp.net')) // Valid WhatsApp IDs
        );
        
        console.log(`Broadcasting to ${chatIds.length} unique chats`);
        
        if (chatIds.length === 0) {
            return await sock.sendMessage(chatId, {
                text: "╭━━━━━━━━━━━━━━━━━━┈⊷\n┃✮│➣ *❌ NO CHATS FOUND*\n╰━━━━━━━━━━━━━━━━━━┈⊷\n\nNo chat history found to broadcast to.\n\nMake sure the bot has been used in some chats first.",
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
        
        let successCount = 0;
        let failedCount = 0;
        let failedChats = [];
        
        // Create broadcast message with header
        const fullMessage = `╭━━━━━━━━━━━━━━━━━━┈⊷\n┃✮│➣ *📢 BROADCAST MESSAGE*\n╰━━━━━━━━━━━━━━━━━━┈⊷\n\n${broadcastMessage}\n\n_✨ Message from ALASTOR-XMD Bot Owner_`;
        
        // Send progress update
        await sock.sendMessage(chatId, {
            text: `╭━━━━━━━━━━━━━━━━━━┈⊷\n┃✮│➣ *📤 SENDING BROADCAST*\n╰━━━━━━━━━━━━━━━━━━┈⊷\n\nStarting broadcast to ${chatIds.length} chats...\n\n*Message:*\n${broadcastMessage}`,
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
        
        // Send to each chat
        for (let i = 0; i < chatIds.length; i++) {
            const chatIdToSend = chatIds[i];
            
            try {
                await sock.sendMessage(chatIdToSend, {
                    text: fullMessage,
                    contextInfo: {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363404912601381@newsletter',
                            newsletterName: 'ALASTOR-XMD',
                            serverMessageId: -1
                        }
                    }
                });
                
                successCount++;
                
                // Send progress update every 10 messages
                if (successCount % 10 === 0) {
                    const progress = Math.round((i + 1) / chatIds.length * 100);
                    await sock.sendMessage(chatId, {
                        text: `📤 *Progress:* ${progress}%\n✅ Sent: ${successCount}\n❌ Failed: ${failedCount}\n📊 Total: ${chatIds.length}`,
                        contextInfo: {
                            forwardingScore: 1,
                            isForwarded: true,
                            forwardedNewsletterMessageInfo: {
                                newsletterJid: '120363404912601381@newsletter',
                                newsletterName: 'ALASTOR-XMD',
                                serverMessageId: -1
                            }
                        }
                    });
                }
                
                // Delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 500));
                
            } catch (error) {
                console.error(`Failed to send to ${chatIdToSend}:`, error.message);
                failedCount++;
                failedChats.push(chatIdToSend);
                
                // Longer delay on error
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        // Create completion report
        let report = `╭━━━━━━━━━━━━━━━━━━┈⊷\n┃✮│➣ *✅ BROADCAST COMPLETED*\n╰━━━━━━━━━━━━━━━━━━┈⊷\n\n`;
        report += `*Results:*\n`;
        report += `✓ Successfully sent: ${successCount}\n`;
        report += `✗ Failed to send: ${failedCount}\n`;
        report += `📊 Total recipients: ${chatIds.length}\n\n`;
        report += `*Message:*\n${broadcastMessage}\n\n`;
        
        if (failedCount > 0) {
            report += `*Failed chats (first 5):*\n`;
            report += failedChats.slice(0, 5).join('\n');
            if (failedChats.length > 5) {
                report += `\n...and ${failedChats.length - 5} more`;
            }
        }
        
        // Send completion report
        await sock.sendMessage(chatId, {
            text: report,
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
        console.error('Broadcast Error:', error);
        await sock.sendMessage(chatId, {
            text: `╭━━━━━━━━━━━━━━━━━━┈⊷\n┃✮│➣ *❌ BROADCAST FAILED*\n╰━━━━━━━━━━━━━━━━━━┈⊷\n\nError: ${error.message}`,
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

module.exports = broadcastCommand;