const settings = require('../settings');
const fs = require('fs');
const path = require('path');

// Array of bot images to rotate through
const botImages = [
    'bot_image.jpg',
    'bot_image2.jpg', 
    'bot_image3.jpg',
    'bot_image4.jpg'
];

// Array of menu music files to rotate through
const menuMusic = [
    'menu.mp3',
    'menu2.mp3', 
    'menu3.mp3',
    'menu4.mp3'
];

// Function to get a random bot image
function getRandomBotImage() {
    const availableImages = botImages.filter(img => 
        fs.existsSync(path.join(__dirname, '../assets', img))
    );
    
    if (availableImages.length === 0) {
        return null;
    }
    
    // Select a random image
    const randomIndex = Math.floor(Math.random() * availableImages.length);
    return availableImages[randomIndex];
}

// Function to get a random menu music
function getRandomMenuMusic() {
    const availableMusic = menuMusic.filter(music => 
        fs.existsSync(path.join(__dirname, '../assets', music))
    );
    
    if (availableMusic.length === 0) {
        return null;
    }
    
    // Select a random music
    const randomIndex = Math.floor(Math.random() * availableMusic.length);
    return availableMusic[randomIndex];
}

// Function to get all available assets
function getAvailableAssets() {
    const availableImages = botImages.filter(img => 
        fs.existsSync(path.join(__dirname, '../assets', img))
    );
    
    const availableMusic = menuMusic.filter(music => 
        fs.existsSync(path.join(__dirname, '../assets', music))
    );
    
    return {
        images: availableImages,
        music: availableMusic,
        count: availableImages.length + availableMusic.length
    };
}

