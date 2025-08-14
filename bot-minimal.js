// Minimal WhatsApp bot for cloud platforms
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

console.log('🤖 Starting Minimal WhatsApp Bot...');
console.log('🌩️ Using absolute minimal Chrome configuration');

// Create client with bare minimum settings
const client = new Client({
    authStrategy: new LocalAuth({
        dataPath: './.wwebjs_auth',
    }),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox'
        ],
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || 
                       process.env.CHROME_BIN || 
                       '/usr/bin/chromium-browser',
        timeout: 0,
        protocolTimeout: 0,
        handleSIGINT: false,
        handleSIGTERM: false,
        handleSIGHUP: false
    }
});

console.log('⚡ Initializing WhatsApp with minimal configuration...');

let isReady = false;

// QR Code event
client.on('qr', (qr) => {
    console.log('\n📱 QR Code Generated! Scan with WhatsApp:');
    console.log('='.repeat(50));
    qrcode.generate(qr, { small: true });
    console.log('='.repeat(50));
    console.log('\n📲 Steps to connect:');
    console.log('1. Open WhatsApp on your phone');
    console.log('2. Go to Settings > Linked Devices');
    console.log('3. Tap "Link a Device"');
    console.log('4. Scan the QR code above');
    console.log('\n⏳ Waiting for QR code scan...');
});

// Ready event
client.on('ready', () => {
    console.log('\n🎉 WhatsApp bot is ready and connected!');
    console.log('📱 Connected to WhatsApp successfully!');
    console.log('💡 Add the bot to a WhatsApp group and type !test');
    isReady = true;
});

// Message handling
client.on('message_create', async (message) => {
    if (message.fromMe || !isReady) return;

    try {
        const chat = await message.getChat();
        
        // Only work in groups
        if (!chat.isGroup) {
            await message.reply('🚫 I only work in group chats. Please add me to a group.');
            return;
        }
        
        const body = message.body.trim().toLowerCase();
        
        // Basic test commands
        switch (body) {
            case '!test':
                await message.reply('✅ **Bot is working!** 🎉\n\nMinimal bot is running successfully on Railway!\n\nCommands:\n• !test - Test functionality\n• !ping - Response time\n• !help - Show help');
                break;
                
            case '!ping':
                const start = Date.now();
                const responseTime = Date.now() - start;
                await message.reply(`🏓 **Pong!**\n\n⚡ Response: ${responseTime}ms\n🤖 Status: Online\n🌩️ Platform: Railway`);
                break;
                
            case '!help':
                await message.reply('🤖 **WhatsApp Bot Help**\n\n**Available Commands:**\n• !test - Test bot functionality\n• !ping - Check response time\n• !help - Show this message\n\n✅ Bot is running successfully!\n🔧 This is the minimal stable version.');
                break;
                
            case '!status':
                const uptime = Math.floor(process.uptime() / 60);
                const memory = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
                await message.reply(`📊 **Bot Status**\n\n🤖 Status: Online ✅\n⏱️ Uptime: ${uptime} minutes\n💾 Memory: ${memory}MB\n🌩️ Platform: Railway\n📱 WhatsApp: Connected`);
                break;
        }
        
    } catch (error) {
        console.error('Message handling error:', error);
        try {
            await message.reply('⚠️ Error processing command, but bot is still running!');
        } catch (e) {
            console.error('Reply error:', e);
        }
    }
});

// Error handling
client.on('disconnected', (reason) => {
    console.log(`\n⚠️ Bot disconnected: ${reason}`);
    console.log('🔄 Attempting to reconnect in 10 seconds...');
    
    setTimeout(() => {
        console.log('🔄 Restarting bot...');
        process.exit(1); // Let Railway restart the container
    }, 10000);
});

client.on('auth_failure', (message) => {
    console.log(`\n❌ Authentication failed: ${message}`);
    console.log('💡 Please scan the QR code again when it appears');
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down bot...');
    try {
        await client.destroy();
    } catch (error) {
        // Ignore errors during shutdown
    }
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n🛑 Railway is restarting the service...');
    try {
        await client.destroy();
    } catch (error) {
        // Ignore errors during shutdown
    }
    process.exit(0);
});

// Start the client
console.log('🚀 Starting WhatsApp client...');

client.initialize().catch(error => {
    console.error('\n❌ Failed to initialize WhatsApp client:', error.message);
    console.log('\n📋 This might be a platform limitation.');
    console.log('💡 Consider trying a different cloud platform:');
    console.log('• Heroku (requires credit card)');
    console.log('• DigitalOcean App Platform (paid)');
    console.log('• Google Cloud Run (free tier)');
    console.log('• Vercel (for simpler bots)');
    
    process.exit(1);
});
