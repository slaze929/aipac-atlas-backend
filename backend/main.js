import TwitterService from './twitterService.js';
import AIService from './aiService.js';
import Scheduler from './scheduler.js';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// EXPRESS API SERVER FOR COMMENTS
// ============================================================================

const app = express();
const PORT = process.env.PORT || 3001;
const COMMENTS_FILE = path.join(__dirname, 'comments.json');

// Middleware
app.use(cors());
app.use(express.json());

// Content Filter
const patterns = {
  phone: [
    /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
    /\b\(\d{3}\)\s?\d{3}[-.\s]?\d{4}\b/g,
    /\b\d{10}\b/g,
    /\+\d{1,3}[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}/g,
  ],
  email: [/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g],
  ssn: [/\b\d{3}-\d{2}-\d{4}\b/g, /\b\d{9}\b/g],
  creditCard: [/\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g],
  address: [
    /\b\d{1,5}\s+([A-Z][a-z]+\s+){1,3}(Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Boulevard|Blvd|Court|Ct|Way|Place|Pl|Circle|Cir)\b/gi,
    /\b(P\.?\s?O\.?\s?Box|PO Box)\s+\d+\b/gi,
  ],
  zipCode: [/\b\d{5}(-\d{4})?\b/g],
  ipAddress: [
    /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
    /\b(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}\b/g,
  ],
  suspiciousUrls: [/\b(dox|doxx|leak|dump|paste|bin)\w*\.(com|org|net|io)/gi],
};

const suspiciousKeywords = [
  'lives at',
  'home address',
  'phone number is',
  'real name is',
  'social security',
  'credit card',
  'bank account',
  'license plate',
  'drivers license',
  'passport number',
];

function checkContent(text) {
  const violations = [];
  const lowerText = text.toLowerCase();

  for (const pattern of patterns.phone) {
    if (pattern.test(text)) {
      violations.push('Phone number detected');
      break;
    }
  }

  for (const pattern of patterns.email) {
    if (pattern.test(text)) {
      violations.push('Email address detected');
      break;
    }
  }

  for (const pattern of patterns.ssn) {
    const matches = text.match(pattern);
    if (matches) {
      const hasHyphens = /-/.test(text);
      if (hasHyphens || matches.some((m) => m.length === 9)) {
        violations.push('Social Security Number or similar ID detected');
        break;
      }
    }
  }

  for (const pattern of patterns.creditCard) {
    if (pattern.test(text)) {
      violations.push('Credit card number detected');
      break;
    }
  }

  for (const pattern of patterns.address) {
    if (pattern.test(text)) {
      violations.push('Physical address detected');
      break;
    }
  }

  const hasLocationContext =
    /\b(city|state|lives|located|residing|resident)\b/i.test(lowerText);
  if (hasLocationContext) {
    for (const pattern of patterns.zipCode) {
      if (pattern.test(text)) {
        violations.push('Location information detected');
        break;
      }
    }
  }

  for (const pattern of patterns.ipAddress) {
    if (pattern.test(text)) {
      violations.push('IP address detected');
      break;
    }
  }

  for (const pattern of patterns.suspiciousUrls) {
    if (pattern.test(text)) {
      violations.push('Suspicious URL detected');
      break;
    }
  }

  for (const keyword of suspiciousKeywords) {
    if (lowerText.includes(keyword)) {
      violations.push(`Suspicious phrase: "${keyword}"`);
      break;
    }
  }

  return {
    isClean: violations.length === 0,
    violations: violations,
  };
}

// Load/save comments
async function loadComments() {
  try {
    const data = await fs.readFile(COMMENTS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { comments: [] };
  }
}

async function saveComments(comments) {
  await fs.writeFile(COMMENTS_FILE, JSON.stringify(comments, null, 2), 'utf8');
}

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/comments', async (req, res) => {
  try {
    const db = await loadComments();
    const grouped = db.comments.reduce((acc, comment) => {
      if (!acc[comment.personKey]) {
        acc[comment.personKey] = [];
      }
      acc[comment.personKey].push(comment);
      return acc;
    }, {});
    res.json(grouped);
  } catch (error) {
    console.error('Error loading comments:', error);
    res.status(500).json({ error: 'Failed to load comments' });
  }
});

