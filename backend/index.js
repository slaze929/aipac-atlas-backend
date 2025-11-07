import TwitterService from './twitterService.js';
import AIService from './aiService.js';
import Scheduler from './scheduler.js';
import dotenv from 'dotenv';

dotenv.config();

// Main application
async function main() {
  console.log('🤖 Starting Twitter AI Bot...\n');

  // Validate environment variables
  const requiredEnvVars = [
    'TWITTER_API_KEY',
    'TWITTER_API_SECRET',
    'TWITTER_ACCESS_TOKEN',
    'TWITTER_ACCESS_TOKEN_SECRET',
    'ANTHROPIC_API_KEY',
  ];

  const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingVars.join(', '));
    console.error('Please check your .env file and ensure all credentials are set.');
    process.exit(1);
  }

  try {
    // Initialize services
    console.log('🔧 Initializing services...\n');

    const twitterService = new TwitterService();
    const aiService = new AIService();

    // Verify Twitter credentials
    console.log('🔑 Verifying Twitter credentials...');
    const isValid = await twitterService.verifyCredentials();

    if (!isValid) {
      console.error('❌ Twitter credentials are invalid. Please check your API keys.');
      process.exit(1);
    }

    console.log('\n✅ All services initialized successfully!\n');

    // Initialize and start scheduler
    const scheduler = new Scheduler(twitterService, aiService);
    scheduler.start();

    console.log('\n🎉 Twitter AI Bot is now running!');
    console.log('📊 Stats:');
    console.log('   - Posting interval: Every 2 hours');
    console.log('   - Themes: Motivational, Tech, Facts, Questions');
    console.log('\n💡 Press Ctrl+C to stop the bot\n');

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n\n🛑 Shutting down Twitter AI Bot...');
      scheduler.stop();
      console.log('👋 Goodbye!');
      process.exit(0);
    });
  } catch (error) {
    console.error('❌ Failed to start bot:', error);
    process.exit(1);
  }
}

// Start the bot
main();
