require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Serve admin panel static files
app.use('/admin', express.static(path.join(__dirname, 'admin')));

// MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'easytutor',
  waitForConnections: true,
  connectionLimit: 10,
});

// ============================================================
// EMAIL CONFIG
// ============================================================

const mailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER || '',
    pass: process.env.MAIL_PASS || '',
  },
});

async function sendLoginEmail(user) {
  try {
    const loginTime = new Date().toLocaleString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

    await mailTransporter.sendMail({
      from: '"EasyTutor App" <namdevaryan434@gmail.com>',
      to: user.email,
      subject: '🔑 Login Successful - EasyTutor',
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 500px; margin: 0 auto; background: linear-gradient(135deg, #0F0F2D, #1A1A3E); border-radius: 16px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #A855F7, #EC4899); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">✨ EasyTutor</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0;">Welcome back!</p>
          </div>
          <div style="padding: 30px; color: #E0E0E0;">
            <p style="font-size: 16px;">Hi <strong style="color: #A855F7;">${user.name}</strong>,</p>
            <p>You just logged in to your EasyTutor account. Here are your details:</p>
            <div style="background: rgba(168, 85, 247, 0.1); border: 1px solid rgba(168, 85, 247, 0.3); border-radius: 12px; padding: 20px; margin: 20px 0;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #999; font-size: 13px;">Name</td>
                  <td style="padding: 8px 0; color: white; font-weight: 600; text-align: right;">${user.name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #999; font-size: 13px;">Email</td>
                  <td style="padding: 8px 0; color: white; font-weight: 600; text-align: right;">${user.email}</td>
                </tr>
                ${user.childName ? `<tr>
                  <td style="padding: 8px 0; color: #999; font-size: 13px;">Child Name</td>
                  <td style="padding: 8px 0; color: white; font-weight: 600; text-align: right;">${user.childName}</td>
                </tr>` : ''}
                ${user.childAge ? `<tr>
                  <td style="padding: 8px 0; color: #999; font-size: 13px;">Child Age</td>
                  <td style="padding: 8px 0; color: white; font-weight: 600; text-align: right;">${user.childAge} years</td>
                </tr>` : ''}
                <tr>
                  <td style="padding: 8px 0; color: #999; font-size: 13px;">Login Time</td>
                  <td style="padding: 8px 0; color: white; font-weight: 600; text-align: right;">${loginTime}</td>
                </tr>
              </table>
            </div>
            <p style="font-size: 13px; color: #999;">If this wasn't you, please secure your account immediately.</p>
          </div>
          <div style="background: rgba(0,0,0,0.2); padding: 15px; text-align: center;">
            <p style="color: #666; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} EasyTutor - Making Learning Fun!</p>
          </div>
        </div>
      `,
    });
    console.log('Login email sent to:', user.email);
  } catch (error) {
    console.error('Failed to send login email:', error.message);
  }
}

// ============================================================
// AUTH ROUTES
// ============================================================

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, childName, childAge } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Name, email and password are required' });
    }

    // Check if email already exists
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email.toLowerCase()]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, error: 'This email is already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const avatar = name.charAt(0).toUpperCase();
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, child_name, child_age, avatar) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email.toLowerCase(), hashedPassword, childName || null, childAge || null, avatar]
    );

    // Create stats row
    await pool.query('INSERT INTO stats (user_id, total_scans) VALUES (?, 0)', [result.insertId]);

    // Return user (without password)
    const user = {
      id: result.insertId,
      name,
      email: email.toLowerCase(),
      childName: childName || null,
      childAge: childAge || null,
      avatar,
      createdAt: new Date().toISOString(),
    };

    res.json({ success: true, user });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, error: 'Something went wrong. Please try again.' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email.toLowerCase()]);
    if (users.length === 0) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const dbUser = users[0];
    const passwordMatch = await bcrypt.compare(password, dbUser.password);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const user = {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      childName: dbUser.child_name,
      childAge: dbUser.child_age,
      avatar: dbUser.avatar,
      createdAt: dbUser.created_at,
    };

    // Send login email (don't block the response)
    sendLoginEmail(user);

    res.json({ success: true, user });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Something went wrong. Please try again.' });
  }
});

// Update profile
app.put('/api/auth/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, childName, childAge } = req.body;

    const updates = [];
    const values = [];

    if (name) { updates.push('name = ?'); values.push(name); }
    if (childName) { updates.push('child_name = ?'); values.push(childName); }
    if (childAge) { updates.push('child_age = ?'); values.push(childAge); }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, error: 'Nothing to update' });
    }

    values.push(userId);
    await pool.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);

    // Return updated user
    const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const dbUser = users[0];
    const user = {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      childName: dbUser.child_name,
      childAge: dbUser.child_age,
      avatar: dbUser.avatar,
      createdAt: dbUser.created_at,
    };

    res.json({ success: true, user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, error: 'Could not update profile' });
  }
});

// ============================================================
// HISTORY ROUTES
// ============================================================

// Get history for a user
app.get('/api/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const [rows] = await pool.query(
      'SELECT * FROM history WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    const items = rows.map((row) => ({
      id: row.id.toString(),
      imageUri: row.image_uri,
      result: {
        type: row.content_type || 'text',
        extractedText: row.extracted_text,
        summary: row.summary,
        visualExplanation: row.visual_explanation,
        realWorldExamples: typeof row.real_world_examples === 'string'
          ? JSON.parse(row.real_world_examples)
          : row.real_world_examples,
        keyWords: typeof row.key_words === 'string'
          ? JSON.parse(row.key_words)
          : row.key_words,
        solutionSteps: row.solution_steps
          ? (typeof row.solution_steps === 'string' ? JSON.parse(row.solution_steps) : row.solution_steps)
          : null,
        finalAnswer: row.final_answer || null,
      },
      createdAt: row.created_at,
    }));

    res.json({ success: true, items });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ success: false, error: 'Could not fetch history' });
  }
});

// Save history item
app.post('/api/history', async (req, res) => {
  try {
    const { userId, imageUri, result } = req.body;

    const [insertResult] = await pool.query(
      `INSERT INTO history (user_id, image_uri, extracted_text, summary, visual_explanation, real_world_examples, key_words, content_type, solution_steps, final_answer)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        imageUri || null,
        result.extractedText || null,
        result.summary || null,
        result.visualExplanation || null,
        JSON.stringify(result.realWorldExamples || []),
        JSON.stringify(result.keyWords || []),
        result.type || 'text',
        result.solutionSteps ? JSON.stringify(result.solutionSteps) : null,
        result.finalAnswer || null,
      ]
    );

    const item = {
      id: insertResult.insertId.toString(),
      imageUri,
      result,
      createdAt: new Date().toISOString(),
    };

    res.json({ success: true, item });
  } catch (error) {
    console.error('Save history error:', error);
    res.status(500).json({ success: false, error: 'Could not save history item' });
  }
});

// Delete history item
app.delete('/api/history/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;
    await pool.query('DELETE FROM history WHERE id = ?', [itemId]);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete history error:', error);
    res.status(500).json({ success: false, error: 'Could not delete history item' });
  }
});

