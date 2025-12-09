import React, { useState, useEffect } from 'react';
import Skeleton from '@site/src/components/Skeleton';

const BlogCard = ({ blog }) => (
    <div className="group flex flex-col bg-dark-card rounded-3xl border border-white/5 hover:border-primary/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(0,242,255,0.15)] hover:-translate-y-2">
        <a href={`https://blog.kubesimplify.com/${blog.slug}`} target="_blank" rel="noopener noreferrer" className="flex-1 flex flex-col">
            <div className="relative overflow-hidden aspect-[4/3] w-full rounded-t-3xl">
                <img
                    src={blog.coverImage?.url || 'https://blog.kubesimplify.com/img/cover.png'}
                    alt={blog.title}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-transparent to-transparent opacity-60" />
            </div>
            <div className="p-8 flex-1 flex flex-col">
                <div className="mb-4 flex items-center space-x-2">
                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider border border-primary/20">
                        Article
                    </span>
                    <span className="text-gray-500 text-xs font-medium">
                        {new Date(blog.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3 leading-tight group-hover:text-primary transition-colors duration-300 min-h-[3.5rem]">
                    {blog.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-6">
                    {blog.brief}
                </p>
                <div className="mt-auto flex items-center text-primary font-bold text-sm pt-4 pl-6 ml-4 pr-4">
                    Read Article
                    <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
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
              posts(first: 3) {
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

                const { data } = await response.json();

                if (data?.publication?.posts?.edges) {
                    setBlogs(data.publication.posts.edges.map(edge => edge.node));
                } else {
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
            <div className="text-center py-12 bg-dark-card rounded-3xl border border-white/5">
                <p className="text-gray-400 mb-4">Unable to load articles at the moment.</p>
                <a href="https://blog.kubesimplify.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-white font-bold transition-colors">
                    Visit our Blog
                </a>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
                [...Array(3)].map((_, i) => (
                    <div key={i} className="bg-dark-card rounded-3xl overflow-hidden h-[500px] border border-white/5">
                        <Skeleton className="h-48 w-full" />
                        <div className="p-8">
                            <Skeleton className="h-4 w-20 mb-4 rounded-full bg-white/10" />
                            <Skeleton className="h-8 w-3/4 mb-4 bg-white/10" />
                            <Skeleton className="h-20 w-full mb-6 bg-white/10" />
                            <Skeleton className="h-4 w-1/3 bg-white/10" />
                        </div>
                    </div>
                ))
            ) : (
                blogs.map((blog, index) => (
                    <BlogCard key={index} blog={blog} />
                ))
            )}
        </div>
    );
}
