export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function detectPlatform(url: string): 'onlyfans' | 'fanvue' | 'website' | 'unknown' {
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes('onlyfans.com')) return 'onlyfans';
  if (lowerUrl.includes('fanvue.com')) return 'fanvue';
  if (lowerUrl.match(/^https?:\/\//)) return 'website';
  return 'unknown';
}

export function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
}

export function extractCreatorName(url: string, platform: 'onlyfans' | 'fanvue'): string {
  const match = url.match(/(?:onlyfans|fanvue)\.com\/([^\/\?]+)/);
  return match ? match[1] : '';
}