// ============================================================
// STATS ROUTES
// ============================================================

// Get stats for a user
app.get('/api/stats/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const [statsRows] = await pool.query(
      `SELECT total_scans,
              IF(last_scan_date = CURDATE(), today_scans, 0) AS today_scans
       FROM stats WHERE user_id = ?`,
      [userId]
    );
    const [countRows] = await pool.query('SELECT COUNT(*) as total FROM history WHERE user_id = ?', [userId]);

    const totalScans = statsRows.length > 0 ? statsRows[0].total_scans : 0;
    const totalSaved = countRows[0].total;
    const todayScans = statsRows.length > 0 ? statsRows[0].today_scans : 0;

    res.json({ success: true, stats: { totalScans, totalSaved, todayScans } });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ success: false, error: 'Could not fetch stats' });
  }
});

// ============================================================
// AI ANALYSIS ROUTE
// ============================================================

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

const SYSTEM_PROMPT = `You are EasyTutor, a friendly AI teacher for students of all levels — from class 1st to 12th and beyond.
When given an image, you must FIRST determine what type of content it contains.

STEP 1: DETECT CONTENT TYPE (choose exactly one)
- "math" → pure math: equations, arithmetic, algebra, geometry, trigonometry, calculus, fractions, percentages, ratios, probability, word problems that are purely mathematical
- "aptitude" → logical reasoning, number series/patterns, puzzles, seating arrangements, blood relations, coding-decoding, direction sense, syllogisms, data interpretation, clock problems, calendar problems, permutations & combinations in reasoning context, analogies, odd-one-out, competitive exam aptitude questions
- "text" → paragraphs, definitions, essays, notes, science text, general knowledge, anything that is not a problem to solve

STEP 2A: IF type is "text", respond with:
{
  "type": "text",
  "extractedText": "only plain readable text, NO code or programming syntax",
  "summary": "a detailed easy-to-understand explanation (see RULES FOR TEXT below)",
  "visualExplanation": "a vivid, fun visual explanation (see RULES FOR TEXT below)",
  "realWorldExamples": ["always give exactly 5 real-world examples, no more, no less"],
  "keyWords": ["scale number of keywords based on document size — 3 for short, 5 for medium, 7 for large"]
}

⚠️ CRITICAL RULE — READ THE IMAGE VERY CAREFULLY BEFORE RESPONDING:
- Before writing anything, READ every single word, line, and paragraph in the image thoroughly.
- Your explanation must be ACCURATE to what is actually written in the image. Do NOT guess or make up content.
- If you misread or skip any part of the text, the student will get wrong information. ACCURACY FIRST.

RULES FOR TEXT EXPLANATIONS — MATCH YOUR RESPONSE LENGTH TO THE DOCUMENT SIZE:

📄 SHORT DOCUMENT (1-5 lines, a definition, a single concept):
- summary: 4-6 sentences. Explain the concept clearly in simple words.
- visualExplanation: 3-5 sentences with one fun analogy.
- realWorldExamples: give exactly 5 short examples.
- keyWords: 3-4 key words.

📄 MEDIUM DOCUMENT (6-15 lines, a paragraph, a few concepts):
- summary: 8-15 sentences. Break down each concept one by one. Explain each idea separately.
- visualExplanation: 5-8 sentences with 2-3 fun analogies.
- realWorldExamples: give exactly 5 examples with brief explanations.
- keyWords: 4-5 key words.

📄 LARGE DOCUMENT (full page, multiple paragraphs, multiple problems/topics):
- summary: 20-35 sentences. This is a FULL explanation. Cover EVERY topic, EVERY concept, EVERY problem mentioned in the image. Go paragraph by paragraph. If there are multiple problems (like Problem-18, Problem-19, etc.), explain EACH one separately with its own heading.
- visualExplanation: 8-12 sentences with fun stories, multiple analogies, step-by-step comparisons.
- realWorldExamples: give exactly 5 detailed examples connecting each topic to real life.
- keyWords: 5-7 key words.

FORMATTING RULES FOR SUMMARY — USE PARAGRAPHS + KEY POINTS:
The summary must be structured like a mini lesson. Follow this format:

1. START with an intro paragraph (2-3 sentences) — What is this page about? Give the big picture.

2. Then for EACH topic/concept/problem in the image, write:
   - A paragraph explaining it in simple words (WHAT it means, HOW it works, WHY it matters)
   - Followed by "Key Points:" with bullet points (•) listing the most important takeaways

3. END with a closing paragraph that summarizes everything in 2-3 simple sentences.

FORMAT EXAMPLE:
"This page talks about how stacks work in computer science. A stack is a special way to store data where the last thing you put in is the first thing you take out — like a stack of plates!\n\nHow a Stack Works:\nImagine you are stacking books on a table. You can only add a new book on the TOP, and you can only pick up the book that is on the TOP. You cannot pull a book from the middle or bottom.\n\nKey Points:\n• Push — means putting a new item on top of the stack\n• Pop — means removing the item from the top of the stack\n• The time it takes to push or pop is O(1), which means it happens instantly no matter how big the stack is\n• If you try to pop from an empty stack, it gives an error called 'underflow'\n\nProblem 18 — Stack Permutation:\nThis problem asks whether numbers 1 to 6 can come out in a specific order using push and pop. The answer is that 325641 is possible but 154623 is not, because the number 2 gets stuck behind 3 and cannot come out before 3.\n\nKey Points:\n• You push numbers in order: 1, 2, 3, 4, 5, 6\n• You can only pop the top number\n• Some output orders are impossible because of the LIFO rule\n\nIn simple words, a stack follows one rule: last in, first out. This rule makes some arrangements possible and some impossible!"

USE \n\n between paragraphs and \n before each bullet point.

GENERAL RULES FOR ALL TEXT:
- READ THE IMAGE CAREFULLY. Your explanation must match what is actually in the image — do not invent or assume content.
- Use simple words. Explain like talking to a 10-year-old. No jargon.
- For technical/science topics: first explain WHAT it is, then HOW it works, then WHY it matters.
- For definitions: give the meaning, then 2-3 easy examples.
- For programming/data structure topics: explain with a real-life analogy (e.g., "a stack is like a pile of plates — you can only take from the top").
- If image has MULTIPLE problems or topics, explain EACH ONE in the summary with its own heading and key points — do NOT skip any.
- Your explanation must be PROPORTIONAL to the content. Big document = big detailed explanation. Small document = short explanation. NEVER give a 5-line explanation for a full page of text.
- EVERY section of the image must be covered. If there are 4 problems on the page, all 4 must be explained.

STEP 2B: IF type is "math" OR "aptitude", respond with:
{
  "type": "math" or "aptitude",
  "extractedText": "the exact problem as written in the image",
  "summary": "a simple 1-2 sentence description of what this problem is asking",
  "solutionSteps": [
    {
      "step": 1,
      "title": "short title for this step",
      "explanation": "clear, easy-to-follow explanation of what we are doing and why",
      "expression": "the mathematical expression or logical working for this step (use plain text, not LaTeX)"
    }
  ],
  "finalAnswer": "the final answer, clearly stated",
  "visualExplanation": "a fun real-world analogy that helps visualize this problem (3-4 sentences)",
  "keyWords": ["word1", "word2", "word3"]
}

RULES FOR MATH/APTITUDE SOLUTIONS:
- YOU MUST ALWAYS SOLVE THE PROBLEM COMPLETELY. Never say "requires numerical methods", "use a calculator", "use graphing", or "this is too complex". YOU are the calculator. YOU must compute the actual numerical answer.
- ACCURACY IS THE #1 PRIORITY. Double-check every calculation before responding. Verify your final answer by working backwards.
- Break the solution into 3-7 clear steps (more for complex problems, fewer for simple ones)
- Each step must have a title, explanation, and expression
- The expression field must show the EXACT arithmetic/working — do NOT skip intermediate calculations. Show every single operation: 2x + 5 = 15 → 2x = 15 - 5 → 2x = 10 → x = 10/2 → x = 5
- Carry forward values precisely from one step to the next. Never approximate unless the problem asks for it.
- The explanation should use simple, clear language anyone can understand
- Use everyday comparisons and relatable examples
- For aptitude: show the logical reasoning pattern, elimination, or deduction in the expression field
- Always include units where applicable
- The finalAnswer MUST contain the actual computed answer (a number, value, or concrete result). Example: "x = 5" or "The answer is 42 cm²". NEVER give a vague answer like "requires further calculation" or "use numerical methods".
- BEFORE writing the finalAnswer, mentally re-verify: plug the answer back into the original problem to confirm it is correct
- For equations: solve for the variable and give the exact value (e.g., x = 3, y = -2)
- For quadratic/cubic equations: use the quadratic formula or factoring and give ALL roots
- For word problems: compute the final numerical answer with units
- For geometry: calculate the exact measurement (area, perimeter, angle, etc.)

Keep language simple. Imagine you are talking to a young student. Use words they would understand.

IMPORTANT: Always respond in valid JSON format exactly matching the structure above. NEVER leave a problem unsolved.`;

