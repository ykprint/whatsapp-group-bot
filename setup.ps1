Write-Host "Setting up external tools for WhatsApp Bot..." -ForegroundColor Cyan
Write-Host ""

# Create tools directory if it doesn't exist
$toolsDir = ".\tools"
if (!(Test-Path $toolsDir)) {
    New-Item -ItemType Directory -Path $toolsDir | Out-Null
    Write-Host "Created tools directory" -ForegroundColor Green
}

# Download yt-dlp
$ytdlpPath = "$toolsDir\yt-dlp.exe"
if (!(Test-Path $ytdlpPath)) {
    Write-Host "Downloading yt-dlp..." -ForegroundColor Yellow
    try {
        Invoke-WebRequest -Uri "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe" -OutFile $ytdlpPath -UseBasicParsing
        Write-Host "yt-dlp downloaded successfully" -ForegroundColor Green
    } catch {
        Write-Host "Failed to download yt-dlp" -ForegroundColor Red
        Write-Host "Please download manually from: https://github.com/yt-dlp/yt-dlp/releases" -ForegroundColor Yellow
    }
} else {
    Write-Host "yt-dlp already exists" -ForegroundColor Green
}

# Add tools to PATH for current session
$toolsPath = Resolve-Path $toolsDir
$env:PATH = "$toolsPath;$env:PATH"

Write-Host ""
Write-Host "Setup complete!" -ForegroundColor Green
Write-Host "Next step: Run 'npm start' to start the bot" -ForegroundColor Cyan
