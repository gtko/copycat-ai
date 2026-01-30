import { describe, it, expect } from 'vitest';
import app from '../index';
import { createTestEnv } from './test-utils';

describe('Health Endpoint', () => {
  const env = createTestEnv();

  it('should return ok status', async () => {
    const req = new Request('http://localhost:8787/health');
    const res = await app.fetch(req, env);
    
    expect(res.status).toBe(200);
    
    const json = await res.json();
    expect(json.status).toBe('ok');
    expect(json.timestamp).toBeDefined();
    expect(new Date(json.timestamp)).toBeInstanceOf(Date);
  });

  it('should return JSON content type', async () => {
    const req = new Request('http://localhost:8787/health');
    const res = await app.fetch(req, env);
    
    expect(res.headers.get('content-type')).toContain('application/json');
  });
});

describe('Static Pages', () => {
  const env = createTestEnv();

  it('should serve landing page', async () => {
    const req = new Request('http://localhost:8787/');
    const res = await app.fetch(req, env);
    
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/html');
    
    const text = await res.text();
    expect(text).toContain('Copycat');
  });

  it('should serve checkout page', async () => {
    const req = new Request('http://localhost:8787/checkout');
    const res = await app.fetch(req, env);
    
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain('checkout');
  });

  it('should serve success page', async () => {
    const req = new Request('http://localhost:8787/success');
    const res = await app.fetch(req, env);
    
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain('Paiement');
  });

  it('should serve cancel page', async () => {
    const req = new Request('http://localhost:8787/cancel');
    const res = await app.fetch(req, env);
    
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain('annulé');
  });
});
