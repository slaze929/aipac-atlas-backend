import cron from 'node-cron';

class Scheduler {
  constructor(twitterService, aiService) {
    this.twitterService = twitterService;
    this.aiService = aiService;
    this.task = null;
    this.themes = ['motivational', 'tech', 'fact', 'question'];
    this.currentThemeIndex = 0;
  }

  /**
   * Get the next theme in rotation
   * @returns {string} - The next theme
   */
  getNextTheme() {
    const theme = this.themes[this.currentThemeIndex];
    this.currentThemeIndex = (this.currentThemeIndex + 1) % this.themes.length;
    return theme;
  }

  /**
   * Post a tweet with AI-generated content
   */
  async postScheduledTweet() {
    try {
      console.log('\n📝 Generating and posting scheduled tweet...');
      console.log('⏰ Time:', new Date().toLocaleString());

      // Rotate through different themes
      const theme = this.getNextTheme();
      console.log('🎨 Theme:', theme);

      // Generate content using AI
      const content = await this.aiService.generateThemedTweet(theme);

      // Post to Twitter
      await this.twitterService.postTweet(content);

      console.log('✅ Scheduled tweet posted successfully!\n');
    } catch (error) {
      console.error('❌ Error posting scheduled tweet:', error);
    }
  }

  /**
   * Start the scheduler to post every 2 hours
   */
  start() {
    if (this.task) {
      console.log('⚠️  Scheduler is already running');
      return;
    }

    // Cron expression: '0 */2 * * *' means every 2 hours at minute 0
    // For testing, you can use '*/2 * * * *' to run every 2 minutes
    this.task = cron.schedule('0 */2 * * *', async () => {
      await this.postScheduledTweet();
    });

    console.log('✅ Scheduler started! Bot will post every 2 hours.');
    console.log('⏰ Next post will be at the top of an even hour (00:00, 02:00, 04:00, etc.)');

    // Post immediately on startup
    console.log('🚀 Posting initial tweet on startup...');
    this.postScheduledTweet();
  }

  /**
   * Stop the scheduler
   */
  stop() {
    if (this.task) {
      this.task.stop();
      this.task = null;
      console.log('⏹️  Scheduler stopped');
    }
  }

  /**
   * Check if scheduler is running
   * @returns {boolean}
   */
  isRunning() {
    return this.task !== null;
  }
}

export default Scheduler;
