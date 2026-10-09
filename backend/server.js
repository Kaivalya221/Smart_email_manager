require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { google } = require('googleapis');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

// ─── In-memory token store ───────────────────────────────────────────────────
const tokenStore = {};

// ─── OAuth2 Client ───────────────────────────────────────────────────────────
function createOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI
  );
}

// ─── NLP Processing via Claude API (Anthropic) or OpenAI ────────────────────
async function processEmailWithNLP(emailData) {
  const prompt = `You are an email assistant. Analyze this email and respond ONLY with valid JSON (no markdown, no backticks).

Email:
Subject: ${emailData.subject}
From: ${emailData.from}
Body: ${emailData.snippet}

Return this exact JSON structure:
{
  "summary": "1-2 sentence summary of the email",
  "category": "one of: Work, Personal, Promotions, Spam, Finance, Social, Updates",
  "priority": "one of: High, Medium, Low",
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "sentiment": "one of: Positive, Neutral, Negative",
  "action_required": true or false
}`;

  // Try OpenAI first
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 300,
          temperature: 0.3,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );
      const text = response.data.choices[0].message.content.trim();
      return JSON.parse(text);
    } catch (err) {
      console.warn('OpenAI failed, using rule-based NLP:', err.message);
    }
  }

  // Fallback: rule-based NLP
  return ruleBasedNLP(emailData);
}

function ruleBasedNLP(emailData) {
  const text = `${emailData.subject} ${emailData.snippet} ${emailData.from}`.toLowerCase();

  // Category detection
  let category = 'Personal';
  if (/invoice|payment|receipt|order|shipping|delivery|purchase|transaction|bank|credit|debit|billing/i.test(text)) {
    category = 'Finance';
  } else if (/meeting|deadline|project|report|team|office|work|client|presentation|review|sprint|jira|slack/i.test(text)) {
    category = 'Work';
  } else if (/unsubscribe|offer|sale|discount|deal|promo|coupon|% off|limited time|shop now/i.test(text)) {
    category = 'Promotions';
  } else if (/winner|lottery|prize|click here|verify account|urgent action|suspended|password reset/i.test(text)) {
    category = 'Spam';
  } else if (/linkedin|twitter|facebook|instagram|github|social|follow|connect/i.test(text)) {
    category = 'Social';
  } else if (/newsletter|digest|weekly|monthly|update|changelog|release/i.test(text)) {
    category = 'Updates';
  }

  // Priority detection
  let priority = 'Medium';
  if (/urgent|asap|immediately|critical|important|deadline|overdue|action required/i.test(text)) {
    priority = 'High';
  } else if (/newsletter|unsubscribe|promo|offer|sale|notification/i.test(text)) {
    priority = 'Low';
  }

  // Keywords
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'this', 'that', 'these', 'those', 'it', 'its', 'your', 'our', 'their', 'my', 'you', 'we', 'they', 'he', 'she', 'i']);
  const words = text.split(/\W+/).filter(w => w.length > 3 && !stopWords.has(w));
  const freq = {};
  words.forEach(w => { freq[w] = (freq[w] || 0) + 1; });
  const keywords = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([w]) => w);

  // Summary
  const subject = emailData.subject || 'No subject';
  const sender = emailData.from?.replace(/<.*>/, '').trim() || 'Unknown';
  const snippet = emailData.snippet?.slice(0, 120) || '';
  const summary = `${sender} sent: "${subject}". ${snippet}${snippet.length >= 120 ? '...' : ''}`;

  // Sentiment
  let sentiment = 'Neutral';
  if (/thank|great|awesome|excellent|congrats|happy|pleased|wonderful/i.test(text)) sentiment = 'Positive';
  if (/problem|issue|error|fail|urgent|complaint|refund|cancel|disappointed/i.test(text)) sentiment = 'Negative';

  // Action required
  const action_required = /reply|respond|confirm|approve|review|action required|please|asap|deadline/i.test(text);

  return { summary, category, priority, keywords, sentiment, action_required };
}

// ─── Gmail helpers ────────────────────────────────────────────────────────────
function parseEmailHeaders(headers) {
  const get = (name) => headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value || '';
  return {
    subject: get('Subject') || '(No Subject)',
    from: get('From'),
    to: get('To'),
    date: get('Date'),
  };
}

function decodeBase64(data) {
  if (!data) return '';
  const base64 = data.replace(/-/g, '+').replace(/_/g, '/');
  try {
    return Buffer.from(base64, 'base64').toString('utf-8');
  } catch {
    return '';
  }
}

function htmlToPlainText(html) {
  return html
    // Remove entire <style>...</style> blocks (including all CSS)
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    // Remove entire <script>...</script> blocks
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    // Remove HTML comments
    .replace(/<!--[\s\S]*?-->/g, '')
    // Replace block-level tags with newlines for readability
    .replace(/<\/(p|div|tr|li|h[1-6]|br)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    // Strip all remaining tags
    .replace(/<[^>]+>/g, '')
    // Decode common HTML entities
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&[a-z]+;/gi, ' ')
    // Collapse whitespace / blank lines
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, 800);
}

