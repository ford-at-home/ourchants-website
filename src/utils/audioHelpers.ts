/**
 * Converts an S3 URI to a CDN URL
 * @param s3Uri The S3 URI (e.g., s3://ourchants-songs/song.mp3)
 * @returns The CDN URL or null if invalid
 */
export function buildAudioSrcFromS3Uri(s3Uri: string): string | null {
  if (!s3Uri?.startsWith('s3://')) {
    console.error('Invalid S3 URI:', s3Uri);
    return null;
  }
  
  const bucketPath = s3Uri.replace('s3://', '');
  return `https://cdn.ourchants.com/${bucketPath}`;
}

/**
 * Extracts bucket and key from an S3 URI
 * @param s3Uri The S3 URI (e.g., s3://ourchants-songs/song.mp3)
 * @returns Object containing bucket and key, or null if invalid
 */
export function extractS3Info(s3Uri: string): { bucket: string; key: string } | null {
  if (!s3Uri?.startsWith('s3://')) {
    console.error('Invalid S3 URI:', s3Uri);
    return null;
  }
  
  const path = s3Uri.slice(5);
  const [bucket, ...keyParts] = path.split('/');
  
  if (!bucket || bucket.trim() === '') {
    console.error('Invalid bucket in S3 URI:', s3Uri);
    return null;
  }
  
  const key = keyParts.join('/');
  if (!key || key.trim() === '') {
    console.error('Invalid key in S3 URI:', s3Uri);
    return null;
  }

  return { bucket, key };
}

/**
 * Validates an S3 URI
 * @param s3Uri The S3 URI to validate
 * @returns Whether the URI is valid
 */
export function isValidS3Uri(s3Uri: string): boolean {
  if (!s3Uri?.startsWith('s3://')) return false;
  
  const path = s3Uri.slice(5);
  const [bucket, ...keyParts] = path.split('/');
  
  if (!bucket || bucket.trim() === '') return false;
  
  const key = keyParts.join('/');
  if (!key || key.trim() === '') return false;

  const validExtensions = ['.mp3', '.wav', '.m4a', '.ogg'];
  return validExtensions.some(ext => key.toLowerCase().endsWith(ext));
} 