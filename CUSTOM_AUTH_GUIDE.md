# ✦Bible Aura - Custom Authentication Without Supabase

## 🎯 **Overview: Authentication Options**

You have several options to replace Supabase authentication while keeping your Spaceship Mail SMTP:

1. **🚀 Custom Express.js Backend** (Full Control)
2. **⚡ Vercel Serverless Functions** (No Server Needed)
3. **🔥 Firebase Auth** (Google's Solution)
4. **🛡️ Auth0** (Enterprise Solution)
5. **⭐ Clerk** (Developer-Friendly)

---

## 🚀 **Option 1: Custom Express.js Backend**

### **Step 1: Create Express Server**

```bash
# Create backend directory
mkdir bible-aura-backend
cd bible-aura-backend

# Initialize Node.js project
npm init -y

# Install dependencies
npm install express cors helmet bcryptjs jsonwebtoken nodemailer sqlite3 uuid dotenv express-rate-limit
npm install -D @types/node @types/express typescript ts-node nodemon
```

### **Step 2: Express Authentication Server**

Create `server.js`:

```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true
}));
app.use(express.json());

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: { error: 'Too many authentication attempts' }
});

// Database setup (SQLite for simplicity)
const db = new sqlite3.Database('./auth.db');

// Initialize database tables
db.serialize(() => {
  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT,
    email_verified BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME
  )`);

  // Magic link tokens table
  db.run(`CREATE TABLE IF NOT EXISTS magic_tokens (
    token TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    expires_at DATETIME NOT NULL,
    used BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Email verification tokens
  db.run(`CREATE TABLE IF NOT EXISTS verification_tokens (
    token TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    expires_at DATETIME NOT NULL,
    used BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);
});

// Email transporter (using your Spaceship Mail)
const emailTransporter = nodemailer.createTransporter({
  host: 'mail.spacemail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'contact@bibleaura.xyz',
    pass: 'RGaPY!QtEL$jW78'
  }
});

// Helper functions
const generateToken = () => uuidv4();
const generateJWT = (userId) => jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

// Send magic link email
async function sendMagicLink(email, token) {
  const magicLink = `${process.env.FRONTEND_URL}/auth/verify?token=${token}`;
  
  const mailOptions = {
    from: '"✦Bible Aura" <contact@bibleaura.xyz>',
    to: email,
    subject: '✦Bible Aura - Your Magic Sign-In Link',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #f85700; text-align: center;">✦Bible Aura</h2>
        <h3>Sign In to Your Account</h3>
        <p>Click the button below to securely sign in to Bible Aura:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${magicLink}" 
             style="background: #f85700; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Sign In to Bible Aura
          </a>
        </div>
        <p style="color: #666; font-size: 14px;">
          This link will expire in 15 minutes for security.<br>
          If you didn't request this, please ignore this email.
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #999; font-size: 12px; text-align: center;">
          ✦Bible Aura - AI-Powered Biblical Insights<br>
          https://bibleaura.xyz
        </p>
      </div>
    `
  };

  return emailTransporter.sendMail(mailOptions);
}

// Send email verification
async function sendEmailVerification(email, token) {
  const verificationLink = `${process.env.FRONTEND_URL}/auth/confirm?token=${token}`;
  
  const mailOptions = {
    from: '"✦Bible Aura" <contact@bibleaura.xyz>',
    to: email,
    subject: '✦Bible Aura - Confirm Your Email Address',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #f85700; text-align: center;">✦Bible Aura</h2>
        <h3>Welcome to Bible Aura!</h3>
        <p>Please confirm your email address to complete your registration:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationLink}" 
             style="background: #f85700; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Confirm Email Address
          </a>
        </div>
        <p style="color: #666; font-size: 14px;">
          This link will expire in 24 hours.<br>
          If you didn't create this account, please ignore this email.
        </p>
      </div>
    `
  };

  return emailTransporter.sendMail(mailOptions);
}

// AUTH ROUTES

