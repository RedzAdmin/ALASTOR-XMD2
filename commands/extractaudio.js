const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

module.exports = {
    name: "extractaudio",
    alias: ["audio", "mp3", "extract", "tomp3"],
    desc: "Extract audio from video/audio media",
    category: "Media",
    usage: "extractaudio <reply to video/audio>",
    react: "🎵",
    start: async (Miku, m, { text, prefix, quoted, mime }) => {
        try {
            // Check if we have media to process
            const hasMedia = quoted?.message?.audioMessage || 
                           quoted?.message?.videoMessage || 
                           m.message?.audioMessage || 
                           m.message?.videoMessage;
            
            if (!quoted && !hasMedia) {
                return m.reply(`╭━━━━━━━━━━━━━━━━━┈⊷\n│✨ *AUDIO EXTRACTOR*\n╰━━━━━━━━━━━━━━━━━┈⊷\n\n🎵 *Usage:* Reply to a video or audio\n📁 *Formats:* MP4, WebM, Audio notes\n\n*Example:* Reply to video with .extractaudio`);
            }
            
            // Show processing message
            await m.reply(`╭━━━━━━━━━━━━━━━━━┈⊷\n│⏳ *PROCESSING...*\n╰━━━━━━━━━━━━━━━━━┈⊷\n\n📥 Downloading media...\n🎵 Preparing audio extraction...`);
            
            let mediaPath;
            const tempDir = path.join(__dirname, '..', 'temp');
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
            }
            
            // Download media
            try {
                let mediaMsg = quoted || m;
                const buffer = await Miku.downloadMediaMessage(mediaMsg);
                
                if (!buffer) {
                    return m.reply(`╭━━━━━━━━━━━━━━━━━┈⊷\n│❌ *DOWNLOAD FAILED*\n╰━━━━━━━━━━━━━━━━━┈⊷\n\nFailed to download media. Please try again.`);
                }
                
                // Determine file extension
                let extension = '.mp4'; // default
                if (mediaMsg.message?.audioMessage) extension = '.ogg';
                if (mediaMsg.message?.videoMessage) extension = '.mp4';
                
                mediaPath = path.join(tempDir, `input_${Date.now()}${extension}`);
                fs.writeFileSync(mediaPath, buffer);
                
            } catch (downloadError) {
                console.error('Download error:', downloadError);
                return m.reply(`╭━━━━━━━━━━━━━━━━━┈⊷\n│❌ *DOWNLOAD ERROR*\n╰━━━━━━━━━━━━━━━━━┈⊷\n\nFailed to download media. Please make sure:\n• Media is not corrupted\n• File size is within limits\n• Try sending the media again`);
            }
            
            if (!fs.existsSync(mediaPath)) {
                return m.reply("❌ Media file not found after download!");
            }
            
            // Create output path
            const timestamp = Date.now();
            const outputPath = path.join(tempDir, `audio_${timestamp}.mp3`);
            
            // Update status
            await m.reply(`╭━━━━━━━━━━━━━━━━━┈⊷\n│⚙️ *EXTRACTING AUDIO...*\n╰━━━━━━━━━━━━━━━━━┈⊷\n\n🔧 Using FFmpeg to extract audio\n⏳ This may take a moment...`);
            
            // Extract audio using ffmpeg
            let ffmpegSuccess = false;
            
            // Try multiple ffmpeg commands
            const ffmpegCommands = [
                `ffmpeg -i "${mediaPath}" -vn -ar 44100 -ac 2 -b:a 192k -acodec libmp3lame "${outputPath}" -y`,
                `ffmpeg -i "${mediaPath}" -q:a 0 -map a "${outputPath}" -y`,
                `ffmpeg -i "${mediaPath}" -acodec libmp3lame -ab 128k "${outputPath}" -y`
            ];
            
            for (let i = 0; i < ffmpegCommands.length; i++) {
                try {
                    await execPromise(ffmpegCommands[i]);
                    if (fs.existsSync(outputPath) && fs.statSync(outputPath).size > 0) {
                        ffmpegSuccess = true;
                        break;
                    }
                } catch (cmdError) {
                    console.log(`FFmpeg command ${i + 1} failed, trying next...`);
                }
            }
            
            if (!ffmpegSuccess || !fs.existsSync(outputPath)) {
                // Clean up
                if (fs.existsSync(mediaPath)) fs.unlinkSync(mediaPath);
                return m.reply(`╭━━━━━━━━━━━━━━━━━┈⊷\n│❌ *FFMPEG ERROR*\n╰━━━━━━━━━━━━━━━━━┈⊷\n\nFFmpeg failed to extract audio.\n\n*Install FFmpeg:*\n\`\`\`bash\nsudo apt update\nsudo apt install ffmpeg -y\`\`\``);
            }
            
            // Get file stats
            const stats = fs.statSync(outputPath);
            const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
            
            // Check file size
            const MAX_SIZE = 16 * 1024 * 1024; // 16MB WhatsApp limit
            if (stats.size > MAX_SIZE) {
                // Compress the audio
                const compressedPath = path.join(tempDir, `compressed_${timestamp}.mp3`);
                await m.reply(`╭━━━━━━━━━━━━━━━━━┈⊷\n│📦 *COMPRESSING...*\n╰━━━━━━━━━━━━━━━━━┈⊷\n\nFile is ${fileSizeMB}MB (too large)\nCompressing to fit WhatsApp limits...`);
                
                try {
                    await execPromise(`ffmpeg -i "${outputPath}" -b:a 96k "${compressedPath}" -y`);
                    
                    if (fs.existsSync(compressedPath) && fs.statSync(compressedPath).size <= MAX_SIZE) {
                        fs.unlinkSync(outputPath);
                        fs.renameSync(compressedPath, outputPath);
                    }
                } catch (compressError) {
                    console.log('Compression failed, sending original');
                }
            }
            
            // Read the final audio file
            const audioBuffer = fs.readFileSync(outputPath);
            const finalStats = fs.statSync(outputPath);
            const finalSizeMB = (finalStats.size / (1024 * 1024)).toFixed(2);
            
            // Send the audio
            await Miku.sendMessage(m.from, {
                audio: audioBuffer,
                mimetype: 'audio/mpeg',
                ptt: false,
                caption: `╭━━━━━━━━━━━━━━━━━┈⊷\n│✅ *AUDIO EXTRACTED*\n╰━━━━━━━━━━━━━━━━━┈⊷\n\n🎵 *Format:* MP3\n📊 *Size:* ${finalSizeMB} MB\n⏱️ *Duration:* Extracted successfully\n\n✨ Audio ready to use!`
            }, { quoted: m });
            
            // Clean up temporary files
            setTimeout(() => {
                try {
                    if (fs.existsSync(mediaPath)) fs.unlinkSync(mediaPath);
                    if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
                } catch (cleanupError) {
                    console.log('Cleanup error:', cleanupError);
                }
            }, 5000);
            
        } catch (error) {
            console.error('Extract Audio Error:', error);
            await m.reply(`╭━━━━━━━━━━━━━━━━━┈⊷\n│❌ *EXTRACTION FAILED*\n╰━━━━━━━━━━━━━━━━━┈⊷\n\nError: ${error.message}\n\n*Possible solutions:*\n1. Install FFmpeg\n2. Check media format\n3. Try smaller file\n4. Contact support`);
        }
    }
};