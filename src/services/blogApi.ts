import { API_ENDPOINT } from './songApi';

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  author: string;
  created_at: string;
  tags: string[];
  image_url?: string;
}

export const fetchBlogPosts = async (): Promise<BlogPost[]> => {
  try {
    const response = await fetch(`${API_ENDPOINT}/blog`, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    if (!response.ok) {
      throw new Error('Failed to fetch blog posts');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    throw error;
  }
};

export const createBlogPost = async (post: Omit<BlogPost, 'id' | 'created_at'>): Promise<BlogPost> => {
  try {
    const response = await fetch(`${API_ENDPOINT}/blog`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(post)
    });
    if (!response.ok) {
      throw new Error('Failed to create blog post');
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating blog post:', error);
    throw error;
  }
}; 