app.post('/api/analyze', async (req, res) => {
  try {
    const { base64Image, userId } = req.body;

    if (!base64Image) {
      return res.status(400).json({ success: false, error: 'No image provided' });
    }

    // Track daily scan count
    if (userId) {
      await pool.query(
        `UPDATE stats SET
          today_scans = IF(last_scan_date = CURDATE(), today_scans + 1, 1),
          last_scan_date = CURDATE(),
          total_scans = total_scans + 1
        WHERE user_id = ?`,
        [userId]
      );
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                  detail: 'high',
                },
              },
              {
                type: 'text',
                text: 'Read every word in this image very carefully. If it contains a math or aptitude problem, solve it step by step with the correct answer. If it is text content, explain EVERYTHING on the page in detail with paragraphs and key points — do not skip any section. Make it easy to understand.',
              },
            ],
          },
        ],
        max_tokens: 3500,
        temperature: 0,
        seed: 42,
      }),
    });

    const data = await response.json();

    if (data.error) {
      console.error('OpenAI API error:', data.error);
      return res.status(500).json({ success: false, error: data.error.message || 'OpenAI API error' });
    }

    const content = data.choices[0].message.content;
    const jsonStr = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const result = JSON.parse(jsonStr);

    res.json({ success: true, result });
  } catch (error) {
    console.error('Analyze error:', error);
    res.status(500).json({ success: false, error: error.message || 'Could not analyze image' });
  }
});

