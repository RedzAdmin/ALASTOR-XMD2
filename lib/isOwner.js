// lib/isOwner.js
const fs = require('fs');
const path = require('path');

// Read owner data from darkempiretech.json
function readOwnerData() {
    const ownerPath = path.join(__dirname, '..', 'data', 'darkempiretech.json');
    
    try {
        if (fs.existsSync(ownerPath)) {
            const fileContent = fs.readFileSync(ownerPath, 'utf8');
            const data = JSON.parse(fileContent);
            return {
                owners: data.owners || [],
                createdBy: data.createdBy || "CODEBREAKER"
            };
        }
    } catch (error) {
        console.error('Error reading owner data:', error);
    }
    
    // Default data
    return { 
        owners: [], 
        createdBy: "CODEBREAKER" 
    };
}

// Check if user is an owner
function isUserOwner(userId) {
    try {
        if (!userId) return false;
        
        const { owners } = readOwnerData();
        if (owners.length === 0) return false;
        
        // Clean the user ID for comparison
        let cleanUserId = userId;
        if (cleanUserId.includes(':')) {
            cleanUserId = cleanUserId.split(':')[0] + '@s.whatsapp.net';
        } else if (!cleanUserId.includes('@')) {
            cleanUserId = cleanUserId + '@s.whatsapp.net';
        }
        
        // Extract just the number part
        const userNumber = cleanUserId.split('@')[0];
        
        // Check against owner list
        return owners.some(ownerJid => {
            // Extract number from owner JID
            const ownerNumber = ownerJid.replace(/:\d+@/, '@').split('@')[0];
            return ownerNumber === userNumber;
        });
        
    } catch (error) {
        console.error('Error in isUserOwner:', error);
        return false;
    }
}

// Check if user is the creator
function isUserCreator(userId) {
    return isUserOwner(userId); // For simplicity, creator is also an owner
}

// Check if user is owner or sudo
function isOwnerOrSudo(userId, sock, chatId) {
    return isUserOwner(userId);
}

module.exports = {
    isUserOwner,
    isUserCreator,
    isOwnerOrSudo,
    readOwnerData
};