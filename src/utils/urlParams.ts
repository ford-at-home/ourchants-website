export function getSongFromUrl(): { songId: string; timestamp?: number } | null {
  const params = new URLSearchParams(window.location.search);
  const songId = params.get('song');
  const timestamp = params.get('t');
  
  if (!songId) return null;
  
  return {
    songId,
    timestamp: timestamp ? parseFloat(timestamp) : undefined
  };
}

export function createSongUrl(songId: string, timestamp?: number): string {
  const url = new URL(window.location.href);
  url.searchParams.set('song', songId);
  if (timestamp) {
    url.searchParams.set('t', timestamp.toString());
  }
  return url.toString();
} 