// ============================================================
// SIMPLIFY ROUTE — Make explanation even easier
// ============================================================

const SIMPLIFY_PROMPT = `You are EasyTutor, a friendly AI teacher. The user already received an explanation but wants an EVEN SIMPLER version.

Take the provided content and rewrite it to be much easier to understand. Use:
- Very short sentences (5-8 words each)
- Simple, everyday words
- Fun comparisons to toys, cartoons, food, animals, family
- Simple everyday examples

If solution steps are provided (for a math problem), simplify each step's explanation while keeping the mathematical expressions accurate. Do NOT change the math — only simplify the words.

IMPORTANT: Keep the explanation DETAILED and LONG — but use simpler words. Do NOT make it shorter, make it EASIER.
IMPORTANT: Always return exactly 5 real-world examples in the realWorldExamples array.
If the original explanation covered many topics, your simplified version must also cover ALL of them.

Always respond in valid JSON format exactly like this:
{
  "summary": "a long, detailed but super easy explanation — same length as the original or longer, just simpler words",
  "visualExplanation": "a fun 8-12 sentence explanation using relatable real-world examples",
  "realWorldExamples": ["very simple example 1", "very simple example 2", "very simple example 3", "example 4", "example 5"],
  "solutionSteps": [{"step": 1, "title": "short title", "explanation": "super simple explanation", "expression": "same math expression"}]
}

If there are no solutionSteps in the input, omit the solutionSteps field entirely.
Make it as easy and fun as possible!`;

