const fs = require('fs');
const path = require('path');

// Read the API endpoint from .env
const envContent = fs.readFileSync('.env', 'utf8');
const apiEndpoint = envContent
  .split('\n')
  .find(line => line.startsWith('API_ENDPOINT='))
  ?.split('=')[1];

if (!apiEndpoint) {
  console.error('Error: API_ENDPOINT not found in .env file');
  process.exit(1);
}

// Read the template file
const templatePath = path.join(__dirname, '../src/services/songApi.template.ts');
const outputPath = path.join(__dirname, '../src/services/songApi.ts');

const templateContent = fs.readFileSync(templatePath, 'utf8');
const updatedContent = templateContent.replace('API_ENDPOINT_PLACEHOLDER', apiEndpoint);

// Write the updated file
fs.writeFileSync(outputPath, updatedContent);
console.log('✅ Updated songApi.ts with API endpoint'); 