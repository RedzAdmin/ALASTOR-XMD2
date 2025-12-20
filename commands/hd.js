const fs = require('fs');
const path = require('path');
const { enhanceImage } = require('../plugins/hd-enhance');

module.exports = {
    name: "hd",
    alias: ["enhance", "highquality", "upscale"],
    desc: "Enhance image quality to HD using AI",
    category: "Media",
    usage: "hd <reply to image>",
    react: "✨",
    start: async (Miku, m, { text, prefix, quoted, mime }) => {
        if (!m.quoted && !/image/.test(mime)) {
            return Miku.sendMessage(m.from, { 
                text: `╭━━━━━━━━━━━━━━━━━┈⊷\n┃✮│➣ *HD ENHANCE*\n╰━━━━━━━━━━━━━━━━━┈⊷\n\nPlease reply to an image to enhance it!` 
            }, { quoted: m });
        }

        try {
            m.reply(`╭━━━━━━━━━━━━━━━━━┈⊷\n┃✮│➣ Enhancing image...\n╰━━━━━━━━━━━━━━━━━┈⊷`);

            let media;
            if (m.quoted) {
                media = await Miku.downloadAndSaveMediaMessage(m.quoted);
            } else if (/image/.test(mime)) {
                media = await Miku.downloadAndSaveMediaMessage(m);
            }

            if (!media) {
                return m.reply("❌ Could not download image.");
            }

            const imageBuffer = fs.readFileSync(media);
            const enhancedBuffer = await enhanceImage(imageBuffer);
            
            // Clean up temp file
            fs.unlinkSync(media);
            
            Miku.sendMessage(m.from, {
                image: enhancedBuffer,
                caption: `╭━━━━━━━━━━━━━━━━━┈⊷\n┃✮│➣ *HD ENHANCED*\n╰━━━━━━━━━━━━━━━━━┈⊷\n\n✅ Image enhanced successfully!`
            }, { quoted: m });

        } catch (error) {
            console.error(error);
            m.reply(`╭━━━━━━━━━━━━━━━━━┈⊷\n┃✮│➣ *ERROR*\n╰━━━━━━━━━━━━━━━━━┈⊷\n\n❌ Failed to enhance image: ${error.message}`);
        }
    }
};