import { describe, it, expect, beforeEach } from 'vitest';
import app from '../index';
import { createTestEnv, MockD1Database, createTestUser, createTestSession } from './test-utils';
import { SignJWT } from 'jose';

describe('Auth Routes', () => {
  let env: ReturnType<typeof createTestEnv>;
  let mockDB: MockD1Database;

  beforeEach(() => {
    env = createTestEnv();
    mockDB = env.DB as unknown as MockD1Database;
    mockDB.clear();
  });

  describe('POST /api/auth/login', () => {
    it('should create user and session for new email', async () => {
      const req = new Request('http://localhost:8787/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'newuser@example.com' })
      });

      const res = await app.fetch(req, env);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.loginUrl).toContain('/api/auth/verify?token=');
      expect(json.sessionId).toBeDefined();
    });

    it('should reuse existing user', async () => {
      // Create existing user
      createTestUser(mockDB, { email: 'existing@example.com' });

      const req = new Request('http://localhost:8787/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'existing@example.com' })
      });

      const res = await app.fetch(req, env);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
    });

    it('should reject invalid email', async () => {
      const req = new Request('http://localhost:8787/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'invalid-email' })
      });

      const res = await app.fetch(req, env);
      expect(res.status).toBe(400);

      const json = await res.json();
      expect(json.error).toContain('Email');
    });

    it('should reject missing email', async () => {
      const req = new Request('http://localhost:8787/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      const res = await app.fetch(req, env);
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/auth/verify', () => {
    it('should verify valid token and set cookie', async () => {
      // Create user and session
      const user = createTestUser(mockDB, { email: 'test@example.com' });
      const session = createTestSession(mockDB, user.id);

      // Create valid JWT
      const token = await new SignJWT({ sessionId: session.id, email: user.email })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('1h')
        .sign(new TextEncoder().encode(env.JWT_SECRET));

      const req = new Request(`http://localhost:8787/api/auth/verify?token=${token}`);
      const res = await app.fetch(req, env);

      expect(res.status).toBe(302);
      expect(res.headers.get('Location')).toBe('/app');
      
      const setCookie = res.headers.get('Set-Cookie');
      expect(setCookie).toContain('session=');
      expect(setCookie).toContain('HttpOnly');
    });

    it('should reject missing token', async () => {
      const req = new Request('http://localhost:8787/api/auth/verify');
      const res = await app.fetch(req, env);

      expect(res.status).toBe(400);
    });

    it('should reject invalid token', async () => {
      const req = new Request('http://localhost:8787/api/auth/verify?token=invalid-token');
      const res = await app.fetch(req, env);

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return user info with valid session cookie', async () => {
      const user = createTestUser(mockDB, { 
        email: 'test@example.com',
        name: 'Test User',
        subscription_status: 'active'
      });
      const session = createTestSession(mockDB, user.id);

      const req = new Request('http://localhost:8787/api/auth/me', {
        headers: { 'Cookie': `session=${session.id}` }
      });

      const res = await app.fetch(req, env);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.user).toBeDefined();
      expect(json.user.email).toBe('test@example.com');
      expect(json.user.name).toBe('Test User');
      expect(json.user.subscription_status).toBe('active');
    });

    it('should return 401 without session', async () => {
      const req = new Request('http://localhost:8787/api/auth/me');
      const res = await app.fetch(req, env);

      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.user).toBeNull();
    });

    it('should return 401 with invalid session', async () => {
      const req = new Request('http://localhost:8787/api/auth/me', {
        headers: { 'Cookie': 'session=invalid-session-id' }
      });

      const res = await app.fetch(req, env);
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should clear session cookie', async () => {
      const user = createTestUser(mockDB);
      const session = createTestSession(mockDB, user.id);

      const req = new Request('http://localhost:8787/api/auth/logout', {
        method: 'POST',
        headers: { 'Cookie': `session=${session.id}` }
      });

      const res = await app.fetch(req, env);
      
      expect(res.status).toBe(302);
      expect(res.headers.get('Location')).toBe('/');
      
      const setCookie = res.headers.get('Set-Cookie');
      expect(setCookie).toContain('session=');
      expect(setCookie).toContain('Max-Age=0');
    });

    it('should handle logout without session', async () => {
      const req = new Request('http://localhost:8787/api/auth/logout', {
        method: 'POST'
      });

      const res = await app.fetch(req, env);
      expect(res.status).toBe(302);
    });
  });
});