async function helpCommand(sock, chatId, message, channelLink) {
    // Get random assets
    const randomImage = getRandomBotImage();
    const randomMusic = getRandomMenuMusic();
    const assets = getAvailableAssets();
    
    const helpMessage = `
╭━━━━━━━━━━━━━━━━━┈⊷
┃✮│➣ *🌹 ${settings.botName || '𝐀𝐋𝐀𝐒𝐓𝐎𝐑-𝐗𝐌𝐃'}*  
┃✮│➣ Version: *${settings.version || '2.0.0'}*
┃✮│➣ by ${settings.botOwner || '𝐂𝐎𝐃𝐄𝐁𝐑𝐄𝐀𝐊𝐄𝐑'}
┃✮│➣ YT : ${global.ytch || 'unveiledhacking'}
┃✮│➣ Assets: ${assets.count} loaded
╰━━━━━━━━━━━━━━━━━┈⊷

╭━━〔𝙶𝙴𝙽𝙴𝚁𝙰𝙻 𝙼𝙴𝙽𝚄 〕━┈⊷
┃✮│➣ .menu
┃✮│➣ .ping
┃✮│➣ .alive
┃✮│➣ .tts <text>
┃✮│➣ .owner
┃✮│➣ .joke
┃✮│➣ .quote
┃✮│➣ .fact
┃✮│➣ .news
┃✮│➣ .attp <text>
┃✮│➣ .weather <city>
┃✮│➣ .lyrics <song title>
┃✮│➣ .8ball <question>
┃✮│➣ .groupinfo
┃✮│➣ .staff / .admins
┃✮│➣ .vv
┃✮│➣ .trt <text> <lang>
┃✮│➣ .ss <link>
┃✮│➣ .jid
┃✮│➣ .url
╰━━━━━━━━━━━━━━━━━┈⊷

╭━━━〔𝙰𝙳𝙼𝙸𝙽 𝙼𝙴𝙽𝚄 〕━━┈⊷
┃✮│➣ .ban 
┃✮│➣ .promote
┃✮│➣ .demote
┃✮│➣ .mute
┃✮│➣ .unmute
┃✮│➣ .del
┃✮│➣ .kick
┃✮│➣ .warnings
┃✮│➣ .warn
┃✮│➣ .antilink
┃✮│➣ .antibadword
┃✮│➣ .clear
┃✮│➣ .tag
┃✮│➣ .tagall
┃✮│➣ .tagnotadmin
┃✮│➣ .hidetag
┃✮│➣ .chatbot
┃✮│➣ .resetlink
┃✮│➣ .antitag
┃✮│➣ .welcome 
┃✮│➣ .goodbye
┃✮│➣ .setgdesc <description>
┃✮│➣ .setgname <new name>
┃✮│➣ .setgpp
╰━━━━━━━━━━━━━━━━━┈⊷

╭━━━〔𝙾𝚆𝙽𝙴𝚁 𝙼𝙴𝙽𝚄 〕━━┈⊷
┃✮│➣ .mode (public/private)
┃✮│➣ .addowner 
┃✮│➣ .addprem
┃✮│➣ .clearsession
┃✮│➣ .antidelete
┃✮│➣ .cleartmp
┃✮│➣ .update
┃✮│➣ .settings
┃✮│➣ .setpp <reply to image>
┃✮│➣ .autoreact
┃✮│➣ .autostatus
┃✮│➣ .autoread
┃✮│➣ .autotyping
┃✮│➣ .anticall
┃✮│➣ .pmblocker
┃✮│➣ .pmblocker setmsg
┃✮│➣ .setmention <reply 2 msg>
┃✮│➣ .mention
┃✮│➣ .listactive
┃✮│➣ .listinactive
┃✮│➣ .kickinactive
┃✮│➣ .vcf
┃✮│➣ .antispam
┃✮│➣ .hd
┃✮│➣ .block
┃✮│➣ .unblock
┃✮│➣ .blocklist
┃✮│➣ .save
╰━━━━━━━━━━━━━━━━━┈⊷

╭━〔𝙸𝙼𝙶/𝚂𝚃𝙸𝙲𝙺𝙴𝚁 𝙼𝙴𝙽𝚄 〕━⊷
┃✮│➣ .blur <reply to image>
┃✮│➣ .simage <reply to sticker>
┃✮│➣ .removebg
┃✮│➣ .remini
┃✮│➣ .sticker
┃✮│➣ .tgsticker
┃✮│➣ .crop
┃✮│➣ .meme
┃✮│➣ .take 
┃✮│➣ .emojimix
┃✮│➣ .igs <insta link>
┃✮│➣ .igsc <insta link>
╰━━━━━━━━━━━━━━━━━┈⊷

╭━━━〔𝙿𝙸𝙴𝚂 𝙼𝙴𝙽𝚄 〕━━┈⊷
┃✮│➣ .pies <country>
┃✮│➣ .japan
┃✮│➣ .korea
┃✮│➣ .indonesia
┃✮│➣ .china
┃✮│➣ .hijab
╰━━━━━━━━━━━━━━━━━┈⊷

╭━━━〔 𝙶𝙰𝙼𝙴 𝙼𝙴𝙽𝚄 〕━━┈⊷
┃✮│➣ .tictactoe @user
┃✮│➣ .hangman
┃✮│➣ .guess <letter>
┃✮│➣ .trivia
┃✮│➣ .answer <answer>
┃✮│➣ .truth
┃✮│➣ .dare
╰━━━━━━━━━━━━━━━━━┈⊷

╭━━━〔 𝙰𝙸 𝙼𝙴𝙽𝚄 〕━━┈⊷ 
┃✮│➣ .gpt <question>
┃✮│➣ .gemini <question>
┃✮│➣ .imagine <question>
┃✮│➣ .flux <question>
┃✮│➣ .sora <question>
╰━━━━━━━━━━━━━━━━━┈⊷

╭━━━〔 𝙶𝙸𝚃 𝙼𝙴𝙽𝚄 〕━━┈⊷
┃✮│➣ .git
┃✮│➣ .github
┃✮│➣ .sc
┃✮│➣ .script
┃✮│➣ .repo
╰━━━━━━━━━━━━━━━━━┈⊷

╭━━━〔 𝙰𝙽𝙸𝙼𝙴 𝙼𝙴𝙽𝚄〕━━┈⊷
┃✮│➣ .nom
┃✮│➣ .poke
┃✮│➣ .cry
┃✮│➣ .kiss
┃✮│➣ .pat
┃✮│➣ .hug
┃✮│➣ .wink
┃✮│➣ .facepalm
┃✮│➣ .loli
┃✮│➣ .animuquote
╰━━━━━━━━━━━━━━━━━┈⊷

╭━━━〔 𝙼𝙸𝚂𝙲 𝙼𝙴𝙽𝚄 〕━━┈⊷
┃✮│➣ .heart
┃✮│➣ .horny
┃✮│➣ .lgbt
┃✮│➣ .circle
┃✮│➣ .lolice
┃✮│➣ .its-so-stupid
┃✮│➣ .namecard
┃✮│➣ .oogway
┃✮│➣ .oogway2
┃✮│➣ .tweet
┃✮│➣ .ytcomment
┃✮│➣ .comrade 
┃✮│➣ .gay
┃✮│➣ .glass
┃✮│➣ .jail
┃✮│➣ .passed
┃✮│➣ .triggered 
╰━━━━━━━━━━━━━━━━━┈⊷

╭━━━〔 𝙵𝚄𝙽 𝙼𝙴𝙽𝚄 〕━━┈⊷
┃✮│➣ .compliment @user
┃✮│➣ .insult @user
┃✮│➣ .flirt
┃✮│➣ .shayari
┃✮│➣ .goodnight
┃✮│➣ .roseday
┃✮│➣ .character @user
┃✮│➣ .wasted @user
┃✮│➣ .ship @user
┃✮│➣ .simp @user
┃✮│➣ .stupid @user [txt] 
╰━━━━━━━━━━━━━━━━━┈⊷

╭━〔 𝚃𝚇𝚃 𝙼𝙰𝙺𝙴𝚁 𝙼𝙴𝙽𝚄 〕━┈⊷
┃✮│➣ .metallic <txt>
┃✮│➣ .ice <txt>
┃✮│➣ .snow <txt>
┃✮│➣ .impressive <txt>
┃✮│➣ .matrix <txt>
┃✮│➣ .light <txt>
┃✮│➣ .neon <txt>
┃✮│➣ .devil <txt>
┃✮│➣ .purple <txt>
┃✮│➣ .thunder <txt>
┃✮│➣ .hacker <txt>
┃✮│➣ .sand <txt>
┃✮│➣ .leaves <txt>
┃✮│➣ .1917 <txt>
┃✮│➣ .arena <txt>
┃✮│➣ .blackpink <txt>
┃✮│➣ .glitch <txt>
┃✮│➣ .fire <txt>
╰━━━━━━━━━━━━━━━━━┈⊷

╭━〔 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳 𝙼𝙴𝙽𝚄 〕━┈⊷
┃✮│➣ .song <song name>
┃✮│➣ .play <song name>
┃✮│➣ .spotify <song name> 
┃✮│➣ .instagram <link>
┃✮│➣ .facebook <link>
┃✮│➣ .tiktok <link>
┃✮│➣ .video <song name>
┃✮│➣ .ytmp4 <link>
┃✮│➣ .savestatus <reply to status>
┃✮│➣ .extractaudio <reply to video>
╰━━━━━━━━━━━━━━━━━┈⊷

╭━━━━〔 𝙳𝙴𝚅 𝙲𝙼𝙳 〕━━━┈⊷
┃✮│➣ .broadcast
┃✮│➣ .pair
┃✮│➣ .unpair
┃✮│➣ .autojoin
╰━━━━━━━━━━━━━━━━━┈⊷

╭━━━━〔 𝚄𝙿𝙳𝙰𝚃𝙴𝚂 〕━━━┈⊷
┃✮│➣ Join Channel: ${channelLink || global.channelLink}
╰━━━━━━━━━━━━━━━━━┈⊷`;

    try {
        let sentMessage = false;
        
        // Try to send with image if available
        if (randomImage) {
            try {
                const imagePath = path.join(__dirname, '../assets', randomImage);
                const imageBuffer = fs.readFileSync(imagePath);
                
                await sock.sendMessage(chatId, {
                    image: imageBuffer,
                    caption: helpMessage,
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
                sentMessage = true;
                
                // Send audio if available
                if (randomMusic) {
                    try {
                        const musicPath = path.join(__dirname, '../assets', randomMusic);
                        const musicBuffer = fs.readFileSync(musicPath);
                        
                        await sock.sendMessage(chatId, {
                            audio: musicBuffer,
                            mimetype: 'audio/mpeg',
                            ptt: false
                        });
                    } catch (musicError) {
                        console.log('Could not send menu music:', musicError.message);
                    }
                }
            } catch (imageError) {
                console.log('Could not send image, falling back to text:', imageError.message);
                sentMessage = false;
            }
        }
        
        // Fallback to text only if image failed
        if (!sentMessage) {
            await sock.sendMessage(chatId, { 
                text: helpMessage,
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363404912601381@newsletter',
                        newsletterName: 'ALASTOR-XMD by CODEBREAKER',
                        serverMessageId: -1
                    } 
                }
            });
            
            // Still try to send audio if available
            if (randomMusic) {
                try {
                    const musicPath = path.join(__dirname, '../assets', randomMusic);
                    const musicBuffer = fs.readFileSync(musicPath);
                    
                    await sock.sendMessage(chatId, {
                        audio: musicBuffer,
                        mimetype: 'audio/mpeg',
                        ptt: false
                    });
                } catch (musicError) {
                    console.log('Could not send menu music:', musicError.message);
                }
            }
        }
        
        console.log(`🎵 Help menu sent with: ${randomImage || 'No image'} | ${randomMusic || 'No music'}`);
        
    } catch (error) {
        console.error('Error in help command:', error);
        await sock.sendMessage(chatId, { text: helpMessage });
    }
}

module.exports = helpCommand;