function extractBody(payload) {
  if (!payload) return '';

  // Recursively collect all parts
  function collectParts(part, acc) {
    if (!part) return;
    if (part.body?.data) acc.push({ mime: part.mimeType || '', data: part.body.data });
    if (part.parts) part.parts.forEach(p => collectParts(p, acc));
  }

  const parts = [];
  collectParts(payload, parts);

  // Prefer plain text
  const plain = parts.find(p => p.mime === 'text/plain');
  if (plain) {
    const decoded = decodeBase64(plain.data);
    return decoded.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim().slice(0, 800);
  }

  // Fall back to HTML → strip to plain text
  const html = parts.find(p => p.mime === 'text/html');
  if (html) {
    return htmlToPlainText(decodeBase64(html.data));
  }

  return '';
}

// ─── Routes ───────────────────────────────────────────────────────────────────

// GET /auth/google → redirect to Google OAuth
app.get('/auth/google', (req, res) => {
  const oauth2Client = createOAuth2Client();
  const scopes = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
  ];
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent',
  });
  res.redirect(url);
});

// GET /gmail-callback → handle OAuth, store tokens
app.get('/gmail-callback', async (req, res) => {
  const { code, error } = req.query;

  if (error) {
    return res.redirect(`/?error=${encodeURIComponent(error)}`);
  }
  if (!code) {
    return res.redirect('/?error=no_code');
  }

  try {
    const oauth2Client = createOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user info
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();
    const userId = userInfo.data.email;

    tokenStore[userId] = tokens;

    // Set session cookie with userId and redirect
    res.redirect(`/?connected=true&user=${encodeURIComponent(userId)}`);
  } catch (err) {
    console.error('OAuth callback error:', err.message);
    res.redirect(`/?error=${encodeURIComponent(err.message)}`);
  }
});

// GET /auth/status → check if user is connected
app.get('/auth/status', (req, res) => {
  const userId = req.query.user;
  if (userId && tokenStore[userId]) {
    res.json({ connected: true, user: userId });
  } else {
    res.json({ connected: false });
  }
});

// GET /emails → fetch + process emails
app.get('/emails', async (req, res) => {
  const userId = req.query.user;
  if (!userId || !tokenStore[userId]) {
    return res.status(401).json({ error: 'Not authenticated. Please connect Gmail first.' });
  }

  try {
    const oauth2Client = createOAuth2Client();
    oauth2Client.setCredentials(tokenStore[userId]);

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    // Fetch message list
    const listRes = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 30,
      labelIds: ['INBOX'],
    });

    const messages = listRes.data.messages || [];
    if (messages.length === 0) {
      return res.json({ emails: [] });
    }

    // Fetch full message details in parallel (batches of 10)
    const batchSize = 10;
    const emailDetails = [];
    for (let i = 0; i < messages.length; i += batchSize) {
      const batch = messages.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(msg =>
          gmail.users.messages.get({
            userId: 'me',
            id: msg.id,
            format: 'full',
          }).catch(e => null)
        )
      );
      emailDetails.push(...batchResults.filter(Boolean));
    }

    // Process each email with NLP
    const processedEmails = await Promise.all(
      emailDetails.map(async (msgRes) => {
        const msg = msgRes.data;
        const headers = parseEmailHeaders(msg.payload?.headers || []);
        const body = extractBody(msg.payload);

        // Gmail snippets contain HTML entities — decode them
        const rawSnippet = msg.snippet || '';
        const cleanSnippet = rawSnippet
          .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
          .replace(/&[a-z]+;/gi, ' ').replace(/\s+/g, ' ').trim();

        const snippet = cleanSnippet || body.slice(0, 200);

        const emailData = {
          id: msg.id,
          subject: headers.subject,
          from: headers.from,
          to: headers.to,
          date: headers.date,
          snippet,
          body: body.slice(0, 1000),
          isRead: !msg.labelIds?.includes('UNREAD'),
          isStarred: msg.labelIds?.includes('STARRED') || false,
          labels: msg.labelIds || [],
        };

        try {
          const nlp = await processEmailWithNLP(emailData);
          return { ...emailData, ...nlp };
        } catch (nlpErr) {
          console.warn(`NLP failed for ${msg.id}:`, nlpErr.message);
          return { ...emailData, summary: snippet, category: 'Personal', priority: 'Medium', keywords: [], sentiment: 'Neutral', action_required: false };
        }
      })
    );

    // Sort by date (newest first)
    processedEmails.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({ emails: processedEmails, count: processedEmails.length });
  } catch (err) {
    console.error('Fetch emails error:', err.message);
    if (err.code === 401 || err.message?.includes('invalid_grant')) {
      // Token expired - clear it
      delete tokenStore[userId];
      return res.status(401).json({ error: 'Session expired. Please reconnect Gmail.' });
    }
    res.status(500).json({ error: err.message });
  }
});

// ─── Serve React frontend from backend ───────────────────────────────────────
const FRONTEND_DIST = path.join(__dirname, '../frontend/dist');
app.use(express.static(FRONTEND_DIST));
app.get('*', (req, res) => {
  res.sendFile(path.join(FRONTEND_DIST, 'index.html'));
});

// ─── Start server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`\n🚀 Smart Email Server running at http://localhost:${PORT}`);
  console.log(`📧 Gmail OAuth: http://localhost:${PORT}/auth/google`);
  console.log(`📬 Emails API:  http://localhost:${PORT}/emails`);
});
