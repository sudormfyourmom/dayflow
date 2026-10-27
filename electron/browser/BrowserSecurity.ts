import { shell } from 'electron';

export class BrowserSecurity {
  private static readonly ALLOWED_PROTOCOLS = new Set(['http:', 'https:', 'about:']);

  public static isValidWebUrl(rawUrl: string): boolean {
    try {
      const parsed = new URL(rawUrl);
      return this.ALLOWED_PROTOCOLS.has(parsed.protocol);
    } catch {
      return false;
    }
  }

  public static normalizeUrlOrSearch(input: string, searchEngineUrl = 'https://www.google.com/search?q='): string {
    const trimmed = input.trim();
    if (!trimmed) return 'about:blank';

    // If starts with http:// or https://
    if (/^https?:\/\//i.test(trimmed)) {
      return trimmed;
    }

    // Check if it's a domain pattern like "github.com", "example.org/path", "localhost:3000"
    const domainPattern = /^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/.*)?$/;
    const localhostPattern = /^localhost(:\d+)?(\/.*)?$/;

    if (domainPattern.test(trimmed) || localhostPattern.test(trimmed)) {
      return `https://${trimmed}`;
    }

    // Otherwise, treat as search query
    return `${searchEngineUrl}${encodeURIComponent(trimmed)}`;
  }

  public static handleExternalNavigation(rawUrl: string): boolean {
    try {
      const parsed = new URL(rawUrl);
      if (!this.ALLOWED_PROTOCOLS.has(parsed.protocol)) {
        // Block dangerous schemes
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }

  public static openExternalUrl(url: string): void {
    if (this.isValidWebUrl(url)) {
      shell.openExternal(url);
    }
  }
}
