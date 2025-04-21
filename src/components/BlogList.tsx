import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { parseMarkdown, BlogPost } from '../utils/markdown';

const BlogList = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const modules = import.meta.glob('../content/blog/*.md', { as: 'raw' });
        const posts = await Promise.all(
          Object.entries(modules).map(async ([path, getContent]) => {
            try {
              const content = await getContent();
              const post = parseMarkdown(content);
              const slug = path.split('/').pop()?.replace('.md', '') || '';
              return { ...post, slug };
            } catch (err) {
              console.error(`Error loading post from ${path}:`, err);
              return null;
            }
          })
        );
        
        const validPosts = posts.filter((post): post is BlogPost & { slug: string } => post !== null);
        setPosts(validPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      } catch (err) {
        console.error('Error loading blog posts:', err);
        setError('Failed to load blog posts. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    loadPosts();
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Blog</h1>
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-spotify-lightgray text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-spotify-green mx-auto mb-4"></div>
            <p>Loading blog posts...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Blog</h1>
        <div className="text-red-500 text-center py-10">
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-spotify-green text-white rounded-full"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Blog</h1>
        <div className="text-spotify-lightgray text-center py-10">
          No blog posts available.
        </div>
      </div>
    );
  }

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