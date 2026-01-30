/**
 * Test utilities for Copycat AI
 * Provides mocks for D1Database and environment bindings
 */

import type { Env } from '../index';

// Mock D1Database
export class MockD1Database {
  private data: Map<string, any[]> = new Map();
  private idCounters: Map<string, number> = new Map();

  constructor() {
    // Initialize tables
    this.data.set('users', []);
    this.data.set('sessions', []);
    this.data.set('business_plans', []);
  }

  private getTable(name: string): any[] {
    if (!this.data.has(name)) {
      this.data.set(name, []);
    }
    return this.data.get(name)!;
  }

  private getNextId(table: string): number {
    const current = this.idCounters.get(table) || 0;
    const next = current + 1;
    this.idCounters.set(table, next);
    return next;
  }

  prepare(sql: string) {
    return new MockD1PreparedStatement(sql, this);
  }

  // Helper methods for tests
  insert(table: string, row: any): any {
    const tableData = this.getTable(table);
    const id = this.getNextId(table);
    const newRow = { ...row, id };
    tableData.push(newRow);
    return newRow;
  }

  find(table: string, predicate: (row: any) => boolean): any | null {
    const tableData = this.getTable(table);
    return tableData.find(predicate) || null;
  }

  findAll(table: string, predicate?: (row: any) => boolean): any[] {
    const tableData = this.getTable(table);
    return predicate ? tableData.filter(predicate) : [...tableData];
  }

  update(table: string, predicate: (row: any) => boolean, updates: any): boolean {
    const tableData = this.getTable(table);
    const index = tableData.findIndex(predicate);
    if (index !== -1) {
      tableData[index] = { ...tableData[index], ...updates };
      return true;
    }
    return false;
  }

  delete(table: string, predicate: (row: any) => boolean): boolean {
    const tableData = this.getTable(table);
    const index = tableData.findIndex(predicate);
    if (index !== -1) {
      tableData.splice(index, 1);
      return true;
    }
    return false;
  }

  clear() {
    this.data.clear();
    this.idCounters.clear();
    this.data.set('users', []);
    this.data.set('sessions', []);
    this.data.set('business_plans', []);
  }
}

class MockD1PreparedStatement {
  private sql: string;
  private db: MockD1Database;
  private params: any[] = [];

  constructor(sql: string, db: MockD1Database) {
    this.sql = sql;
    this.db = db;
  }

  bind(...params: any[]) {
    this.params = params;
    return this;
  }

  async first<T = any>(): Promise<T | null> {
    const result = await this.all();
    return (result.results?.[0] as T) || null;
  }

