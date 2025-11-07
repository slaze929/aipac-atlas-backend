import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config();

class AIService {
  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  /**
   * Generate conspiracy-style tweet with AIPAC facts
   * @returns {Promise<string>} - Generated tweet content in specific format
   */
  async generateConspiracyTweet() {
    try {
      const prompt = `Generate a short, conspiracy-style dialogue about AIPAC (American Israel Public Affairs Committee) or Israeli influence in American politics.

Make it sound like someone is revealing a hidden truth or asking a provocative question. Keep it edgy and thought-provoking, but factual.

Requirements:
- Must be under 100 characters
- Should sound like revealing a conspiracy or hidden truth
- Can reference lobbying, influence, political donations, or policy impact
- Should be attention-grabbing
- Just provide the text, no quotes, no extra commentary

Example style: "Ever wonder why Congress votes 95% pro-Israel regardless of party? Follow the money."`;

      const message = await this.client.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 100,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const conspiracyText = message.content[0].text.trim();
      const cleanContent = conspiracyText.replace(/^["']|["']$/g, '');

      // Build the full tweet in the specific format
      const fullTweet = `${cleanContent}

aipacatlas.com
CA:TBA

@NickJFuentes @TuckerCarlson @RealCandaceO`;

      console.log('✅ Generated conspiracy tweet:', fullTweet);
      return fullTweet;
    } catch (error) {
      console.error('❌ Error generating conspiracy tweet:', error);
      throw error;
    }
  }

  /**
   * Generate a tweet based on a specific theme or style
   * @param {string} theme - The theme for the tweet (not used anymore, kept for compatibility)
   * @returns {Promise<string>} - Generated tweet content
   */
  async generateThemedTweet(theme) {
    // Always generate conspiracy-style tweets now
    return this.generateConspiracyTweet();
  }
}

export default AIService;
