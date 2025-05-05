export function getSongFromUrl(): { songId: string; timestamp?: number } | null {
  // First check query parameters
  const params = new URLSearchParams(window.location.search);
  let songId = params.get('song');
  let timestamp = params.get('t');
  
  // If no song in query params, check hash
  if (!songId && window.location.hash) {
    songId = window.location.hash.slice(1); // Remove the # symbol
  }
  
  if (!songId) return null;
  
  return {
    songId,
    timestamp: timestamp ? parseFloat(timestamp) : undefined
  };
}

export function createSongUrl(songId: string, timestamp?: number): string {
  const url = new URL(window.location.href);
  
  // If the current URL uses hash, maintain that style
  if (window.location.hash && !url.searchParams.has('song')) {
    url.hash = songId;
  } else {
    url.searchParams.set('song', songId);
  }
  
  if (timestamp) {
    url.searchParams.set('t', timestamp.toString());
  }
  return url.toString();
} 