import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const blogDir = path.join(process.cwd(), 'src/content/blog');
const outputDir = path.join(process.cwd(), 'public/content/blog');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Get all markdown files
const files = fs.readdirSync(blogDir).filter(file => file.endsWith('.md'));

// Process each file
const posts = files.map(file => {
  const filePath = path.join(blogDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  const { data, content: markdownContent } = matter(content);
  
  const slug = file.replace(/\.md$/, '');
  
  // Write individual post JSON
  fs.writeFileSync(
    path.join(outputDir, `${slug}.json`),
    JSON.stringify({
      ...data,
      slug,
      content: markdownContent
    }, null, 2)
  );

  return {
    ...data,
    slug,
    content: markdownContent
  };
});

// Write index JSON
fs.writeFileSync(
  path.join(outputDir, 'index.json'),
  JSON.stringify(posts, null, 2)
); 