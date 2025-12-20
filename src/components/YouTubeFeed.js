import React, { useState, useEffect } from 'react';
import Skeleton from '@site/src/components/Skeleton';

const YouTubeFeed = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchVideos = async () => {
            try {
                // First 3 videos from workshop playlist
                const PLAYLIST_ID = 'PL5uLNcv9SibDZ6AkVDXXqxKtYM0JJ0wqt';
                const PLAYLIST_FEED_URL = `https://www.youtube.com/feeds/videos.xml?playlist_id=${PLAYLIST_ID}`;

                // Fetch workshop playlist first
                const playlistResponse = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(PLAYLIST_FEED_URL)}`);
                const playlistData = await playlistResponse.json();

                const allVideos = [];
                
                // Add first 3 from workshop playlist
                if (playlistData.items && playlistData.items.length > 0) {
                    allVideos.push(...playlistData.items.slice(0, 3));
                }

                // Try to fetch channel's latest videos
                // Try multiple RSS feed formats for the channel
                // Channel ID format: UU + channel ID for uploads playlist
                const channelFeedUrls = [
                    `https://www.youtube.com/feeds/videos.xml?channel_id=UCi-1nnN0eC9nRleXdZA6ncg`, // Channel ID format
                    `https://www.youtube.com/feeds/videos.xml?user=kubesimplify`, // User format (legacy)
                    `https://www.youtube.com/feeds/videos.xml?playlist_id=UUi-1nnN0eC9nRleXdZA6ncg`, // Uploads playlist (UU + channel ID)
                ];

                let channelVideos = [];
                for (const feedUrl of channelFeedUrls) {
                    try {
                        const channelResponse = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`);
                        const channelData = await channelResponse.json();
                        
                        if (channelData.items && channelData.items.length > 0) {
                            // Exclude duplicates from playlist
                            const playlistVideoIds = new Set(allVideos.map(v => v.guid || v.link));
                            channelVideos = channelData.items
                                .filter(v => {
                                    const videoId = v.guid || v.link;
                                    return !playlistVideoIds.has(videoId);
                                })
                                .slice(0, 3);
                            break; // Success, stop trying other URLs
                        }
                    } catch (err) {
                        console.log(`Failed to fetch from ${feedUrl}, trying next...`);
                        continue;
                    }
                }

                // If channel feed didn't work, try getting channel uploads playlist
                // Channel uploads playlist ID format: UU + channel ID (but we don't have channel ID)
                // Alternative: Use the channel's custom URL format
                if (channelVideos.length === 0) {
                    try {
                        // Try using the channel handle in uploads format
                        // This is a workaround - we'll use the channel's uploads if we can find it
                        const uploadsFeedUrl = `https://www.youtube.com/feeds/videos.xml?user=kubesimplify`;
                        const uploadsResponse = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(uploadsFeedUrl)}`);
                        const uploadsData = await uploadsResponse.json();
                        
                        if (uploadsData.items && uploadsData.items.length > 0) {
                            const playlistVideoIds = new Set(allVideos.map(v => v.guid || v.link));
                            channelVideos = uploadsData.items
                                .filter(v => {
                                    const videoId = v.guid || v.link;
                                    return !playlistVideoIds.has(videoId);
                                })
                                .slice(0, 3);
                        }
                    } catch (err) {
                        console.log('Could not fetch channel uploads, using only playlist videos');
                    }
                }

                // Add channel videos if we got them
                if (channelVideos.length > 0) {
                    allVideos.push(...channelVideos);
                } else {
                    // If we couldn't get channel videos, just use more from playlist
                    if (playlistData.items && playlistData.items.length > 3) {
                        allVideos.push(...playlistData.items.slice(3, 6));
                    }
                }

                if (allVideos.length > 0) {
                    setVideos(allVideos);
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-dark-card rounded-2xl overflow-hidden border border-white/5">
                        <Skeleton className="h-48 w-full" />
                        <div className="p-5 md:p-6">
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
            <div className="text-center py-10 bg-white/5 rounded-2xl border border-white/10">
                <p className="text-gray-400 mb-4">Unable to load videos at the moment.</p>
                <a href="https://www.youtube.com/@kubesimplify" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    Visit our YouTube Channel
                </a>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {videos.map((video) => (
                <div key={video.guid} className="group relative bg-[#0a0a0a] rounded-2xl border border-white/5 hover:border-primary/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(0,242,255,0.15)] hover:-translate-y-2 flex flex-col h-full">
                    <a href={video.link} target="_blank" rel="noopener noreferrer" className="block flex-1 flex flex-col h-full">
                        <div className="relative w-full aspect-video flex-shrink-0 rounded-t-2xl overflow-hidden">
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
                            <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-bold px-2 py-1 rounded backdrop-blur-sm">
                                YOUTUBE
                            </div>
                        </div>
                        <div className="p-5 md:p-6 flex-1 flex flex-col">
                            <h3 className="text-lg font-bold text-white mb-3 leading-snug group-hover:text-primary transition-colors duration-300 line-clamp-2">
                                {video.title}
                            </h3>
                            <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/5">
                                <span className="text-sm text-gray-500">
                                    {new Date(video.pubDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                </span>
                                <span className="inline-flex items-center text-sm font-bold text-primary opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300">
                                    Watch Now
                                    <svg className="w-4 h-4 ml-1.5 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
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
