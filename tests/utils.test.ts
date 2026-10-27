import { describe, it, expect } from 'vitest';
import { getDomainFromUrl, getGreeting } from '../src/lib/utils';

describe('Utility functions', () => {
  it('extracts domain names from URLs correctly', () => {
    expect(getDomainFromUrl('https://www.google.com/search?q=dayflow')).toBe('google.com');
    expect(getDomainFromUrl('https://github.com/features')).toBe('github.com');
    expect(getDomainFromUrl('http://news.ycombinator.com')).toBe('news.ycombinator.com');
  });

  it('provides appropriate Polish greetings', () => {
    const greeting = getGreeting();
    expect([
      'Dzień dobry',
      'Dobre popołudnie',
      'Dobry wieczór',
      'Dobrej nocy',
    ]).toContain(greeting);
  });
});
