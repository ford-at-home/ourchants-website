import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read the API endpoint from .env
const envContent = readFileSync('.env', 'utf8');
const apiEndpoint = envContent
  .split('\n')
  .find(line => line.startsWith('API_ENDPOINT='))
  ?.split('=')[1];

if (!apiEndpoint) {
  console.error('Error: API_ENDPOINT not found in .env file');
  process.exit(1);
}

// Define paths
const templatePath = join(__dirname, '../src/services/songApi.template.ts');
const outputPath = join(__dirname, '../src/services/songApi.ts');

// Create template if it doesn't exist
if (!existsSync(templatePath)) {
  console.log('Creating songApi.template.ts...');
  const templateContent = `import { Song } from "@/types/song";

// API Configuration
const API_BASE_URL = "API_ENDPOINT_PLACEHOLDER";

interface ApiError {
  error: string;
  code: string;
  details?: Record<string, any>;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(\`\${error.error} (Code: \${error.code})\`);
  }
  return response.json();
}

export const createSong = async (song: Omit<Song, 'song_id'>): Promise<Song> => {
  const response = await fetch(\`\${API_BASE_URL}/songs\`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(song),
  });
  return handleResponse<Song>(response);
};

export const getSong = async (songId: string): Promise<Song> => {
  const response = await fetch(\`\${API_BASE_URL}/songs/\${songId}\`);
  return handleResponse<Song>(response);
};

export const listSongs = async (): Promise<Song[]> => {
  const response = await fetch(\`\${API_BASE_URL}/songs\`, {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });
  return handleResponse<Song[]>(response);
};

export const updateSong = async (songId: string, song: Omit<Song, 'song_id'>): Promise<Song> => {
  const response = await fetch(\`\${API_BASE_URL}/songs/\${songId}\`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(song),
  });
  return handleResponse<Song>(response);
};

export const deleteSong = async (songId: string): Promise<void> => {
  const response = await fetch(\`\${API_BASE_URL}/songs/\${songId}\`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(\`\${error.error} (Code: \${error.code})\`);
  }
};

// Helper function for concurrent updates with retry logic
export const updateSongWithRetry = async (
  songId: string,
  song: Omit<Song, 'song_id'>,
  maxRetries = 3
): Promise<Song> => {
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      return await updateSong(songId, song);
    } catch (error) {
      if (error.message.includes('409') && retries < maxRetries - 1) {
        retries++;
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retries)));
        continue;
      }
      throw error;
    }
  }
  
  throw new Error('Max retries exceeded');
};`;

  // Ensure directory exists
  const dir = dirname(templatePath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  writeFileSync(templatePath, templateContent);
  console.log('✅ Created songApi.template.ts');
}

// Read the template file
const templateContent = readFileSync(templatePath, 'utf8');
const updatedContent = templateContent.replace('API_ENDPOINT_PLACEHOLDER', apiEndpoint);

// Ensure output directory exists
const outputDir = dirname(outputPath);
if (!existsSync(outputDir)) {
  mkdirSync(outputDir, { recursive: true });
}

// Write the updated file
writeFileSync(outputPath, updatedContent);
console.log('✅ Updated songApi.ts with API endpoint'); 