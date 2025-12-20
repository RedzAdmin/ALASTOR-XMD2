const axios = require('axios');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');

async function reminiCommand(sock, chatId, message, args) {
    try {
        // Send initial processing message
        await sock.sendMessage(chatId, {
            text: "╭━━━━━━━━━━━━━━━━━━┈⊷\n┃✮│➣ *✨ REMINI ENHANCEMENT*\n╰━━━━━━━━━━━━━━━━━━┈⊷\n\nProcessing image... Please wait.",
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

        let imageBuffer = null;
        
        // Check if args contain a URL
        if (args.length > 0) {
            const url = args.join(' ');
            if (isValidUrl(url)) {
                // Download image from URL
                const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 30000 });
                imageBuffer = Buffer.from(response.data);
            } else {
                return sock.sendMessage(chatId, {
                    text: "╭━━━━━━━━━━━━━━━━━━┈⊷\n┃✮│➣ *❌ INVALID URL*\n╰━━━━━━━━━━━━━━━━━━┈⊷\n\nPlease provide a valid image URL.\n\n*Usage:* `.remini https://example.com/image.jpg`",
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
        } else {
            // Try to get image from message or quoted message
            imageBuffer = await getImageBuffer(sock, message);
            
            if (!imageBuffer) {
                return sock.sendMessage(chatId, {
                    text: "╭━━━━━━━━━━━━━━━━━━┈⊷\n┃✮│➣ *📸 REMINI AI ENHANCEMENT*\n╰━━━━━━━━━━━━━━━━━━┈⊷\n\n*Usage:*\n• `.remini <image_url>`\n• Reply to an image with `.remini`\n• Send image with `.remini`\n\n*Example:* `.remini https://example.com/image.jpg`",
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

        // Convert image to base64
        const base64Image = imageBuffer.toString('base64');
        
        // Call the Remini API with multiple endpoint options
        const apiEndpoints = [
            `https://api.princetechn.com/api/tools/remini?apikey=prince_tech_api_azfsbshfb&url=data:image/jpeg;base64,${base64Image}`,
            `https://api.remini.ai?image=data:image/jpeg;base64,${base64Image}`,
            `https://api.aiapis.com/remini?image=${encodeURIComponent(`data:image/jpeg;base64,${base64Image}`)}`
        ];
        
        let enhancedImage = null;
        let lastError = null;
        
        // Try each API endpoint
        for (const apiUrl of apiEndpoints) {
            try {
                console.log(`Trying API: ${apiUrl.split('?')[0]}`);
                const response = await axios.get(apiUrl, {
                    timeout: 60000,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                        'Accept': 'application/json'
                    }
                });

                if (response.data) {
                    // Check different response formats
                    if (response.data.image_url || response.data.url || response.data.result?.image_url) {
                        const imageUrl = response.data.image_url || response.data.url || response.data.result?.image_url;
                        
                        // Download enhanced image
                        const imageResponse = await axios.get(imageUrl, {
                            responseType: 'arraybuffer',
                            timeout: 30000
                        });
                        
                        enhancedImage = Buffer.from(imageResponse.data);
                        break;
                    } else if (response.data.base64) {
                        // Some APIs return base64 directly
                        enhancedImage = Buffer.from(response.data.base64, 'base64');
                        break;
                    }
                }
            } catch (apiError) {
                lastError = apiError;
                console.log(`API failed: ${apiError.message}`);
                // Try next endpoint
            }
        }
        
        if (!enhancedImage) {
            throw new Error(lastError?.message || 'All API endpoints failed');
        }

        // Send the enhanced image
        await sock.sendMessage(chatId, {
            image: enhancedImage,
            caption: "╭━━━━━━━━━━━━━━━━━━┈⊷\n┃✮│➣ *✨ IMAGE ENHANCED*\n╰━━━━━━━━━━━━━━━━━━┈⊷\n\n✅ *Enhanced successfully!*\n\n📁 *Type:* AI Enhanced Image\n✨ *Quality:* Ultra HD\n\nENHANCED BY ALASTOR-XMD",
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
        console.error('Remini Error:', error.message);
        
        let errorMessage = "╭━━━━━━━━━━━━━━━━━━┈⊷\n┃✮│➣ *❌ ENHANCEMENT FAILED*\n╰━━━━━━━━━━━━━━━━━━┈⊷\n\n";
        
        if (error.response?.status === 429) {
            errorMessage += "Rate limit exceeded. Please try again in a few minutes.";
        } else if (error.response?.status === 400) {
            errorMessage += "Invalid image format or URL.";
        } else if (error.response?.status === 500) {
            errorMessage += "AI server is busy. Please try again later.";
        } else if (error.code === 'ECONNABORTED') {
            errorMessage += "Request timed out. Please try again.";
        } else if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
            errorMessage += "Network error. Please check your connection.";
        } else if (error.message.includes('All API endpoints failed')) {
            errorMessage += "AI service is currently unavailable. Try again later.";
        } else {
            errorMessage += `Error: ${error.message || 'Unknown error'}`;
        }
        
        await sock.sendMessage(chatId, { 
            text: errorMessage,
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

async function getImageBuffer(sock, message) {
    try {
        // 1) Quoted image (highest priority)
        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (quoted?.imageMessage) {
            return await downloadImage(quoted.imageMessage);
        }

        // 2) Image in the current message
        if (message.message?.imageMessage) {
            return await downloadImage(message.message.imageMessage);
        }

        return null;
    } catch (error) {
        console.error('Get image error:', error);
        return null;
    }
}

async function downloadImage(imageMessage) {
    const stream = await downloadContentFromMessage(imageMessage, 'image');
    const chunks = [];
    for await (const chunk of stream) chunks.push(chunk);
    return Buffer.concat(chunks);
}

// Helper function to validate URL
function isValidUrl(string) {
    try {
        new URL(string);
        return string.match(/\.(jpg|jpeg|png|gif|webp)$/i) !== null;
    } catch (_) {
        return false;
    }
}

module.exports = { reminiCommand };