app.get('/api/comments/:personKey', async (req, res) => {
  try {
    const { personKey } = req.params;
    const db = await loadComments();
    const comments = db.comments.filter((c) => c.personKey === personKey);
    res.json(comments);
  } catch (error) {
    console.error('Error loading comments:', error);
    res.status(500).json({ error: 'Failed to load comments' });
  }
});

app.get('/api/comments/:personKey/count', async (req, res) => {
  try {
    const { personKey } = req.params;
    const db = await loadComments();
    const count = db.comments.filter((c) => c.personKey === personKey).length;
    res.json({ count });
  } catch (error) {
    console.error('Error loading comment count:', error);
    res.status(500).json({ error: 'Failed to load comment count' });
  }
});

app.post('/api/comments', async (req, res) => {
  try {
    const { personKey, name, text, timestamp } = req.body;

    if (!personKey || !text) {
      return res.status(400).json({ error: 'personKey and text are required' });
    }

    const nameCheck = checkContent(name || 'Anonymous');
    if (!nameCheck.isClean) {
      return res.status(400).json({
        error: `Name contains prohibited content: ${nameCheck.violations.join(', ')}`,
      });
    }

    const textCheck = checkContent(text);
    if (!textCheck.isClean) {
      return res.status(400).json({
        error: `Comment contains prohibited content: ${textCheck.violations.join(', ')}`,
      });
    }

    const db = await loadComments();
    const newComment = {
      id: Date.now(),
      personKey,
      name: name || 'Anonymous',
      text,
      timestamp: timestamp || new Date().toISOString(),
    };

    db.comments.push(newComment);
    await saveComments(db);

    res.status(201).json(newComment);
  } catch (error) {
    console.error('Error posting comment:', error);
    res.status(500).json({ error: 'Failed to post comment' });
  }
});

// ============================================================================
// TWITTER BOT
// ============================================================================

async function startTwitterBot() {
  console.log('🤖 Starting Twitter AI Bot...\n');

  const requiredEnvVars = [
    'TWITTER_API_KEY',
    'TWITTER_API_SECRET',
    'TWITTER_ACCESS_TOKEN',
    'TWITTER_ACCESS_TOKEN_SECRET',
    'ANTHROPIC_API_KEY',
  ];

  const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    console.error('❌ Missing Twitter bot env vars:', missingVars.join(', '));
    console.error('Twitter bot will not start, but API server will continue running.');
    return;
  }

  try {
    const twitterService = new TwitterService();
    const aiService = new AIService();

    console.log('🔑 Verifying Twitter credentials...');
    const isValid = await twitterService.verifyCredentials();

    if (!isValid) {
      console.error('❌ Twitter credentials invalid. Bot will not start.');
      return;
    }

    console.log('\n✅ Twitter bot services initialized!\n');

    const scheduler = new Scheduler(twitterService, aiService);
    scheduler.start();

    console.log('🎉 Twitter AI Bot is running!');
    console.log('📊 Posting interval: Every 2 hours\n');
  } catch (error) {
    console.error('❌ Failed to start Twitter bot:', error);
  }
}

// ============================================================================
// START BOTH SERVICES
// ============================================================================

async function main() {
  console.log('🚀 Starting AIPAC Atlas Backend...\n');

  // Start Express API Server
  app.listen(PORT, () => {
    console.log(`✅ API Server running on port ${PORT}`);
    console.log(`📝 Comments API: http://localhost:${PORT}/api/comments`);
    console.log(`💚 Health check: http://localhost:${PORT}/api/health\n`);
  });

  // Start Twitter Bot
  await startTwitterBot();

  console.log('\n✨ All services running! Press Ctrl+C to stop\n');

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n\n🛑 Shutting down...');
    console.log('👋 Goodbye!');
    process.exit(0);
  });
}

main();
