import { fetchSongs } from './services/songApi';

async function runTests() {
  console.log('=== Starting Integration Tests ===');
  
  // Test 1: Basic Song Fetch
  try {
    console.log('Testing basic /songs endpoint...');
    const response = await fetchSongs();
    console.log('Success! Retrieved', response.items.length, 'songs');
    console.log('Total songs:', response.total);
    console.log('Has more:', response.has_more);
    console.log('Sample song:', response.items[0]);
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }

  // Test 2: Pagination
  try {
    console.log('\nTesting pagination...');
    const page1 = await fetchSongs({ limit: 5, offset: 0 });
    const page2 = await fetchSongs({ limit: 5, offset: 5 });
    
    console.log('Page 1:', page1.items.length, 'songs');
    console.log('Page 2:', page2.items.length, 'songs');
    
    // Verify no overlap between pages
    const page1Ids = new Set(page1.items.map(song => song.song_id));
    const hasOverlap = page2.items.some(song => page1Ids.has(song.song_id));
    
    if (hasOverlap) {
      throw new Error('Pagination test failed: Pages have overlapping songs');
    }
    
    console.log('Pagination test passed!');
  } catch (error) {
    console.error('Pagination test failed:', error);
    process.exit(1);
  }

  // Test 3: Artist Filtering
  try {
    console.log('\nTesting artist filtering...');
    const allSongs = await fetchSongs({ limit: 100 });
    const sampleArtist = allSongs.items[0]?.artist;
    
    if (!sampleArtist) {
      throw new Error('No songs available for filtering test');
    }
    
    const filteredSongs = await fetchSongs({ artist_filter: sampleArtist });
    
    console.log('Filtered by artist:', sampleArtist);
    console.log('Found', filteredSongs.items.length, 'songs');
    
    // Verify all songs match the filter
    const allMatch = filteredSongs.items.every(song => song.artist === sampleArtist);
    
    if (!allMatch) {
      throw new Error('Artist filtering test failed: Some songs do not match the filter');
    }
    
    console.log('Artist filtering test passed!');
  } catch (error) {
    console.error('Artist filtering test failed:', error);
    process.exit(1);
  }

  // Test 4: Invalid Pagination
  try {
    console.log('\nTesting invalid pagination...');
    const invalidLimit = await fetchSongs({ limit: 0 });
    const invalidOffset = await fetchSongs({ offset: -1 });
    
    if (invalidLimit.items.length !== 0 || invalidLimit.total !== 0) {
      throw new Error('Invalid limit test failed: Should return empty results');
    }
    
    if (invalidOffset.items.length !== 0 || invalidOffset.total !== 0) {
      throw new Error('Invalid offset test failed: Should return empty results');
    }
    
    console.log('Invalid pagination test passed!');
  } catch (error) {
    console.error('Invalid pagination test failed:', error);
    process.exit(1);
  }
  
  console.log('\n=== All tests passed ===');
}

runTests();
