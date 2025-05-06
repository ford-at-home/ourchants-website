export interface BlogPost {
  title: string;
  date: string;
  summary: string;
  content: string;
}

export function parseMarkdown(markdown: string): BlogPost {
  const lines = markdown.split('\n');
  const frontmatter: Record<string, string> = {};
  let content = '';
  let inFrontmatter = false;
  let currentKey = '';
  let currentValue = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.trim() === '---') {
      if (!inFrontmatter) {
        inFrontmatter = true;
        continue;
      } else {
        // End of frontmatter
        if (currentKey && currentValue) {
          frontmatter[currentKey] = currentValue.trim();
        }
        inFrontmatter = false;
        continue;
      }
    }

    if (inFrontmatter) {
      const colonIndex = line.indexOf(':');
      if (colonIndex !== -1 && !line.startsWith(' ')) {
        // Save previous key-value pair if exists
        if (currentKey && currentValue) {
          frontmatter[currentKey] = currentValue.trim();
        }
        // Start new key-value pair
        currentKey = line.slice(0, colonIndex).trim();
        currentValue = line.slice(colonIndex + 1).trim();
        // Remove quotes if present
        currentValue = currentValue.replace(/^['"]|['"]$/g, '');
      } else if (line.startsWith(' ') && currentKey) {
        // Continuation of previous value
        currentValue += '\\n' + line.trim();
      }
    } else if (inFrontmatter === false) {
      // Only add to content if we've seen the frontmatter
      content += line + '\n';
    }
  }

  // Clean up the content
  content = content.trim();

  // Replace escaped newlines in summary with actual newlines
  const summary = (frontmatter.summary || '').replace(/\\n/g, '\n');

  return {
    title: frontmatter.title || '',
    date: frontmatter.date || '',
    summary: summary,
    content: content
  };
} 