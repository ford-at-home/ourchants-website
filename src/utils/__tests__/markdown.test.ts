import { parseMarkdown } from '../markdown';

describe('parseMarkdown', () => {
  it('parses basic frontmatter and content', () => {
    const markdown = `---
title: Test Post
date: 2024-03-20
summary: A simple test post
---
This is the content.`;

    const result = parseMarkdown(markdown);
    expect(result).toEqual({
      title: 'Test Post',
      date: '2024-03-20',
      summary: 'A simple test post',
      content: 'This is the content.'
    });
  });

  it('handles multi-line summaries', () => {
    const markdown = `---
title: Test Post
date: 2024-03-20
summary: This is a multi-line
 summary that continues
 on several lines
---
Content here.`;

    const result = parseMarkdown(markdown);
    expect(result).toEqual({
      title: 'Test Post',
      date: '2024-03-20',
      summary: 'This is a multi-line\nsummary that continues\non several lines',
      content: 'Content here.'
    });
  });

  it('handles colons in content', () => {
    const markdown = `---
title: Test Post
date: 2024-03-20
summary: A post with colons
---
Time is 12:30.
Another time: 15:45.`;

    const result = parseMarkdown(markdown);
    expect(result).toEqual({
      title: 'Test Post',
      date: '2024-03-20',
      summary: 'A post with colons',
      content: 'Time is 12:30.\nAnother time: 15:45.'
    });
  });

  it('handles colons in frontmatter values', () => {
    const markdown = `---
title: My Post: A Subtitle
date: 2024-03-20
summary: This: is a summary
---
Content.`;

    const result = parseMarkdown(markdown);
    expect(result).toEqual({
      title: 'My Post: A Subtitle',
      date: '2024-03-20',
      summary: 'This: is a summary',
      content: 'Content.'
    });
  });

  it('handles empty or missing fields', () => {
    const markdown = `---
title:
date: 2024-03-20
---
Content.`;

    const result = parseMarkdown(markdown);
    expect(result).toEqual({
      title: '',
      date: '2024-03-20',
      summary: '',
      content: 'Content.'
    });
  });

  it('handles quoted values', () => {
    const markdown = `---
title: "Quoted Title"
date: '2024-03-20'
summary: "This is: a quoted summary"
---
Content.`;

    const result = parseMarkdown(markdown);
    expect(result).toEqual({
      title: 'Quoted Title',
      date: '2024-03-20',
      summary: 'This is: a quoted summary',
      content: 'Content.'
    });
  });

  it('handles content with multiple paragraphs', () => {
    const markdown = `---
title: Test Post
date: 2024-03-20
summary: A test post
---
First paragraph.

Second paragraph.

Third paragraph.`;

    const result = parseMarkdown(markdown);
    expect(result).toEqual({
      title: 'Test Post',
      date: '2024-03-20',
      summary: 'A test post',
      content: 'First paragraph.\n\nSecond paragraph.\n\nThird paragraph.'
    });
  });

  it('handles malformed markdown gracefully', () => {
    const markdown = `title: No Frontmatter
Just content.`;

    const result = parseMarkdown(markdown);
    expect(result).toEqual({
      title: '',
      date: '',
      summary: '',
      content: 'title: No Frontmatter\nJust content.'
    });
  });

  it('handles empty markdown', () => {
    const result = parseMarkdown('');
    expect(result).toEqual({
      title: '',
      date: '',
      summary: '',
      content: ''
    });
  });
}); 