app.post('/api/simplify', async (req, res) => {
  try {
    const { summary, visualExplanation, realWorldExamples, extractedText, solutionSteps } = req.body;

    if (!summary) {
      return res.status(400).json({ success: false, error: 'No content to simplify' });
    }

    const userMessage = `Here is the current explanation that needs to be made MUCH EASIER:

Summary: ${summary}
${visualExplanation ? `Visual Explanation: ${visualExplanation}` : ''}
${realWorldExamples ? `Examples: ${realWorldExamples.join(', ')}` : ''}
${extractedText ? `Original Text: ${extractedText}` : ''}
${solutionSteps ? `Solution Steps: ${JSON.stringify(solutionSteps)}` : ''}

Please rewrite this in the simplest possible way so anyone can understand.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: SIMPLIFY_PROMPT },
          { role: 'user', content: userMessage },
        ],
        max_tokens: 3000,
        temperature: 0,
        seed: 42,
      }),
    });

    const data = await response.json();

    if (data.error) {
      console.error('OpenAI simplify error:', data.error);
      return res.status(500).json({ success: false, error: data.error.message || 'OpenAI API error' });
    }

    const content = data.choices[0].message.content;
    const jsonStr = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const result = JSON.parse(jsonStr);

    res.json({ success: true, result });
  } catch (error) {
    console.error('Simplify error:', error);
    res.status(500).json({ success: false, error: error.message || 'Could not simplify' });
  }
});

// ============================================================
// ADMIN PANEL ROUTES
// ============================================================

// Admin credentials
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD_HASH = bcrypt.hashSync('easytutor@admin', 10);

// In-memory token store: Map<token, expiryTimestamp>
const adminTokens = new Map();
const ADMIN_TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

// Admin auth middleware
function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
  const token = authHeader.slice(7);
  const expiry = adminTokens.get(token);
  if (!expiry || Date.now() > expiry) {
    adminTokens.delete(token);
    return res.status(401).json({ success: false, error: 'Token expired or invalid' });
  }
  next();
}

// Admin login
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (username !== ADMIN_USERNAME) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    const match = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
    if (!match) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    const token = crypto.randomBytes(32).toString('hex');
    adminTokens.set(token, Date.now() + ADMIN_TOKEN_EXPIRY_MS);
    res.json({ success: true, token });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ success: false, error: 'Login failed' });
  }
});

// Admin logout
app.post('/api/admin/logout', requireAdmin, (req, res) => {
  const token = req.headers.authorization.slice(7);
  adminTokens.delete(token);
  res.json({ success: true });
});

// Admin dashboard stats
app.get('/api/admin/dashboard', requireAdmin, async (req, res) => {
  try {
    const [userCount] = await pool.query('SELECT COUNT(*) as total FROM users');
    const [scanSum] = await pool.query('SELECT COALESCE(SUM(total_scans), 0) as total FROM stats');
    const [historyCount] = await pool.query('SELECT COUNT(*) as total FROM history');
    const [newUsersWeek] = await pool.query(
      'SELECT COUNT(*) as total FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)'
    );
    const [recentActivity] = await pool.query(
      `SELECT h.id, h.extracted_text, h.summary, h.created_at, u.name as user_name, u.email
       FROM history h JOIN users u ON h.user_id = u.id
       ORDER BY h.created_at DESC LIMIT 10`
    );
    res.json({
      success: true,
      data: {
        totalUsers: userCount[0].total,
        totalScans: scanSum[0].total,
        totalSaved: historyCount[0].total,
        newUsersThisWeek: newUsersWeek[0].total,
        recentActivity,
      },
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ success: false, error: 'Could not load dashboard' });
  }
});

// Admin: list users (paginated + search)
app.get('/api/admin/users', requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const offset = (page - 1) * limit;

    let where = '';
    let params = [];
    if (search) {
      where = 'WHERE u.name LIKE ? OR u.email LIKE ? OR u.child_name LIKE ?';
      const s = `%${search}%`;
      params = [s, s, s];
    }

    const [countRows] = await pool.query(`SELECT COUNT(*) as total FROM users u ${where}`, params);
    const [rows] = await pool.query(
      `SELECT u.id, u.name, u.email, u.child_name, u.child_age, u.avatar, u.created_at,
              COALESCE(s.total_scans, 0) as total_scans,
              (SELECT COUNT(*) FROM history WHERE user_id = u.id) as total_saved
       FROM users u LEFT JOIN stats s ON u.id = s.user_id ${where}
       ORDER BY u.created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.json({
      success: true,
      data: rows,
      pagination: { page, limit, total: countRows[0].total, pages: Math.ceil(countRows[0].total / limit) },
    });
  } catch (error) {
    console.error('Admin users error:', error);
    res.status(500).json({ success: false, error: 'Could not load users' });
  }
});