// Magic Link Sign-In
app.post('/api/auth/magic-link', authLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email required' });
    }

    // Generate magic token
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store token
    db.run(
      'INSERT INTO magic_tokens (token, email, expires_at) VALUES (?, ?, ?)',
      [token, email, expiresAt.toISOString()],
      async function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Database error' });
        }

        try {
          await sendMagicLink(email, token);
          res.json({ message: 'Magic link sent to your email' });
        } catch (emailError) {
          console.error('Email error:', emailError);
          res.status(500).json({ error: 'Failed to send email' });
        }
      }
    );
  } catch (error) {
    console.error('Magic link error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify Magic Link
app.post('/api/auth/verify-magic', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token required' });
    }

    // Check token
    db.get(
      'SELECT * FROM magic_tokens WHERE token = ? AND used = 0 AND expires_at > datetime("now")',
      [token],
      async function(err, tokenData) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Database error' });
        }

        if (!tokenData) {
          return res.status(401).json({ error: 'Invalid or expired token' });
        }

        // Mark token as used
        db.run('UPDATE magic_tokens SET used = 1 WHERE token = ?', [token]);

        // Find or create user
        db.get(
          'SELECT * FROM users WHERE email = ?',
          [tokenData.email],
          function(err, user) {
            if (err) {
              console.error('Database error:', err);
              return res.status(500).json({ error: 'Database error' });
            }

            if (!user) {
              // Create new user
              const userId = uuidv4();
              db.run(
                'INSERT INTO users (id, email, email_verified, last_login) VALUES (?, ?, 1, datetime("now"))',
                [userId, tokenData.email],
                function(err) {
                  if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ error: 'Database error' });
                  }

                  const jwt_token = generateJWT(userId);
                  res.json({
                    token: jwt_token,
                    user: {
                      id: userId,
                      email: tokenData.email,
                      email_verified: true
                    }
                  });
                }
              );
            } else {
              // Update existing user
              db.run(
                'UPDATE users SET last_login = datetime("now"), email_verified = 1 WHERE id = ?',
                [user.id]
              );

              const jwt_token = generateJWT(user.id);
              res.json({
                token: jwt_token,
                user: {
                  id: user.id,
                  email: user.email,
                  email_verified: true
                }
              });
            }
          }
        );
      }
    );
  } catch (error) {
    console.error('Verify magic error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Email/Password Registration
app.post('/api/auth/register', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    // Check if user exists
    db.get('SELECT id FROM users WHERE email = ?', [email], async function(err, existingUser) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      if (existingUser) {
        return res.status(409).json({ error: 'User already exists' });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 12);
      const userId = uuidv4();
      const verificationToken = generateToken();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Create user
      db.run(
        'INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)',
        [userId, email, passwordHash],
        function(err) {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
          }

          // Create verification token
          db.run(
            'INSERT INTO verification_tokens (token, user_id, expires_at) VALUES (?, ?, ?)',
            [verificationToken, userId, expiresAt.toISOString()],
            async function(err) {
              if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Database error' });
              }

              try {
                await sendEmailVerification(email, verificationToken);
                res.json({ 
                  message: 'Registration successful. Please check your email to verify your account.',
                  userId: userId 
                });
              } catch (emailError) {
                console.error('Email error:', emailError);
                res.status(500).json({ error: 'Failed to send verification email' });
              }
            }
          );
        }
      );
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Email Verification
app.post('/api/auth/verify-email', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token required' });
    }

    db.get(
      'SELECT * FROM verification_tokens WHERE token = ? AND used = 0 AND expires_at > datetime("now")',
      [token],
      function(err, tokenData) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Database error' });
        }

        if (!tokenData) {
          return res.status(401).json({ error: 'Invalid or expired verification token' });
        }

        // Mark token as used and verify email
        db.run('UPDATE verification_tokens SET used = 1 WHERE token = ?', [token]);
        db.run('UPDATE users SET email_verified = 1 WHERE id = ?', [tokenData.user_id]);

        res.json({ message: 'Email verified successfully' });
      }
    );
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Email/Password Sign-In
app.post('/api/auth/signin', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    db.get('SELECT * FROM users WHERE email = ?', [email], async function(err, user) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      if (!user || !user.password_hash) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      if (!user.email_verified) {
        return res.status(403).json({ error: 'Please verify your email address' });
      }

      // Update last login
      db.run('UPDATE users SET last_login = datetime("now") WHERE id = ?', [user.id]);

      const jwt_token = generateJWT(user.id);
      res.json({
        token: jwt_token,
        user: {
          id: user.id,
          email: user.email,
          email_verified: user.email_verified
        }
      });
    });
  } catch (error) {
    console.error('Sign-in error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Middleware to verify JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
}

// Get current user
app.get('/api/auth/me', authenticateToken, (req, res) => {
  db.get('SELECT id, email, email_verified, created_at, last_login FROM users WHERE id = ?', 
    [req.user.userId], function(err, user) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`✦Bible Aura Auth Server running on port ${PORT}`);
});
```

### **Step 3: Environment Variables**

Create `.env` in backend directory:

```env
# JWT Secret (generate a strong random string)
JWT_SECRET=your_super_secure_jwt_secret_here_min_32_chars

# Frontend URL
FRONTEND_URL=http://localhost:8080

# Server Port
PORT=3001

# Email settings (already configured)
SMTP_HOST=mail.spacemail.com
SMTP_PORT=465
SMTP_USER=contact@bibleaura.xyz
SMTP_PASS=RGaPY!QtEL$jW78
```

### **Step 4: Package.json Scripts**

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "node test-smtp.js"
  }
}
```

---

## ⚡ **Option 2: Vercel Serverless Functions**

Create API routes in your existing project without a separate server:

### **Create API Directory Structure**

```
api/
├── auth/
│   ├── magic-link.js
│   ├── verify-magic.js
│   ├── register.js
│   ├── signin.js
│   └── verify-email.js
└── middleware/
    └── auth.js
```

### **Example: api/auth/magic-link.js**

```javascript
import nodemailer from 'nodemailer';
import { v4 as uuidv4 } from 'uuid';

// In-memory storage (use Redis or database in production)
const magicTokens = new Map();

const emailTransporter = nodemailer.createTransporter({
  host: 'mail.spacemail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'contact@bibleaura.xyz',
    pass: 'RGaPY!QtEL$jW78'
  }
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email required' });
  }

  try {
    const token = uuidv4();
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes

    // Store token (use database in production)
    magicTokens.set(token, { email, expiresAt });

    // Send magic link
    const magicLink = `${process.env.VERCEL_URL || 'http://localhost:8080'}/auth/verify?token=${token}`;
    
    await emailTransporter.sendMail({
      from: '"✦Bible Aura" <contact@bibleaura.xyz>',
      to: email,
      subject: '✦Bible Aura - Your Magic Sign-In Link',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #f85700;">✦Bible Aura</h2>
          <p>Click to sign in:</p>
          <a href="${magicLink}" style="background: #f85700; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px;">
            Sign In
          </a>
        </div>
      `
    });

    res.json({ message: 'Magic link sent!' });
  } catch (error) {
    console.error('Magic link error:', error);
    res.status(500).json({ error: 'Failed to send magic link' });
  }
}
```

---

## 🔥 **Option 3: Firebase Authentication**

### **Install Firebase**

```bash
npm install firebase
```

### **Firebase Config**

```javascript
// lib/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "bible-aura.firebaseapp.com",
  projectId: "bible-aura",
  // ... other config
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
```

### **Magic Link with Firebase**

```javascript
import { sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { auth } from './firebase';

// Send magic link
export async function sendMagicLink(email) {
  const actionCodeSettings = {
    url: `${window.location.origin}/auth/complete`,
    handleCodeInApp: true,
  };

  try {
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    localStorage.setItem('emailForSignIn', email);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Verify magic link
export async function verifyMagicLink() {
  if (isSignInWithEmailLink(auth, window.location.href)) {
    let email = localStorage.getItem('emailForSignIn');
    if (!email) {
      email = window.prompt('Please provide your email for confirmation');
    }

    try {
      const result = await signInWithEmailLink(auth, email, window.location.href);
      localStorage.removeItem('emailForSignIn');
      return { success: true, user: result.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  return { success: false, error: 'Invalid link' };
}
```

---

## 🛡️ **Option 4: Auth0**

### **Install Auth0**

```bash
npm install @auth0/auth0-react
```

### **Auth0 Setup**

```javascript
// main.tsx
import { Auth0Provider } from '@auth0/auth0-react';

ReactDOM.render(
  <Auth0Provider
    domain="your-auth0-domain.auth0.com"
    clientId="your-auth0-client-id"
    redirectUri={window.location.origin}
    audience="your-auth0-audience"
  >
    <App />
  </Auth0Provider>,
  document.getElementById('root')
);

// Auth component
import { useAuth0 } from '@auth0/auth0-react';

export function LoginButton() {
  const { loginWithRedirect, loginWithPopup } = useAuth0();

  // Magic link (passwordless)
  const sendMagicLink = () => {
    loginWithRedirect({
      connection: 'email',
      send: 'link'
    });
  };

  return <button onClick={sendMagicLink}>Send Magic Link</button>;
}
```

---

## ⭐ **Option 5: Clerk**

### **Install Clerk**

```bash
npm install @clerk/clerk-react
```

### **Clerk Setup**

```javascript
// main.tsx
import { ClerkProvider } from '@clerk/clerk-react';

const clerkPubKey = "pk_test_...";

ReactDOM.render(
  <ClerkProvider publishableKey={clerkPubKey}>
    <App />
  </ClerkProvider>,
  document.getElementById('root')
);

// Magic link component
import { useSignIn } from '@clerk/clerk-react';

export function MagicLinkSignIn() {
  const { signIn, setActive } = useSignIn();
  const [email, setEmail] = useState('');

  const sendMagicLink = async () => {
    try {
      const result = await signIn.create({
        identifier: email,
      });

      await signIn.prepareFirstFactor({
        strategy: 'email_link',
        emailAddressId: result.supportedFirstFactors[0].emailAddressId,
      });

      alert('Magic link sent to your email!');
    } catch (err) {
      console.error('Error:', err);
    }
  };

  return (
    <div>
      <input 
        type="email" 
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
      />
      <button onClick={sendMagicLink}>Send Magic Link</button>
    </div>
  );
}
```

---

## 📊 **Comparison Table**

| Solution | Setup Complexity | Cost | Customization | Your SMTP |
|----------|------------------|------|---------------|-----------|
| **Custom Express** | High | Free* | Full | ✅ Yes |
| **Vercel Functions** | Medium | Free tier | High | ✅ Yes |
| **Firebase Auth** | Low | Free tier | Medium | ❌ No |
| **Auth0** | Low | $23/month | Medium | ❌ No |
| **Clerk** | Low | $25/month | High | ❌ No |

*Requires hosting costs

---

## 🎯 **Recommendation**

For Bible Aura, I recommend **Option 2: Vercel Serverless Functions** because:

✅ **No separate server needed**  
✅ **Use your existing Spaceship Mail SMTP**  
✅ **Fits your current Vercel deployment**  
✅ **Completely free**  
✅ **Easy to maintain**  

Would you like me to implement the Vercel Serverless Functions approach for your app? 