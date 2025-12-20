const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

module.exports = {
    name: "extractaudio",
    alias: ["audio", "mp3", "extract"],
    desc: "Extract audio from video/audio media",
    category: "Media",
    usage: "extractaudio <reply to video/audio>",
    react: "🎵",
    start: async (Miku, m, { text, prefix, quoted, mime }) => {
        const supportedMimes = ['video', 'audio'];
        const isSupported = supportedMimes.some(type => mime?.includes(type));
        
        if (!quoted && !isSupported) {
            return m.reply(`╭━━━━━━━━━━━━━━━━━┈⊷\n┃✮│➣ *EXTRACT AUDIO*\n╰━━━━━━━━━━━━━━━━━┈⊷\n\nPlease reply to a video or audio message!\n\nSupported formats:\n• MP4 videos\n• WebM videos\n• Audio messages\n• Voice notes`);
        }
        
        try {
            m.reply(`╭━━━━━━━━━━━━━━━━━┈⊷\n┃✮│➣ Extracting audio...\n╰━━━━━━━━━━━━━━━━━┈⊷`);
            
            let mediaPath;
            if (quoted) {
                mediaPath = await Miku.downloadAndSaveMediaMessage(quoted);
            } else {
                mediaPath = await Miku.downloadAndSaveMediaMessage(m);
            }
            
            if (!mediaPath || !fs.existsSync(mediaPath)) {
                return m.reply("❌ Failed to download media!");
            }
            
            // Create output path
            const outputPath = mediaPath.replace(path.extname(mediaPath), '.mp3');
            
            // Extract audio using ffmpeg
            try {
                await execPromise(`ffmpeg -i "${mediaPath}" -vn -ar 44100 -ac 2 -b:a 192k "${outputPath}" -y`);
            } catch (ffmpegError) {
                // Try alternative command
                await execPromise(`ffmpeg -i "${mediaPath}" -q:a 0 -map a "${outputPath}" -y`);
            }
            
            if (!fs.existsSync(outputPath)) {
                // Clean up
                if (fs.existsSync(mediaPath)) fs.unlinkSync(mediaPath);
                return m.reply("❌ Failed to extract audio. Make sure ffmpeg is installed!");
            }
            
            // Get file size
            const stats = fs.statSync(outputPath);
            const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
            
            // Check if file is too large (WhatsApp limit is 16MB)
            if (stats.size > 16 * 1024 * 1024) {
                // Compress if too large
                const compressedPath = outputPath.replace('.mp3', '_compressed.mp3');
                await execPromise(`ffmpeg -i "${outputPath}" -b:a 128k "${compressedPath}" -y`);
                
                if (fs.existsSync(compressedPath)) {
                    fs.unlinkSync(outputPath);
                    fs.renameSync(compressedPath, outputPath);
                }
            }
            
            // Send audio
            const audioBuffer = fs.readFileSync(outputPath);
            
            await Miku.sendMessage(m.from, {
                audio: audioBuffer,
                mimetype: 'audio/mpeg',
                ptt: false,
                caption: `╭━━━━━━━━━━━━━━━━━┈⊷\n┃✮│➣ *AUDIO EXTRACTED*\n╰━━━━━━━━━━━━━━━━━┈⊷\n\n✅ Audio extracted successfully!\n\n📊 File size: ${fileSizeMB} MB\n🎵 Format: MP3`
            }, { quoted: m });
            
            // Clean up
            if (fs.existsSync(mediaPath)) fs.unlinkSync(mediaPath);
            if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
            
        } catch (error) {
            console.error(error);
            m.reply(`╭━━━━━━━━━━━━━━━━━┈⊷\n┃✮│➣ *ERROR*\n╰━━━━━━━━━━━━━━━━━┈⊷\n\n❌ Failed to extract audio!\n\nMake sure:\n1. FFmpeg is installed\n2. Media has audio track\n3. File is not corrupted`);
        }
    }
};