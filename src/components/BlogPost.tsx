import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { parseMarkdown, BlogPost } from '../utils/markdown';
import ReactMarkdown from 'react-markdown';

const BlogPost = () => {
  const { slug } = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);

  useEffect(() => {
    const loadPost = async () => {
      try {
        const content = await import(`../content/blog/${slug}.md?raw`);
        const post = parseMarkdown(content.default);
        setPost(post);
      } catch (error) {
        console.error('Error loading post:', error);
      }
    };

    if (slug) {
      loadPost();
    }
  }, [slug]);

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Post not found</h1>
        <Link to="/blog" className="text-spotify-green hover:underline">
          ← Back to blog
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/blog" className="text-spotify-green hover:underline inline-flex items-center mb-8">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to blog
      </Link>

      <article className="prose prose-invert max-w-none">
        <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
        <time className="text-gray-400 block mb-8" dateTime={post.date}>
          {new Date(post.date).toLocaleDateString()}
        </time>
        <div className="text-gray-300 space-y-4">
          <ReactMarkdown
            components={{
              a: ({ node, ...props }) => (
                <a
                  {...props}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-spotify-green hover:underline"
                />
              ),
            }}
          >
            {post.content}
          </ReactMarkdown>
        </div>
      </article>
    </div>
  );
};

export default BlogPost; 