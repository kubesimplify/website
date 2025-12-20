import React, { useState, useEffect } from 'react';
import Skeleton from '@site/src/components/Skeleton';

const BlogCard = ({ blog }) => (
    <div className="group flex flex-col bg-dark-card rounded-2xl border border-white/5 hover:border-primary/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(0,242,255,0.15)] hover:-translate-y-2 h-full">
        <a href={`https://blog.kubesimplify.com/${blog.slug}`} target="_blank" rel="noopener noreferrer" className="flex-1 flex flex-col h-full">
            <div className="relative w-full aspect-[4/3] flex-shrink-0 rounded-t-2xl overflow-hidden">
                <img
                    src={blog.coverImage?.url || 'https://blog.kubesimplify.com/img/cover.png'}
                    alt={blog.title}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-transparent to-transparent opacity-60" />
            </div>
            <div className="p-5 md:p-6 flex-1 flex flex-col">
                <div className="mb-3 flex items-center flex-wrap gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider border border-primary/20 whitespace-nowrap">
                        Article
                    </span>
                    <span className="text-gray-500 text-xs font-medium whitespace-nowrap">
                        {new Date(blog.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                </div>
                <h3 className="text-lg md:text-xl font-bold text-white mb-3 leading-snug group-hover:text-primary transition-colors duration-300 line-clamp-3">
                    {blog.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-4 line-clamp-4 flex-1">
                    {blog.brief}
                </p>
                <div className="mt-auto pt-4 border-t border-white/5">
                    <span className="inline-flex items-center text-primary font-bold text-sm group-hover:gap-2 transition-all duration-300">
                        Read Article
                        <svg className="w-4 h-4 ml-1.5 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                    </span>
                </div>
            </div>
        </a>
    </div>
);

export default function BlogFeed() {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const query = `
          query Publication {
            publication(host: "blog.kubesimplify.com") {
              posts(first: 6) {
                edges {
                  node {
                    title
                    brief
                    slug
                    coverImage {
                      url
                    }
                    publishedAt
                  }
                }
              }
            }
          }
        `;

                const response = await fetch('https://gql.hashnode.com', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ query }),
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();

                if (result.errors) {
                    console.error('GraphQL errors:', result.errors);
                    throw new Error('GraphQL query failed');
                }

                const { data } = result;

                if (data?.publication?.posts?.edges) {
                    // Hashnode returns posts in reverse chronological order by default
                    // Sort by publishedAt to ensure latest first, then take first 3
                    const sortedBlogs = data.publication.posts.edges
                        .map(edge => edge.node)
                        .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
                        .slice(0, 3);
                    setBlogs(sortedBlogs);
                } else {
                    console.error('No posts found in response:', data);
                    setError(true);
                }
            } catch (error) {
                console.error('Error fetching blogs:', error);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchBlogs();
    }, []);

    if (error) {
        return (
            <div className="text-center py-12 bg-dark-card rounded-2xl border border-white/5">
                <p className="text-gray-400 mb-4">Unable to load articles at the moment.</p>
                <a href="https://blog.kubesimplify.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-white font-bold transition-colors">
                    Visit our Blog
                </a>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 w-full">
            {loading ? (
                [...Array(3)].map((_, i) => (
                    <div key={i} className="bg-dark-card rounded-2xl overflow-hidden h-[500px] border border-white/5">
                        <Skeleton className="h-48 w-full" />
                        <div className="p-5 md:p-6">
                            <Skeleton className="h-4 w-20 mb-3 rounded-full bg-white/10" />
                            <Skeleton className="h-8 w-3/4 mb-3 bg-white/10" />
                            <Skeleton className="h-20 w-full mb-4 bg-white/10" />
                            <Skeleton className="h-4 w-1/3 bg-white/10" />
                        </div>
                    </div>
                ))
            ) : (
                blogs.map((blog, index) => (
                    <BlogCard key={blog.slug || index} blog={blog} />
                ))
            )}
        </div>
    );
}
