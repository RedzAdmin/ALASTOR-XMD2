const fs = require('fs');
const path = require('path');

// Store spam detection data
const spamData = new Map();
const MESSAGE_LIMIT = 15; // messages per minute
const TIME_WINDOW = 60000; // 1 minute in milliseconds
const WARNING_COOLDOWN = 30000; // 30 seconds

module.exports = {
    name: "antispam",
    alias: ["antiflood", "spamguard", "spam"],
    desc: "Protect against spam and exploit attacks",
    category: "Security",
    usage: "antispam on/off/status/reset",
    react: "🛡️",
    start: async (Miku, m, { text, prefix, isCreator, isAdmin, isGroup }) => {
        // Check permissions
        if (!isCreator && (!isGroup || !isAdmin)) {
            return m.reply("❌ This command requires bot owner or group admin privileges!");
        }

        const args = text.toLowerCase().split(' ');
        const action = args[0] || 'status';

        const configPath = path.join(__dirname, '..', 'data', 'antispam.json');
        let config = { 
            enabled: true, 
            groups: {},
            settings: {
                messageLimit: MESSAGE_LIMIT,
                timeWindow: TIME_WINDOW,
                warningCooldown: WARNING_COOLDOWN
            }
        };

        // Load config
        if (fs.existsSync(configPath)) {
            try {
                config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            } catch (e) {
                console.error('Error loading antispam config:', e);
            }
        }

        if (action === 'on') {
            config.enabled = true;
            if (m.isGroup) {
                config.groups[m.from] = true;
            }
            
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            
            return m.reply(`╭━━━━━━━━━━━━━━━━━┈⊷\n┃✮│➣ *ANTI-SPAM ENABLED*\n╰━━━━━━━━━━━━━━━━━┈⊷\n\n✅ Spam protection is now active!\n\n🛡️ *Features:*\n• Rate limiting (${config.settings.messageLimit} messages/min)\n• Exploit detection\n• Flood protection\n• Bug bot prevention\n\n⚙️ *Settings:*\n• Limit: ${config.settings.messageLimit} messages/minute\n• Group protection: ${m.isGroup ? 'Enabled' : 'Global'}`);
        }

        if (action === 'off') {
            config.enabled = false;
            if (m.isGroup) {
                delete config.groups[m.from];
            }
            
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            
            return m.reply(`╭━━━━━━━━━━━━━━━━━┈⊷\n┃✮│➣ *ANTI-SPAM DISABLED*\n╰━━━━━━━━━━━━━━━━━┈⊷\n\n⚠️ Spam protection is now disabled!\n\n🚨 You are now vulnerable to spam attacks.`);
        }

        if (action === 'reset') {
            // Clear spam data
            spamData.clear();
            
            return m.reply(`╭━━━━━━━━━━━━━━━━━┈⊷\n┃✮│➣ *ANTI-SPAM RESET*\n╰━━━━━━━━━━━━━━━━━┈⊷\n\n✅ Spam detection data has been reset!\n\nAll users are no longer flagged for spam.`);
        }

        if (action === 'status' || !action) {
            const isEnabled = config.enabled && (!m.isGroup || config.groups[m.from]);
            const status = isEnabled ? 'ENABLED 🟢' : 'DISABLED 🔴';
            
            // Count active spam warnings
            let activeWarnings = 0;
            let blockedUsers = 0;
            const now = Date.now();
            
            for (const [key, data] of spamData.entries()) {
                if (data.blocked) blockedUsers++;
                if (now - data.lastWarning < WARNING_COOLDOWN) activeWarnings++;
            }
            
            let statusMsg = `╭━━━━━━━━━━━━━━━━━┈⊷\n┃✮│➣ *ANTI-SPAM STATUS*\n╰━━━━━━━━━━━━━━━━━┈⊷\n\n`;
            statusMsg += `🛡️ *Status:* ${status}\n`;
            statusMsg += `📊 *Stats:*\n`;
            statusMsg += `• Active warnings: ${activeWarnings}\n`;
            statusMsg += `• Blocked users: ${blockedUsers}\n`;
            statusMsg += `• Total monitored: ${spamData.size}\n\n`;
            statusMsg += `⚙️ *Settings:*\n`;
            statusMsg += `• Message limit: ${config.settings.messageLimit}/min\n`;
            statusMsg += `• Time window: ${config.settings.timeWindow/1000}s\n`;
            statusMsg += `• Warning cooldown: ${config.settings.warningCooldown/1000}s\n\n`;
            statusMsg += `📋 *Commands:*\n`;
            statusMsg += `• ${prefix}antispam on - Enable\n`;
            statusMsg += `• ${prefix}antispam off - Disable\n`;
            statusMsg += `• ${prefix}antispam reset - Clear data\n`;
            statusMsg += `• ${prefix}antispam status - This view`;
            
            return m.reply(statusMsg);
        }

        return m.reply(`╭━━━━━━━━━━━━━━━━━┈⊷\n┃✮│➣ *ANTI-SPAM*\n╰━━━━━━━━━━━━━━━━━┈⊷\n\nUsage: ${prefix}antispam <option>\n\nOptions:\n• on - Enable spam protection\n• off - Disable spam protection\n• status - Check current status\n• reset - Clear spam detection data`);
    },

    // Middleware to check for spam
    checkSpam: async (Miku, m) => {
        try {
            const configPath = path.join(__dirname, '..', 'data', 'antispam.json');
            if (!fs.existsSync(configPath)) return false;
            
            const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            
            // Check if anti-spam is enabled for this chat
            if (m.isGroup && (!config.groups || !config.groups[m.from])) {
                return false;
            }
            
            if (!config.enabled) return false;
            
            const sender = m.sender || (m.key?.participant || m.key?.remoteJid);
            const now = Date.now();
            
            // Initialize sender data
            if (!spamData.has(sender)) {
                spamData.set(sender, {
                    messages: [],
                    lastWarning: 0,
                    blocked: false,
                    warningCount: 0
                });
            }
            
            const senderData = spamData.get(sender);
            
            // Clean old messages
            senderData.messages = senderData.messages.filter(
                time => now - time < config.settings.timeWindow
            );
            
            // Add current message
            senderData.messages.push(now);
            
            // Check if exceeds limit
            if (senderData.messages.length > config.settings.messageLimit) {
                senderData.blocked = true;
                senderData.warningCount++;
                
                // Warn user (with cooldown)
                if (now - senderData.lastWarning > config.settings.warningCooldown) {
                    senderData.lastWarning = now;
                    
                    const warningMessage = `⚠️ *SPAM DETECTED!*\n\nYou are sending too many messages (${senderData.messages.length}/${config.settings.messageLimit} per minute).\n\nPlease slow down or you may be temporarily blocked.\n\nWarning #${senderData.warningCount}`;
                    
                    try {
                        await Miku.sendMessage(m.from, {
                            text: warningMessage
                        }, { quoted: m });
                    } catch (e) {
                        console.error('Failed to send spam warning:', e);
                    }
                }
                
                return true; // Block this message
            }
            
            // Reset blocked status if below limit
            if (senderData.messages.length <= config.settings.messageLimit / 2) {
                senderData.blocked = false;
            }
            
            // Check for exploit patterns
            const messageText = m.text || m.body || '';
            const exploitPatterns = [
                /eval\(/i,
                /exec\(/i,
                /require\(/i,
                /process\./i,
                /fs\./i,
                /child_process/i,
                /<script>/i,
                /javascript:/i,
                /data:text\/html/i,
                /onload=/i,
                /onerror=/i,
                /base64_decode/i,
                /shell_exec/i,
                /system\(/i
            ];
            
            for (const pattern of exploitPatterns) {
                if (pattern.test(messageText)) {
                    senderData.blocked = true;
                    senderData.warningCount++;
                    
                    try {
                        await Miku.sendMessage(m.from, {
                            text: `🚨 *EXPLOIT DETECTED!*\n\nSuspicious code pattern detected. This message has been blocked for security.\n\nPattern: ${pattern.toString()}`
                        });
                    } catch (e) {
                        console.error('Failed to send exploit warning:', e);
                    }
                    
                    return true; // Block this message
                }
            }
            
            return false;
        } catch (error) {
            console.error('Anti-spam check error:', error);
            return false; // Don't block if error occurs
        }
    }
};