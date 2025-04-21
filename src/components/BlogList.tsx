import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { parseMarkdown, BlogPost } from '../utils/markdown';

const BlogList = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    const loadPosts = async () => {
      const modules = import.meta.glob('../content/blog/*.md', { as: 'raw' });
      const posts = await Promise.all(
        Object.entries(modules).map(async ([path, getContent]) => {
          const content = await getContent();
          const post = parseMarkdown(content);
          const slug = path.split('/').pop()?.replace('.md', '') || '';
          return { ...post, slug };
        })
      );
      setPosts(posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    };

    loadPosts();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Blog</h1>
      <div className="grid gap-6">
        {posts.map((post) => (
          <article key={post.slug} className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors">
            <Link to={`/blog/${post.slug}`}>
              <h2 className="text-2xl font-semibold mb-2 text-white">{post.title}</h2>
              <div className="text-gray-400 mb-4">
                <time dateTime={post.date}>
                  {new Date(post.date).toLocaleDateString()}
                </time>
              </div>
              <p className="text-gray-300">{post.summary}</p>
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
};

export default BlogList; 