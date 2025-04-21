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

  for (const line of lines) {
    if (line === '---') {
      inFrontmatter = !inFrontmatter;
      continue;
    }

    if (inFrontmatter) {
      const [key, value] = line.split(':').map(s => s.trim());
      frontmatter[key] = value.replace(/^['"]|['"]$/g, '');
    } else {
      content += line + '\n';
    }
  }

  return {
    title: frontmatter.title || '',
    date: frontmatter.date || '',
    summary: frontmatter.summary || '',
    content: content.trim()
  };
} 