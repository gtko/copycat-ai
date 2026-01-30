import { describe, it, expect, beforeEach, vi } from 'vitest';
import app from '../index';
import { createTestEnv, MockD1Database, createTestUser, createTestSession } from './test-utils';

describe('API Routes - Business Plans', () => {
  let env: ReturnType<typeof createTestEnv>;
  let mockDB: MockD1Database;

  beforeEach(() => {
    env = createTestEnv();
    mockDB = env.DB as unknown as MockD1Database;
    mockDB.clear();
  });

  describe('POST /api/generate', () => {
    it('should require authentication', async () => {
      const req = new Request('http://localhost:8787/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessName: 'Test' })
      });

      const res = await app.fetch(req, env);
      expect(res.status).toBe(401);
    });

    it('should reject missing required fields', async () => {
      const user = createTestUser(mockDB, { subscription_status: 'active' });
      const session = createTestSession(mockDB, user.id);

      const req = new Request('http://localhost:8787/api/generate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cookie': `session=${session.id}`
        },
        body: JSON.stringify({ businessName: 'Test' }) // Missing industry, description
      });

      const res = await app.fetch(req, env);
      expect(res.status).toBe(400);
      
      const json = await res.json();
      expect(json.error).toContain('Champs requis');
    });

    it('should generate plan with valid data (mock AI)', async () => {
      const user = createTestUser(mockDB, { subscription_status: 'active' });
      const session = createTestSession(mockDB, user.id);

      // Mock the AI API call
      global.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve({
          choices: [{
            message: {
              content: JSON.stringify({
                executiveSummary: 'Test summary',
                companyDescription: 'Test company'
              })
            }
          }]
        })
      } as any);

      const req = new Request('http://localhost:8787/api/generate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cookie': `session=${session.id}`
        },
        body: JSON.stringify({
          businessName: 'Test Business',
          industry: 'Technology',
          description: 'A test business',
          goals: 'Grow fast',
          targetMarket: 'Developers'
        })
      });

      const res = await app.fetch(req, env);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.planId).toBeDefined();
      expect(json.content).toBeDefined();
    });

    it('should reject if subscription expired', async () => {
      const user = createTestUser(mockDB, { 
        subscription_status: 'canceled',
        trial_end_date: new Date(Date.now() - 1000).toISOString() // Expired
      });
      const session = createTestSession(mockDB, user.id);

      const req = new Request('http://localhost:8787/api/generate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cookie': `session=${session.id}`
        },
        body: JSON.stringify({
          businessName: 'Test Business',
          industry: 'Technology',
          description: 'A test business'
        })
      });

      const res = await app.fetch(req, env);
      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/plans', () => {
    it('should require authentication', async () => {
      const req = new Request('http://localhost:8787/api/plans');
      const res = await app.fetch(req, env);
      expect(res.status).toBe(401);
    });

    it('should return empty list for new user', async () => {
      const user = createTestUser(mockDB, { subscription_status: 'active' });
      const session = createTestSession(mockDB, user.id);

      const req = new Request('http://localhost:8787/api/plans', {
        headers: { 'Cookie': `session=${session.id}` }
      });

      const res = await app.fetch(req, env);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.plans).toEqual([]);
    });

    it('should return user plans', async () => {
      const user = createTestUser(mockDB, { subscription_status: 'active' });
      const session = createTestSession(mockDB, user.id);

      // Create some plans
      mockDB.insert('business_plans', {
        user_id: user.id,
        title: 'Plan 1',
        business_name: 'Business 1',
        industry: 'Tech',
        created_at: new Date().toISOString()
      });
      mockDB.insert('business_plans', {
        user_id: user.id,
        title: 'Plan 2',
        business_name: 'Business 2',
        industry: 'SaaS',
        created_at: new Date().toISOString()
      });

      const req = new Request('http://localhost:8787/api/plans', {
        headers: { 'Cookie': `session=${session.id}` }
      });

      const res = await app.fetch(req, env);
      const json = await res.json();

      expect(json.plans).toHaveLength(2);
      expect(json.plans[0].business_name).toBeDefined();
    });
  });

  describe('GET /api/plans/:id', () => {
    it('should return plan by id', async () => {
      const user = createTestUser(mockDB, { subscription_status: 'active' });
      const session = createTestSession(mockDB, user.id);

      const plan = mockDB.insert('business_plans', {
        user_id: user.id,
        title: 'My Plan',
        content: JSON.stringify({ summary: 'Test' }),
        business_name: 'My Business',
        industry: 'Tech',
        created_at: new Date().toISOString()
      });

      const req = new Request(`http://localhost:8787/api/plans/${plan.id}`, {
        headers: { 'Cookie': `session=${session.id}` }
      });

      const res = await app.fetch(req, env);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.plan.title).toBe('My Plan');
      expect(json.plan.content).toBeDefined();
    });

    it('should return 404 for non-existent plan', async () => {
      const user = createTestUser(mockDB, { subscription_status: 'active' });
      const session = createTestSession(mockDB, user.id);

      const req = new Request('http://localhost:8787/api/plans/99999', {
        headers: { 'Cookie': `session=${session.id}` }
      });

      const res = await app.fetch(req, env);
      expect(res.status).toBe(404);
    });

    it('should not return other user plans', async () => {
      const user1 = createTestUser(mockDB, { email: 'user1@example.com', subscription_status: 'active' });
      const user2 = createTestUser(mockDB, { email: 'user2@example.com', subscription_status: 'active' });
      const session1 = createTestSession(mockDB, user1.id);

      const plan2 = mockDB.insert('business_plans', {
        user_id: user2.id,
        title: 'User2 Plan',
        content: JSON.stringify({}),
        business_name: 'User2 Business',
        industry: 'Tech',
        created_at: new Date().toISOString()
      });

      const req = new Request(`http://localhost:8787/api/plans/${plan2.id}`, {
        headers: { 'Cookie': `session=${session1.id}` }
      });

      const res = await app.fetch(req, env);
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/plans/:id', () => {
    it('should update plan content', async () => {
      const user = createTestUser(mockDB, { subscription_status: 'active' });
      const session = createTestSession(mockDB, user.id);

      const plan = mockDB.insert('business_plans', {
        user_id: user.id,
        title: 'Original',
        content: JSON.stringify({ old: 'data' }),
        business_name: 'Business',
        industry: 'Tech'
      });

      const req = new Request(`http://localhost:8787/api/plans/${plan.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Cookie': `session=${session.id}`
        },
        body: JSON.stringify({
          content: { updated: 'data', newField: 'value' }
        })
      });

      const res = await app.fetch(req, env);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
    });

    it('should reject update for non-existent plan', async () => {
      const user = createTestUser(mockDB, { subscription_status: 'active' });
      const session = createTestSession(mockDB, user.id);

      const req = new Request('http://localhost:8787/api/plans/99999', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Cookie': `session=${session.id}`
        },
        body: JSON.stringify({ content: {} })
      });

      const res = await app.fetch(req, env);
      expect(res.status).toBe(404);
    });
  });
});
