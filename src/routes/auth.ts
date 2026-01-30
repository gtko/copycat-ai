import { Hono } from 'hono';
import { SignJWT, jwtVerify } from 'jose';
import type { Env } from '../index';

const app = new Hono<Env>();

// Magic link login
app.post('/login', async (c) => {
  const { email } = await c.req.json();
  
  if (!email || !email.includes('@')) {
    return c.json({ error: 'Email invalide' }, 400);
  }
  
  // Get or create user
  let user = await c.env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).first();
  
  if (!user) {
    const result = await c.env.DB.prepare(
      'INSERT INTO users (email) VALUES (?) RETURNING id'
    ).bind(email).first();
    user = { id: result?.id, email };
  }
  
  // Create session
  const sessionId = crypto.randomUUID();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  
  await c.env.DB.prepare(
    'INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)'
  ).bind(sessionId, user.id, expiresAt.toISOString()).run();
  
  // Generate JWT for magic link
  const token = await new SignJWT({ sessionId, email })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('1h')
    .sign(new TextEncoder().encode(c.env.JWT_SECRET));
  
  // In production, send email here
  // For MVP, return the link directly
  const loginUrl = `${c.env.APP_URL}/api/auth/verify?token=${token}`;
  
  return c.json({ 
    success: true, 
    message: 'Lien de connexion généré',
    loginUrl, // Remove in production, send email instead
    sessionId // For immediate login during testing
  });
});

// Verify magic link
app.get('/verify', async (c) => {
  const token = c.req.query('token');
  
  if (!token) {
    return c.text('Token manquant', 400);
  }
  
  try {
    const verified = await jwtVerify(token, new TextEncoder().encode(c.env.JWT_SECRET));
    const { sessionId } = verified.payload as { sessionId: string };
    
    // Set cookie and redirect
    return new Response(null, {
      status: 302,
      headers: {
        'Location': '/app',
        'Set-Cookie': `session=${sessionId}; HttpOnly; Path=/; Max-Age=604800; SameSite=Lax`
      }
    });
  } catch (e) {
    return c.text('Lien invalide ou expiré', 400);
  }
});

// Logout
app.post('/logout', async (c) => {
  const sessionId = c.req.header('cookie')?.match(/session=([^;]+)/)?.[1];
  
  if (sessionId) {
    await c.env.DB.prepare('DELETE FROM sessions WHERE id = ?').bind(sessionId).run();
  }
  
  return new Response(null, {
    status: 302,
    headers: {
      'Location': '/',
      'Set-Cookie': `session=; HttpOnly; Path=/; Max-Age=0`
    }
  });
});

// Get current user
app.get('/me', async (c) => {
  const sessionId = c.req.header('cookie')?.match(/session=([^;]+)/)?.[1];
  
  if (!sessionId) {
    return c.json({ user: null }, 401);
  }
  
  const user = await c.env.DB.prepare(
    'SELECT u.id, u.email, u.name, u.subscription_status, u.trial_end_date FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.id = ? AND s.expires_at > datetime("now")'
  ).bind(sessionId).first();
  
  if (!user) {
    return c.json({ user: null }, 401);
  }
  
  return c.json({ user });
});

export const authRoutes = app;
