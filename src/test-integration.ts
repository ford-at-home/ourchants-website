import { fetchSongs } from './services/songApi';

async function runTests() {
  console.log('=== Starting Integration Tests ===');
  
  // Test 1: Fetch Songs
  try {
    console.log('Testing /songs endpoint...');
    const songs = await fetchSongs();
    console.log('Success! Retrieved', songs.length, 'songs');
    console.log('Sample song:', songs[0]);
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
  
  console.log('=== All tests passed ===');
}

runTests();
