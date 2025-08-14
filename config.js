module.exports = {
    // Bot settings
    BOT_NAME: 'Group Media Bot',
    MAX_CONCURRENT_DOWNLOADS: 3,
    FILE_RETENTION_HOURS: 1,
    CLEANUP_INTERVAL_MINUTES: 30,
    MAX_FILE_SIZE_MB: 64, // WhatsApp limit
    
    // Download settings
    PARALLEL_FRAGMENTS: 16,
    DEFAULT_AUDIO_QUALITY: 'best',
    
    // Supported video qualities
    VIDEO_QUALITIES: ['144p', '240p', '360p', '480p', '720p', '1080p'],
    
    // Audio effects
    BASS_LEVELS: Array.from({length: 20}, (_, i) => i + 1),
    SPEED_RANGE: { min: 0.5, max: 2.0 },
    
    // Supported sites (yt-dlp compatible)
    SUPPORTED_SITES: [
        'YouTube', 'Facebook', 'Instagram', 'Twitter/X', 'TikTok', 
        'Vimeo', 'Dailymotion', 'SoundCloud', 'Twitch', 'Reddit',
        'LinkedIn', 'Pinterest', 'Imgur', 'Streamable', 'Bandcamp',
        'And 1000+ more sites supported by yt-dlp'
    ],
    
    // Paths
    DOWNLOADS_DIR: './downloads',
    TEMP_DIR: './temp',
    
    // Bot status
    STATUS: {
        ONLINE: '🟢 Online',
        BUSY: '🟡 Processing',
        OFFLINE: '🔴 Offline',
        ERROR: '❌ Error'
    },
    
    // Commands help
    HELP_MESSAGE: `
🤖 *Group Media Bot Commands*

📥 *Download Commands:*
• \`!yta [video name/URL]\` - Download YouTube audio
• \`!ytv [video name/URL] [quality]\` - Download YouTube video
• \`!dl [URL] [audio/quality]\` - Download from other sites
• \`!sites\` - Show supported sites

🎵 *Audio Effects:*
• \`!bass [video] [1-20]\` - Download with bass boost
• \`!speed [video] [0.5-2.0]\` - Download with speed control

⚡ *Control Commands:*
• \`!stop\` - Cancel all active downloads
• \`!ping\` - Check response time
• \`!status\` - Show bot status
• \`!speed-test\` - Test download speeds

👑 *Admin Commands:*
• \`!bot-on/!bot-off\` - Enable/disable bot
• \`!add-admin @user\` - Add bot admin
• \`!remove-admin @user\` - Remove bot admin
• \`boot @user\` - Remove user from group

🎭 *Fun Commands:*
• \`!joke\` - Get a random joke
• \`!define [word]\` - Get word definition
• \`!help\` - Show this message

📋 *Features:*
• Real-time progress indicators
• Fast parallel downloads (16 fragments)
• Video qualities: 480p, 720p, 1080p
• Auto file cleanup (1 hour retention)
• Group-based download management

⚠️ *Note:* Files auto-delete after 1 hour to save storage.
    `
};