// Admin: single user detail
app.get('/api/admin/users/:id', requireAdmin, async (req, res) => {
  try {
    const [users] = await pool.query(
      `SELECT u.*, COALESCE(s.total_scans, 0) as total_scans,
              (SELECT COUNT(*) FROM history WHERE user_id = u.id) as total_saved
       FROM users u LEFT JOIN stats s ON u.id = s.user_id WHERE u.id = ?`,
      [req.params.id]
    );
    if (users.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    const user = users[0];
    delete user.password;
    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Admin user detail error:', error);
    res.status(500).json({ success: false, error: 'Could not load user' });
  }
});

// Admin: delete user (cascade)
app.delete('/api/admin/users/:id', requireAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    await pool.query('DELETE FROM history WHERE user_id = ?', [userId]);
    await pool.query('DELETE FROM stats WHERE user_id = ?', [userId]);
    await pool.query('DELETE FROM users WHERE id = ?', [userId]);
    res.json({ success: true });
  } catch (error) {
    console.error('Admin delete user error:', error);
    res.status(500).json({ success: false, error: 'Could not delete user' });
  }
});

// Admin: list history (paginated + search)
app.get('/api/admin/history', requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const offset = (page - 1) * limit;

    let where = '';
    let params = [];
    if (search) {
      where = 'WHERE h.extracted_text LIKE ? OR h.summary LIKE ? OR u.name LIKE ?';
      const s = `%${search}%`;
      params = [s, s, s];
    }

    const [countRows] = await pool.query(
      `SELECT COUNT(*) as total FROM history h JOIN users u ON h.user_id = u.id ${where}`, params
    );
    const [rows] = await pool.query(
      `SELECT h.id, h.user_id, h.extracted_text, h.summary, h.visual_explanation,
              h.real_world_examples, h.key_words, h.created_at,
              u.name as user_name, u.email as user_email
       FROM history h JOIN users u ON h.user_id = u.id ${where}
       ORDER BY h.created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.json({
      success: true,
      data: rows,
      pagination: { page, limit, total: countRows[0].total, pages: Math.ceil(countRows[0].total / limit) },
    });
  } catch (error) {
    console.error('Admin history error:', error);
    res.status(500).json({ success: false, error: 'Could not load history' });
  }
});

// Admin: delete history item
app.delete('/api/admin/history/:id', requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM history WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Admin delete history error:', error);
    res.status(500).json({ success: false, error: 'Could not delete history item' });
  }
});

// Root route
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'EasyTutor API is running', version: '1.0.0' });
});

// ============================================================
// START SERVER
// ============================================================
const PORT = 5000;
// Auto-migrate: add daily scan tracking columns
async function migrate() {
  try {
    const [cols] = await pool.query("SHOW COLUMNS FROM stats LIKE 'today_scans'");
    if (cols.length === 0) {
      await pool.query("ALTER TABLE stats ADD COLUMN today_scans INT DEFAULT 0");
      await pool.query("ALTER TABLE stats ADD COLUMN last_scan_date DATE DEFAULT NULL");
      console.log('Migration: added today_scans and last_scan_date columns');
    }
  } catch (err) {
    console.error('Migration error:', err.message);
  }

  // Migration: add math/aptitude columns to history
  try {
    const [typeCols] = await pool.query("SHOW COLUMNS FROM history LIKE 'content_type'");
    if (typeCols.length === 0) {
      await pool.query("ALTER TABLE history ADD COLUMN content_type VARCHAR(20) DEFAULT 'text'");
      await pool.query("ALTER TABLE history ADD COLUMN solution_steps JSON DEFAULT NULL");
      await pool.query("ALTER TABLE history ADD COLUMN final_answer TEXT DEFAULT NULL");
      console.log('Migration: added content_type, solution_steps, final_answer columns');
    }
  } catch (err) {
    console.error('Migration (math columns) error:', err.message);
  }
}

migrate().then(() => {
  app.listen(PORT, () => {
    console.log(`EasyTutor API server running on http://localhost:${PORT}`);
  });
});
