# Railway Deployment Guide - Twitter Bot

This guide explains how to deploy the Twitter AI bot to Railway.

## Overview

- **Frontend**: Deployed to Vercel (aipacatlas-frontend)
- **Backend/Bot**: Deployed to Railway (aipacatlas-backend) - **This runs the Twitter bot**

## Railway Configuration

The `railway.json` file is configured to:
- Build and install dependencies from the `backend/` folder
- Run the Twitter bot with `npm start`
- Auto-restart if the bot crashes

## Required Environment Variables on Railway

The following environment variables need to be configured in Railway. **Do not commit actual API keys to GitHub.**

### Required Variables

```
TWITTER_API_KEY=your_twitter_api_key_here
TWITTER_API_SECRET=your_twitter_api_secret_here
TWITTER_ACCESS_TOKEN=your_twitter_access_token_here
TWITTER_ACCESS_TOKEN_SECRET=your_twitter_access_token_secret_here
TWITTER_BEARER_TOKEN=your_twitter_bearer_token_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

> **Note**: Actual API keys should only exist in:
> - Railway environment variables (secure)
> - Local `.env` file (gitignored)
> - Never in GitHub commits

## How to Add Environment Variables on Railway

1. Go to your Railway project: https://railway.app/project/aipacatlas-backend
2. Click on your service
3. Go to the "Variables" tab
4. Click "+ New Variable"
5. Add each variable from the list above
6. Click "Deploy" to apply the changes

## Deployment Steps

### Initial Deployment

1. Make sure your code is pushed to GitHub:
   ```bash
   git add .
   git commit -m "Add Twitter bot backend"
   git push
   ```

2. Railway will automatically detect the changes and deploy

3. Check the logs in Railway to confirm the bot started successfully. You should see:
   ```
   🤖 Starting Twitter AI Bot...
   🔧 Initializing services...
   🔑 Verifying Twitter credentials...
   ✅ Twitter credentials verified
   ✅ Scheduler started! Bot will post every 2 hours
   🚀 Posting initial tweet on startup...
   ```

### Updates

Any time you push to your GitHub repository, Railway will automatically redeploy.

## Bot Behavior

- **Posting Schedule**: Every 2 hours (00:00, 02:00, 04:00, 06:00, 08:00, 10:00, 12:00, 14:00, 16:00, 18:00, 20:00, 22:00)
- **Startup**: Posts immediately when deployed, then follows the schedule
- **Restart Policy**: Automatically restarts if it crashes
- **Tweet Format**:
  ```
  [AI-generated conspiracy dialogue about AIPAC]

  aipacatlast.com
  CA:TBA

  @NickJFuentes @TuckerCarlson @RealCandaceO
  ```

## Monitoring

### Check if Bot is Running

1. Go to Railway dashboard
2. Click on your backend service
3. Go to "Deployments" tab
4. Check the latest deployment status
5. Click "View Logs" to see real-time output

### What to Look For in Logs

- ✅ **Success**: `Tweet posted successfully`
- ⏰ **Schedule**: `Scheduler started! Bot will post every 2 hours`
- ❌ **Errors**: Any lines with `Error` or `Failed`

## Troubleshooting

### Bot Not Posting

1. Check Railway logs for errors
2. Verify all environment variables are set correctly
3. Check Twitter API rate limits
4. Verify Twitter API credentials are valid

### Bot Keeps Restarting

1. Check logs for error messages
2. Verify Anthropic API key is valid
3. Check if API credits are available

### Want to Change Posting Schedule

Edit `backend/scheduler.js` line 42:
- Current: `'0 */2 * * *'` (every 2 hours)
- Every hour: `'0 * * * *'`
- Every 30 minutes: `'*/30 * * * *'`

Then push to GitHub and Railway will redeploy.

## Important Notes

- The Twitter bot runs 24/7 on Railway
- Each deployment restarts the bot and posts immediately
- The frontend on Vercel and bot on Railway are independent
- Make sure to NEVER commit `.env` files to GitHub (already in `.gitignore`)

## Testing Locally

Before deploying, you can test locally:

```bash
cd backend
npm install
# Make sure .env file has all credentials
npm start
```

Press Ctrl+C to stop the bot.
