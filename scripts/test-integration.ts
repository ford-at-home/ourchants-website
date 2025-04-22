// Direct fetch test without importing from the project
const API_ENDPOINT = "https://9dl6yhg7r8.execute-api.us-east-1.amazonaws.com/";

async function runTests() {
  console.log('=== Starting Integration Tests ===');
  
  // Test 1: Fetch Songs
  try {
    console.log('Testing /songs endpoint...');
    const response = await fetch(`${API_ENDPOINT}/songs`, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const songs = await response.json();
    console.log('Success! Retrieved', songs.length, 'songs');
    console.log('Sample song:', songs[0]);
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
  
  console.log('=== All tests passed ===');
}

runTests();
