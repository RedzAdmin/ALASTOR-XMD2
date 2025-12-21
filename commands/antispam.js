const fs = require('fs');
const path = require('path');

// Store spam detection data
const spamData = {};
const MESSAGE_LIMIT = 10; // messages per minute
const TIME_WINDOW = 60000; // 1 minute in milliseconds

module.exports = {
    name: "antispam",
    alias: ["antiflood", "spamguard"],
    desc: "Protect against spam and exploit attacks",
    category: "Security",
    usage: "antispam on/off",
    react: "🛡️",
    start: async (Miku, m, { text, prefix, isCreator, isAdmin }) => {
        if (!isCreator && !isAdmin) {
            return m.reply("❌ This command requires admin or owner privileges!");
        }

        const args = text.toLowerCase().split(' ');
        const action = args[0];

        if (!action || (action !== 'on' && action !== 'off' && action !== 'status')) {
            return m.reply(`╭━━━━━━━━━━━━━━━━━┈⊷\n┃✮│➣ *ANTI-SPAM*\n╰━━━━━━━━━━━━━━━━━┈⊷\n\nUsage: ${prefix}antispam on/off/status\n\n• *on* - Enable spam protection\n• *off* - Disable spam protection\n• *status* - Check current status`);
        }

        const configPath = './data/antispam.json';
        let config = { enabled: false, groups: {} };

        if (fs.existsSync(configPath)) {
            config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        }

        if (action === 'on') {
            config.enabled = true;
            if (m.isGroup) {
                config.groups[m.from] = true;
            }
            
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            
            return m.reply(`╭━━━━━━━━━━━━━━━━━┈⊷\n┃✮│➣ *ANTI-SPAM ENABLED*\n╰━━━━━━━━━━━━━━━━━┈⊷\n\n✅ Spam protection is now active!\n\n🛡️ *Features:*\n• Rate limiting\n• Exploit detection\n• Flood protection\n• Bug bot prevention`);
        }

        if (action === 'off') {
            config.enabled = false;
            if (m.isGroup) {
                delete config.groups[m.from];
            }
            
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            
            return m.reply(`╭━━━━━━━━━━━━━━━━━┈⊷\n┃✮│➣ *ANTI-SPAM DISABLED*\n╰━━━━━━━━━━━━━━━━━┈⊷\n\n⚠️ Spam protection is now disabled!, Your now vulnerable 🙂🫴`);
        }

        if (action === 'status') {
            const status = config.enabled ? 'ENABLED 🟢' : 'DISABLED 🔴';
            const groupStatus = m.isGroup && config.groups[m.from] ? 'ENABLED 🟢' : 'DISABLED 🔴';
            
            let statusMsg = `╭━━━━━━━━━━━━━━━━━┈⊷\n┃✮│➣ *ANTI-SPAM STATUS*\n╰━━━━━━━━━━━━━━━━━┈⊷\n\n`;
            statusMsg += `🔒 *Global Status:* ${status}\n`;
            if (m.isGroup) {
                statusMsg += `👥 *Group Status:* ${groupStatus}\n`;
            }
            statusMsg += `\n📊 *Stats:*\n`;
            statusMsg += `• Blocked spam attempts: ${Object.keys(spamData).length}\n`;
            statusMsg += `• Active protections: ${config.enabled ? 'Rate limiting, Exploit detection' : 'None'}`;
            
            return m.reply(statusMsg);
        }
    },

    // Middleware to check for spam
    checkSpam: async (Miku, m) => {
        const configPath = './data/antispam.json';
        if (!fs.existsSync(configPath)) return false;
        
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        if (!config.enabled) return false;
        
        const sender = m.sender;
        const now = Date.now();
        
        // Initialize sender data
        if (!spamData[sender]) {
            spamData[sender] = {
                messages: [],
                lastWarning: 0,
                blocked: false
            };
        }
        
        // Clean old messages
        spamData[sender].messages = spamData[sender].messages.filter(
            time => now - time < TIME_WINDOW
        );
        
        // Add current message
        spamData[sender].messages.push(now);
        
        // Check if exceeds limit
        if (spamData[sender].messages.length > MESSAGE_LIMIT) {
            spamData[sender].blocked = true;
            
            // Warn user
            if (now - spamData[sender].lastWarning > 30000) { // 30 seconds cooldown
                spamData[sender].lastWarning = now;
                await Miku.sendMessage(m.from, {
                    text: `⚠️ *SPAM DETECTED!*\n\nYou are sending too many messages too quickly. Please slow down.`
                }, { quoted: m });
            }
            
            return true; // Block this message
        }
        
        // Check for exploit patterns
        const messageText = m.text || '';
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
            /onerror=/i
        ];
        
        for (const pattern of exploitPatterns) {
            if (pattern.test(messageText)) {
                await Miku.sendMessage(m.from, {
                    text: `🚨 *EXPLOIT DETECTED!*\n\nSuspicious code pattern detected. This message has been blocked.`
                });
                return true; // Block this message
            }
        }
        
        return false;
    }
};