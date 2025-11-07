# Twitter AI Bot - AIPAC Awareness

An AI-powered Twitter bot that automatically posts conspiracy-style content about AIPAC every 2 hours using Claude AI.

## Features

- 🤖 AI-generated conspiracy-style tweets using Anthropic's Claude
- ⏰ Automatic posting every 2 hours
- 📝 Twitter API v2 integration
- ✅ Credential verification on startup
- 🎯 Targeted mentions: @NickJFuentes @TuckerCarlson @RealCandaceO

## Setup

1. Install dependencies:
   ```bash
   cd backend
   npm install
   ```

2. Environment variables are already configured in `.env`:
   - Twitter API credentials ✅
   - Anthropic API key ✅

## Usage

### Start the bot:
```bash
npm start
```

### Development mode (with auto-reload):
```bash
npm run dev
```

## Schedule

The bot posts tweets:
- **Frequency**: Every 2 hours
- **Schedule**: At 00:00, 02:00, 04:00, 06:00, 08:00, 10:00, 12:00, 14:00, 16:00, 18:00, 20:00, 22:00
- **Startup behavior**: Posts immediately when started, then follows schedule

## Tweet Format

Each tweet follows this structure:
```
[AI-generated conspiracy-style dialogue about AIPAC]

aipacatlast.com
CA:TBA

@NickJFuentes @TuckerCarlson @RealCandaceO
```

Example:
```
Why does AIPAC wield so much influence in Washington despite its small size? Whose interests do they really serve?

aipacatlast.com
CA:TBA

@NickJFuentes @TuckerCarlson @RealCandaceO
```

## Testing Schedule

If you want to test with a different schedule, edit `scheduler.js`:

- Current: `'0 */2 * * *'` (every 2 hours)
- For testing every 2 minutes: `'*/2 * * * *'`
- For testing every 5 minutes: `'*/5 * * * *'`

## Files Structure

```
backend/
├── index.js           - Main entry point
├── twitterService.js  - Twitter API integration
├── aiService.js       - Claude AI integration
├── scheduler.js       - Cron job scheduler
├── .env              - Environment variables
└── package.json      - Dependencies
```

## Troubleshooting

### Error: Missing environment variables
- Check that all variables in `.env` are properly set
- Make sure there are no extra spaces or quotes

### Error: Twitter credentials invalid
- Verify your Twitter API keys in the Developer Portal
- Ensure you have write permissions on your Twitter app

### Error: Anthropic API error
- Check that your Anthropic API key is valid
- Ensure you have sufficient API credits

## Notes

- The bot will post immediately on startup
- Press `Ctrl+C` to stop the bot gracefully
- All tweets are under 280 characters
- The bot automatically handles errors and logs them
