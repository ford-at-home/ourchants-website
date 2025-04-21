# Blog Post Guide

This guide explains how to add new blog posts to the OurChants website.

## Creating a New Blog Post

1. Create a new markdown file in the `src/content/blog/` directory
2. Name the file using kebab-case (e.g., `my-new-post.md`)
3. Add the following frontmatter at the top of the file:

```markdown
---
title: "Your Post Title"
slug: "your-post-slug"
date: "YYYY-MM-DD"
summary: "A short summary of your post."
published: true
---
```

4. Write your content using markdown syntax below the frontmatter

## Frontmatter Fields

- `title`: The display title of your post
- `slug`: The URL-friendly version of your title (use kebab-case)
- `date`: Publication date in YYYY-MM-DD format
- `summary`: A brief description of your post
- `published`: Set to `true` to make the post visible, `false` to hide it

## Markdown Formatting

You can use standard markdown syntax in your posts:

```markdown
# Heading 1
## Heading 2
### Heading 3

**Bold text**
*Italic text*

- Bullet point
- Another bullet point

1. Numbered list
2. Second item

[Link text](https://example.com)

![Alt text](image-url.jpg)
```

## Example Post

```markdown
---
title: "The Power of Sacred Chants"
slug: "power-of-sacred-chants"
date: "2024-04-15"
summary: "Exploring the spiritual and cultural significance of traditional chants."
published: true
---

# The Power of Sacred Chants

Sacred chants have been used for centuries across various cultures...

## Cultural Significance

These chants are more than just music...

- They preserve ancient traditions
- They connect communities
- They carry spiritual meaning

## Modern Applications

Today, we can use technology to...
```

## Best Practices

1. Keep your slug simple and URL-friendly
2. Write a clear, concise summary
3. Use headings to organize your content
4. Add images when appropriate
5. Keep the tone respectful and informative

## Previewing Posts

To preview your post:
1. Run the development server
2. Navigate to `/blog` to see the post in the list
3. Click on the post to view it in detail

## Troubleshooting

If your post doesn't appear:
- Check that `published` is set to `true`
- Verify the file is in the correct directory
- Ensure the frontmatter is properly formatted
- Check for any markdown syntax errors 