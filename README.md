# WhatsApp Group Media Bot 🤖

A powerful WhatsApp bot designed exclusively for group chats that can download media from YouTube and 1000+ other sites with advanced features like bass boost, speed control, and real-time progress tracking.

## ✨ Features

### 📥 Download Commands
- **YouTube Audio**: `!yta [video name/URL]` - Download YouTube audio in high quality
- **YouTube Video**: `!ytv [video name/URL] [quality]` - Download YouTube video with quality options
- **Universal Downloader**: `!dl [URL] [audio/quality]` - Download from 1000+ supported sites
- **Supported Sites**: `!sites` - View all supported platforms

### 🎵 Audio Effects
- **Bass Boost**: `!bass [video] [1-20]` - Download with bass enhancement
- **Speed Control**: `!speed [video] [0.5-2.0]` - Download with speed adjustment

### ⚡ Control Commands
- **Stop Downloads**: `!stop` - Cancel all active downloads in the group
- **System Check**: `!ping` - Check bot response time
- **Status Report**: `!status` - View detailed bot status
- **Speed Test**: `!speed-test` - Test download speeds

### 👑 Admin Commands
- **Bot Control**: `!bot-on/!bot-off` - Enable/disable bot (admin only)
- **Admin Management**: `!add-admin/@remove-admin` - Manage bot administrators
- **User Management**: `boot @username` - Remove mentioned user (admin only)

### 🎭 Fun Commands
- **Random Jokes**: `!joke` - Get a random joke
- **Word Definition**: `!define [word]` - Get comprehensive word definitions
- **Help**: `!help` - Show complete command list

### 🔧 Advanced Features
- **Real-time Progress**: Live download progress indicators
- **Fast Downloads**: 16-fragment parallel downloading
- **Quality Options**: 144p, 240p, 360p, 480p, 720p, 1080p
- **Auto Cleanup**: Files auto-delete after 1 hour
- **Group Management**: Separate settings per group
- **Smart Search**: Search YouTube by video name
- **File Size Check**: Respects WhatsApp's 64MB limit

## 🛠️ Installation

### Prerequisites
- Node.js (v16 or higher)
- FFmpeg (for audio/video processing)
- yt-dlp (for downloading)

### Step 1: Clone/Download
```bash
# Navigate to the bot directory
cd C:\Users\zavan\whatsapp-bot
```

### Step 2: Install Dependencies
```powershell
npm install
```

### Step 3: Install External Tools

#### Install yt-dlp
```powershell
# Download yt-dlp
Invoke-WebRequest -Uri "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe" -OutFile "yt-dlp.exe"

# Add to PATH or place in bot directory
```

#### Install FFmpeg
```powershell
# Download FFmpeg from https://ffmpeg.org/download.html
# Extract and add to PATH
```

### Step 4: Start the Bot
```powershell
npm start
```

### Step 5: Scan QR Code
1. Open WhatsApp on your phone
2. Go to **Settings > Linked Devices**
3. Tap **Link a Device**
4. Scan the QR code displayed in terminal

## 📋 Usage Guide

### Basic Commands
```
!help - Show all commands
!yta despacito - Download audio by search
!yta https://youtube.com/watch?v=abc123 - Download audio by URL
!ytv "never gonna give you up" 720p - Download video in 720p
!dl https://twitter.com/user/status/123 audio - Download Twitter video as audio
!bass "shape of you" 15 - Download with bass boost level 15
!speed "old town road" 1.25 - Download at 1.25x speed
!stop - Cancel all downloads
!status - Check bot status
```

### Admin Commands
```
!bot-off - Disable bot in this group (admin only)
!bot-on - Re-enable bot in this group (admin only)
!add-admin @user - Add user as bot admin
!remove-admin @user - Remove user as bot admin
boot @user - Remove user from group
```

### Quality Options
- **144p** - Lowest quality, smallest file
- **240p** - Low quality
- **360p** - Standard quality
- **480p** - Good quality
- **720p** - High quality (default)
- **1080p** - Full HD quality

### Bass Boost Levels
- **1-5**: Subtle enhancement
- **6-10**: Moderate boost
- **11-15**: Strong boost
- **16-20**: Maximum boost

### Speed Control
- **0.5x**: Half speed (slower)
- **0.75x**: 3/4 speed
- **1.0x**: Normal speed
- **1.25x**: 25% faster
- **1.5x**: 50% faster
- **2.0x**: Double speed

## 🔒 Security Features

- **Group-Only Operation**: Bot only works in group chats for security
- **Admin Controls**: Bot can be enabled/disabled per group
- **Permission System**: Admin-only commands for sensitive operations
- **Auto Cleanup**: Files automatically deleted to prevent storage abuse
- **File Size Limits**: Respects WhatsApp's file size limitations

## 🌐 Supported Sites

The bot supports downloading from 1000+ sites including:
- YouTube, Facebook, Instagram, Twitter/X, TikTok
- Vimeo, Dailymotion, SoundCloud, Twitch
- Reddit, LinkedIn, Pinterest, Imgur
- And many more platforms supported by yt-dlp

Use `!sites` command to see the complete list.

## ⚙️ Configuration

Edit `config.js` to customize:
- File retention period (default: 1 hour)
- Maximum file size (default: 64MB)
- Parallel download fragments (default: 16)
- Cleanup intervals (default: 30 minutes)
- Supported video qualities

## 🧹 Cleanup System

- **Auto-delete**: Files are automatically deleted after 1 hour
- **Startup cleanup**: Old files are cleaned when bot starts
- **Periodic cleanup**: Automatic cleanup every 30 minutes
- **Storage efficiency**: Prevents disk space accumulation

## 🚨 Troubleshooting

### Common Issues

1. **"No results found"**
   - Check your search terms
   - Try using direct URLs instead

2. **"File too large"**
   - Use lower quality settings
   - Try audio-only download

3. **"Site not supported"**
   - Check if the site is in the supported list
   - Some sites may have region restrictions

4. **Download fails**
   - Check internet connection
   - Verify the URL is accessible
   - Some sites may be temporarily unavailable

### Error Messages
- **❌ No results found**: Search term didn't match any videos
- **❌ File too large**: Downloaded file exceeds WhatsApp's limit
- **❌ Failed to download**: Generic download error, try again
- **🚫 I only work in group chats**: Bot was used in private chat

## 📈 Performance

- **Fast Downloads**: Uses 16 parallel fragments for optimal speed
- **Efficient Processing**: Minimal resource usage
- **Smart Caching**: Optimized temporary file handling
- **Concurrent Downloads**: Multiple users can download simultaneously

## 🔧 Development

### Project Structure
```
whatsapp-bot/
├── bot.js              # Main bot file
├── config.js           # Configuration settings
├── utils.js            # Utility functions
├── downloadManager.js  # Download handling
├── package.json        # Dependencies
└── README.md          # Documentation
```

### Scripts
- `npm start` - Start the bot
- `npm run dev` - Start with nodemon for development

## 📝 License

This project is licensed under the MIT License.

## ⚠️ Disclaimer

This bot is for educational and personal use only. Please respect copyright laws and the terms of service of the platforms you're downloading from. The developers are not responsible for any misuse of this software.

## 🤝 Support

If you encounter any issues:
1. Check the troubleshooting section
2. Ensure all dependencies are installed correctly
3. Verify your internet connection
4. Check that the URLs are valid and accessible

---

**Made with ❤️ for WhatsApp Groups**
