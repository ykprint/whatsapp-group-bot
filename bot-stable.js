// Ultra-stable WhatsApp bot for cloud platforms
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Ultra-Stable WhatsApp Bot...');
console.log('🌩️ Optimized for cloud platforms');

// Progressive Chrome argument sets - from minimal to comprehensive
const chromeConfigs = [
    // Config 1: Minimal (most compatible)
    {
        name: 'Minimal',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--single-process'
        ]
    },
    // Config 2: Standard 
    {
        name: 'Standard',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox', 
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor',
            '--no-first-run',
            '--disable-default-apps'
        ]
    },
    // Config 3: Conservative (fallback)
    {
        name: 'Conservative',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--headless=new'
        ]
    }
];

// Find Chrome executable
function findChrome() {
    const chromePaths = [
        '/usr/bin/chromium-browser',
        '/usr/bin/chromium',
        '/usr/bin/google-chrome-stable', 
        '/usr/bin/google-chrome',
        process.env.CHROME_BIN,
        process.env.PUPPETEER_EXECUTABLE_PATH
    ].filter(Boolean);
    
    for (const chromePath of chromePaths) {
        if (fs.existsSync(chromePath)) {
            console.log(`✅ Found Chrome at: ${chromePath}`);
            return chromePath;
        }
    }
    
    console.log('ℹ️  Using default Chrome (letting Puppeteer decide)');
    return undefined;
}

// Try to create client with different configurations
async function createStableClient() {
    const chromeExecutable = findChrome();
    
    for (const config of chromeConfigs) {
        console.log(`🔧 Trying ${config.name} configuration...`);
        
        try {
            const client = new Client({
                authStrategy: new LocalAuth(),
                puppeteer: {
                    headless: true,
                    executablePath: chromeExecutable,
                    args: config.args,
                    timeout: 60000,
                    protocolTimeout: 60000,
                    defaultViewport: null,
                    devtools: false,
                    ignoreDefaultArgs: ['--disable-extensions'],
                    handleSIGINT: false,
                    handleSIGTERM: false,
                    handleSIGHUP: false
                }
            });
            
            console.log(`✅ ${config.name} configuration created successfully`);
            return client;
            
        } catch (error) {
            console.log(`❌ ${config.name} configuration failed: ${error.message}`);
            continue;
        }
    }
    
    // Ultimate fallback - let whatsapp-web.js handle everything
    console.log('🔄 Using ultimate fallback configuration...');
    return new Client({
        authStrategy: new LocalAuth(),
        puppeteer: {
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            timeout: 0
        }
    });
}

// Bot logic
async function startBot() {
    let client;
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
        try {
            console.log(`\n🔄 Attempt ${retryCount + 1}/${maxRetries}`);
            
            client = await createStableClient();
            
            // Set up event handlers
            client.on('qr', (qr) => {
                console.log('\n📱 QR Code Generated! Scan with WhatsApp:');
                console.log('='.repeat(50));
                qrcode.generate(qr, { small: true });
                console.log('='.repeat(50));
                console.log('📲 Steps to connect:');
                console.log('1. Open WhatsApp on your phone');
                console.log('2. Go to Settings > Linked Devices');
                console.log('3. Tap "Link a Device"');
                console.log('4. Scan the QR code above');
                console.log('\n⏳ Waiting for QR code scan...');
            });

            client.on('ready', async () => {
                console.log('\n🎉 WhatsApp bot is ready and connected!');
                console.log('📱 Bot is now active in groups!');
                console.log('💡 Add the bot to a WhatsApp group and type !test');
                retryCount = maxRetries; // Success - stop retrying
            });

            client.on('message_create', async (message) => {
                if (message.fromMe) return;
                
                try {
                    const chat = await message.getChat();
                    
                    // Only work in groups
                    if (!chat.isGroup) {
                        await message.reply('🚫 I only work in group chats. Please add me to a group.');
                        return;
                    }
                    
                    // Basic commands
                    const body = message.body.toLowerCase().trim();
                    
                    if (body === '!test') {
                        await message.reply('✅ Bot is working perfectly! 🎉\n\nBasic commands:\n• !test - Test functionality\n• !ping - Check response time\n• !status - Bot status\n• !help - Show commands');
                    }
                    
                    if (body === '!ping') {
                        const start = Date.now();
                        await message.reply(`🏓 Pong! Response: ${Date.now() - start}ms\n✅ Bot is stable on cloud!`);
                    }
                    
                    if (body === '!status') {
                        const uptime = process.uptime();
                        const uptimeStr = `${Math.floor(uptime / 60)}m ${Math.floor(uptime % 60)}s`;
                        await message.reply(`📊 **Bot Status**\n\n🤖 Status: Online\n⏱️ Uptime: ${uptimeStr}\n💾 Memory: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB\n🌩️ Platform: Cloud\n✅ WhatsApp: Connected`);
                    }
                    
                    if (body === '!help') {
                        await message.reply('🤖 **WhatsApp Bot**\n\nAvailable commands:\n• !test - Test bot functionality\n• !ping - Check response time  \n• !status - Show bot status\n• !help - Show this message\n\n🎯 This is the stable core. Full download features coming soon!');
                    }
                    
                } catch (error) {
                    console.error('Message handling error:', error);
                    try {
                        await message.reply('⚠️ Error processing command. Bot is still working!');
                    } catch (replyError) {
                        console.error('Reply error:', replyError);
                    }
                }
            });

            client.on('disconnected', (reason) => {
                console.log(`\n⚠️ Bot disconnected: ${reason}`);
                console.log('🔄 Will attempt to reconnect...');
                
                setTimeout(() => {
                    startBot(); // Restart bot
                }, 5000);
            });

            client.on('auth_failure', (message) => {
                console.log(`\n❌ Authentication failed: ${message}`);
                console.log('💡 Please scan the QR code again');
            });

            // Initialize with timeout
            console.log('⚡ Initializing WhatsApp connection...');
            
            const initPromise = client.initialize();
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Initialization timeout')), 120000);
            });
            
            await Promise.race([initPromise, timeoutPromise]);
            
            // If we get here, initialization succeeded
            break;
            
        } catch (error) {
            console.error(`\n❌ Attempt ${retryCount + 1} failed:`, error.message);
            
            if (client) {
                try {
                    await client.destroy();
                } catch (destroyError) {
                    // Ignore destroy errors
                }
            }
            
            retryCount++;
            
            if (retryCount < maxRetries) {
                console.log(`⏳ Retrying in 10 seconds...`);
                await new Promise(resolve => setTimeout(resolve, 10000));
            } else {
                console.log('\n💔 All attempts failed. This might be a platform limitation.');
                console.log('📋 Possible solutions:');
                console.log('1. Try a different cloud platform (Railway, Heroku)');
                console.log('2. Use a different WhatsApp library');
                console.log('3. Contact Render support about Puppeteer/Chrome');
                process.exit(1);
            }
        }
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down bot...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Received SIGTERM, shutting down...');
    process.exit(0);
});

// Start the bot
startBot().catch(error => {
    console.error('Fatal startup error:', error);
    process.exit(1);
});
