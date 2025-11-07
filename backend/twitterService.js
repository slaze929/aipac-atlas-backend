import { TwitterApi } from 'twitter-api-v2';
import dotenv from 'dotenv';

dotenv.config();

class TwitterService {
  constructor() {
    // Initialize Twitter client with OAuth 1.0a credentials
    this.client = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY,
      appSecret: process.env.TWITTER_API_SECRET,
      accessToken: process.env.TWITTER_ACCESS_TOKEN,
      accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
    });

    // Get read-write access
    this.rwClient = this.client.readWrite;
  }

  /**
   * Post a tweet to Twitter
   * @param {string} text - The content to tweet
   * @returns {Promise<Object>} - The created tweet data
   */
  async postTweet(text) {
    try {
      // Ensure the tweet is within Twitter's character limit
      if (text.length > 280) {
        console.warn('Tweet exceeds 280 characters, truncating...');
        text = text.substring(0, 277) + '...';
      }

      const tweet = await this.rwClient.v2.tweet(text);
      console.log('✅ Tweet posted successfully:', tweet.data.id);
      return tweet;
    } catch (error) {
      console.error('❌ Error posting tweet:', error);
      throw error;
    }
  }

  /**
   * Verify the Twitter credentials are valid
   * @returns {Promise<boolean>} - True if credentials are valid
   */
  async verifyCredentials() {
    try {
      const user = await this.rwClient.v2.me();
      console.log('✅ Twitter credentials verified. Logged in as:', user.data.username);
      return true;
    } catch (error) {
      console.error('❌ Failed to verify Twitter credentials:', error);
      return false;
    }
  }
}

export default TwitterService;
