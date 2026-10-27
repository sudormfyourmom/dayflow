import { describe, it, expect } from 'vitest';
import { BrowserSecurity } from '../electron/browser/BrowserSecurity';

describe('BrowserSecurity', () => {
  it('validates allowed web protocols', () => {
    expect(BrowserSecurity.isValidWebUrl('https://google.com')).toBe(true);
    expect(BrowserSecurity.isValidWebUrl('http://localhost:3000')).toBe(true);
    expect(BrowserSecurity.isValidWebUrl('about:blank')).toBe(true);
    expect(BrowserSecurity.isValidWebUrl('file:///C:/passwords.txt')).toBe(false);
    expect(BrowserSecurity.isValidWebUrl('javascript:alert(1)')).toBe(false);
    expect(BrowserSecurity.isValidWebUrl('data:text/html,hack')).toBe(false);
  });

  it('normalizes search queries into configured search engine URLs', () => {
    const searchUrl = BrowserSecurity.normalizeUrlOrSearch('jak zrobic tort');
    expect(searchUrl).toBe('https://www.google.com/search?q=jak%20zrobic%20tort');
  });

  it('recognizes domains without protocol and prepends https://', () => {
    const url1 = BrowserSecurity.normalizeUrlOrSearch('github.com');
    expect(url1).toBe('https://github.com');

    const url2 = BrowserSecurity.normalizeUrlOrSearch('news.ycombinator.com/news');
    expect(url2).toBe('https://news.ycombinator.com/news');

    const localhost = BrowserSecurity.normalizeUrlOrSearch('localhost:5173');
    expect(localhost).toBe('https://localhost:5173');
  });

  it('blocks navigation with forbidden protocols', () => {
    expect(BrowserSecurity.handleExternalNavigation('https://supabase.com')).toBe(true);
    expect(BrowserSecurity.handleExternalNavigation('file:///etc/passwd')).toBe(false);
    expect(BrowserSecurity.handleExternalNavigation('smb://192.168.1.1/share')).toBe(false);
  });
});