  async all<T = any>(): Promise<{ results: T[] }> {
    const sql = this.sql.toLowerCase();
    
    // Parse INSERT
    if (sql.includes('insert into users')) {
      const email = this.params[0];
      const row = this.db.insert('users', { email });
      return { results: [{ id: row.id }] as T[] };
    }
    
    if (sql.includes('insert into sessions')) {
      const [id, user_id, expires_at] = this.params;
      const row = this.db.insert('sessions', { id, user_id, expires_at });
      return { results: [row] as T[] };
    }

    if (sql.includes('insert into business_plans')) {
      const [user_id, title, content, business_name, industry] = this.params;
      const row = this.db.insert('business_plans', {
        user_id, title, content, business_name, industry,
        created_at: new Date().toISOString()
      });
      return { results: [{ id: row.id }] as T[] };
    }

    // Parse SELECT
    if (sql.includes('select * from users where email')) {
      const email = this.params[0];
      const row = this.db.find('users', u => u.email === email);
      return { results: row ? [row] : [] };
    }

    if (sql.includes('select * from users where id')) {
      const id = this.params[0];
      const row = this.db.find('users', u => u.id === id);
      return { results: row ? [row] : [] };
    }

    // SELECT for stripe portal - different join pattern
    if (sql.includes('select u.stripe_customer_id')) {
      const sessionId = this.params[0];
      const session = this.db.find('sessions', s => s.id === sessionId);
      if (session) {
        const user = this.db.find('users', u => u.id === session.user_id);
        if (user) {
          return { results: [{ stripe_customer_id: user.stripe_customer_id }] as T[] };
        }
      }
      return { results: [] };
    }

    if (sql.includes('select s.user_id, u.email')) {
      const sessionId = this.params[0];
      const session = this.db.find('sessions', s => s.id === sessionId);
      if (session) {
        const user = this.db.find('users', u => u.id === session.user_id);
        if (user) {
          return { results: [{ user_id: user.id, email: user.email }] as T[] };
        }
      }
      return { results: [] };
    }

    // SELECT for auth/me endpoint - handle both variations
    if (sql.includes('select u.id, u.email, u.name, u.subscription_status') || 
        sql.includes('select u.id, u.email, u.subscription_status')) {
      const sessionId = this.params[0];
      const session = this.db.find('sessions', s => s.id === sessionId);
      if (session) {
        const user = this.db.find('users', u => u.id === session.user_id);
        if (user) {
          // Check if expires_at is valid (mock always returns valid)
          const expiresAt = new Date(session.expires_at);
          if (expiresAt > new Date()) {
            return { results: [{
              id: user.id,
              email: user.email,
              name: user.name,
              subscription_status: user.subscription_status,
              trial_end_date: user.trial_end_date
            }] as T[] };
          }
        }
      }
      return { results: [] };
    }

    if (sql.includes('from business_plans where user_id')) {
      const userId = this.params[0];
      if (sql.includes('where id')) {
        const planId = this.params[1];
        const plan = this.db.find('business_plans', p => p.id === planId && p.user_id === userId);
        return { results: plan ? [plan] : [] };
      }
      const plans = this.db.findAll('business_plans', p => p.user_id === userId);
      return { results: plans as T[] };
    }

    // Parse UPDATE
    if (sql.includes('update users')) {
      const [value, id] = this.params;
      if (sql.includes('stripe_customer_id')) {
        this.db.update('users', u => u.id === id, { stripe_customer_id: value });
      } else if (sql.includes('subscription_status')) {
        const [status, subscription_id, trial_end, uid] = this.params;
        this.db.update('users', u => u.id === uid, { 
          subscription_status: status, 
          subscription_id,
          trial_end_date: trial_end
        });
      }
      return { results: [] };
    }

    if (sql.includes('update business_plans')) {
      const [content, id] = this.params;
      this.db.update('business_plans', p => p.id === id, { content });
      return { results: [] };
    }

    // Parse DELETE
    if (sql.includes('delete from sessions')) {
      const sessionId = this.params[0];
      this.db.delete('sessions', s => s.id === sessionId);
      return { results: [] };
    }

    return { results: [] };
  }

  async run(): Promise<{ success: boolean }> {
    await this.all();
    return { success: true };
  }
}

// Create test environment
export function createTestEnv(): Env['Bindings'] {
  const mockDB = new MockD1Database();
  
  return {
    DB: mockDB as any,
    STRIPE_SECRET_KEY: 'sk_test_mock',
    STRIPE_WEBHOOK_SECRET: 'whsec_mock',
    STRIPE_PUBLISHABLE_KEY: 'pk_test_mock',
    JWT_SECRET: 'test-secret-key-32-characters-long!!',
    KIMI_API_KEY: 'kimi_test_mock',
    POSTHOG_KEY: 'ph_test_mock',
    POSTHOG_HOST: 'https://test.posthog.com',
    BETTERSTACK_TOKEN: 'test_token',
    APP_URL: 'http://localhost:8787'
  };
}

// Test user helper
export function createTestUser(db: MockD1Database, overrides: any = {}) {
  return db.insert('users', {
    email: 'test@example.com',
    name: 'Test User',
    subscription_status: 'active',
    ...overrides
  });
}

// Test session helper
export function createTestSession(db: MockD1Database, userId: number, overrides: any = {}) {
  const sessionId = crypto.randomUUID ? crypto.randomUUID() : `session-${Date.now()}`;
  return db.insert('sessions', {
    id: sessionId,
    user_id: userId,
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    ...overrides
  });
}
