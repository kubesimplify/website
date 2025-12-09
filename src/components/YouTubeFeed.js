import React, { useState, useEffect } from 'react';
import Skeleton from '@site/src/components/Skeleton';

const YouTubeFeed = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchVideos = async () => {
            try {
                // Using playlist ID for "Latest" or specific curated list
                const PLAYLIST_ID = 'PL5uLNcv9SibDZ6AkVDXXqxKtYM0JJ0wqt';
                const FEED_URL = `https://www.youtube.com/feeds/videos.xml?playlist_id=${PLAYLIST_ID}`;

                const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(FEED_URL)}`);
                const data = await response.json();

                if (data.items) {
                    setVideos(data.items.slice(0, 6)); // Top 6 videos
                } else {
                    setError(true);
                }
            } catch (error) {
                console.error('Error fetching YouTube videos:', error);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchVideos();
    }, []);

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-dark-card rounded-3xl overflow-hidden border border-white/5">
                        <Skeleton className="h-48 w-full" />
                        <div className="p-6">
                            <Skeleton className="h-6 w-3/4 mb-3 bg-white/10" />
                            <Skeleton className="h-4 w-1/2 bg-white/10" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-10 bg-white/5 rounded-3xl border border-white/10">
                <p className="text-gray-400 mb-4">Unable to load videos at the moment.</p>
                <a href="https://www.youtube.com/@kubesimplify" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    Visit our YouTube Channel
                </a>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {videos.map((video) => (
                <div key={video.guid} className="group relative bg-[#0a0a0a] rounded-3xl overflow-hidden border border-white/5 hover:border-primary/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(0,242,255,0.15)] hover:-translate-y-2 flex flex-col h-full">
                    <a href={video.link} target="_blank" rel="noopener noreferrer" className="block flex-1 flex flex-col">
                        <div className="relative overflow-hidden aspect-video">
                            <img
                                src={video.thumbnail}
                                alt={video.title}
                                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-2xl transform scale-50 group-hover:scale-100 transition-transform duration-300">
                                    <svg className="w-8 h-8 text-white fill-current ml-1" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="absolute bottom-3 right-3 bg-black/80 text-white text-xs font-bold px-2 py-1 rounded backdrop-blur-sm">
                                YOUTUBE
                            </div>
                        </div>
                        <div className="p-6 flex-1 flex flex-col">
                            <h3 className="text-lg font-bold text-white mb-3 leading-snug group-hover:text-primary transition-colors duration-300 min-h-[3.5rem]">
                                {video.title}
                            </h3>
                            <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/5">
                                <span className="text-sm text-gray-500">
                                    {new Date(video.pubDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                </span>
                                <span className="text-sm font-bold text-primary opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300 pl-3">
                                    Watch Now →
                                </span>
                            </div>
                        </div>
                    </a>
                </div>
            ))}
        </div>
    );
};

export default YouTubeFeed;
