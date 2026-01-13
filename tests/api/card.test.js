import { describe, it, expect, vi } from 'vitest';
import handler from '../../api/card.js';

// Mock request/response
function createMockReq(query = {}) {
  return {
    query,
    headers: { host: 'example.vercel.app' },
    url: '/api/card?' + new URLSearchParams(query).toString(),
  };
}

function createMockRes() {
  const res = {
    statusCode: null,
    headers: {},
    body: null,
    setHeader(key, value) {
      this.headers[key] = value;
      return this;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    send(body) {
      this.body = body;
      return this;
    },
  };
  return res;
}

describe('card handler', () => {
  it('returns HTML with OGP meta tags', () => {
    const req = createMockReq({ username: 'testuser' });
    const res = createMockRes();

    handler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.headers['Content-Type']).toBe('text/html; charset=utf-8');
    expect(res.body).toContain('<!DOCTYPE html>');
    expect(res.body).toContain('<meta property="og:image"');
    expect(res.body).toContain('<meta name="twitter:card" content="summary_large_image"');
  });

  it('includes username in title', () => {
    const req = createMockReq({ username: 'myuser' });
    const res = createMockRes();

    handler(req, res);

    expect(res.body).toContain('OSS Contributions - myuser');
  });

  it('generates correct image URL with format=png', () => {
    const req = createMockReq({ username: 'testuser', months: '3' });
    const res = createMockRes();

    handler(req, res);

    expect(res.body).toContain('format=png');
    expect(res.body).toContain('username=testuser');
    expect(res.body).toContain('months=3');
  });

  it('includes orgs in image URL when provided', () => {
    const req = createMockReq({ username: 'testuser', orgs: 'rails:CC0000:Rails' });
    const res = createMockRes();

    handler(req, res);

    expect(res.body).toContain('orgs=rails');
  });

  it('includes demo param when set', () => {
    const req = createMockReq({ demo: 'true' });
    const res = createMockRes();

    handler(req, res);

    expect(res.body).toContain('demo=true');
  });

  it('uses default username when not provided', () => {
    const req = createMockReq({});
    const res = createMockRes();

    handler(req, res);

    expect(res.body).toContain('OSS Contributions - yujiteshima');
  });

  it('includes organization labels in description', () => {
    const req = createMockReq({ orgs: 'rails:CC0000:Rails,hotwired:1a1a1a:Hotwire' });
    const res = createMockRes();

    handler(req, res);

    expect(res.body).toContain('Rails');
    expect(res.body).toContain('Hotwire');
  });
});
