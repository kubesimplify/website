import React, { useState, useEffect } from 'react';
import Layout from '@theme/Layout';
import Skeleton from '@site/src/components/Skeleton';

const WorkshopCard = ({ video }) => (
  <div className="group relative bg-dark-card rounded-3xl overflow-hidden border border-white/5 hover:border-primary/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(0,242,255,0.15)] hover:-translate-y-2 flex flex-col h-full">
    <a href={`https://www.youtube.com/watch?v=${video.snippet.resourceId.videoId}`} target="_blank" rel="noopener noreferrer" className="block flex-1 flex flex-col">
      <div className="relative overflow-hidden aspect-video">
        <img
          src={video.snippet.thumbnails.medium.url}
          alt={video.snippet.title}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-2xl transform scale-50 group-hover:scale-100 transition-transform duration-300">
            <svg className="w-8 h-8 text-white fill-current ml-1" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>
      <div className="p-6 flex-1 flex flex-col">
        <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 leading-snug group-hover:text-primary transition-colors duration-300">
          {video.snippet.title}
        </h3>
        <p className="text-sm text-gray-400 line-clamp-3 mb-4 flex-1">
          {video.snippet.description}
        </p>
        <div className="mt-auto pt-4 border-t border-white/5">
          <span className="text-primary font-bold opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300">
            Start Workshop →
          </span>
        </div>
      </div>
    </a>
  </div>
);

export default function Workshops() {
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkshops = async () => {
      try {
        const PLAYLIST_ID = 'PL5uLNcv9SibDZ6AkVDXXqxKtYM0JJ0wqt';
        // Note: Using RSS for playlist has limitations (e.g. description is truncated or missing).
        // For a true "premium" feel with full descriptions, we'd want the YouTube Data API.
        // But we stick to the current method for now as requested.
        const FEED_URL = `https://www.youtube.com/feeds/videos.xml?playlist_id=${PLAYLIST_ID}`;

        const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(FEED_URL)}`);
        const data = await response.json();

        if (data.items) {
          const items = data.items.map(item => ({
            snippet: {
              resourceId: { videoId: item.guid.split(':')[2] },
              title: item.title,
              thumbnails: { medium: { url: item.thumbnail } },
              description: "Master this topic with our hands-on workshop session." // Fallback description
            }
          }));
          setWorkshops(items);
        }
      } catch (error) {
        console.error('Error fetching workshops:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkshops();
  }, []);

  return (
    <Layout title="Workshops" description="Learn with our hands-on workshops">
      <div className="bg-dark-bg min-h-screen py-32 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10 animate-blob" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[100px] -z-10 opacity-50 animate-blob animation-delay-2000" />

        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-32 max-w-3xl mx-auto animate-fade-in px-4">
            <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-bold text-sm mb-6 border border-primary/20 backdrop-blur-md">
              Free Education
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-8 tracking-tight leading-tight">
              Master Cloud Native
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 leading-relaxed">
              Deep dive into Kubernetes, DevOps, and Platform Engineering with our comprehensive, expert-led workshops.
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-dark-card rounded-3xl overflow-hidden border border-white/5 h-96">
                  <Skeleton className="h-48 w-full" />
                  <div className="p-6">
                    <Skeleton className="h-6 w-3/4 mb-3 bg-white/10" />
                    <Skeleton className="h-20 w-full mb-4 bg-white/10" />
                    <Skeleton className="h-4 w-1/3 bg-white/10" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {workshops.map((workshop, index) => (
                <WorkshopCard key={index} video={workshop} />
              ))}
            </div>
          )}

          <div className="text-center mt-32">
            <a
              href="https://www.youtube.com/playlist?list=PL5uLNcv9SibDZ6AkVDXXqxKtYM0JJ0wqt"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center justify-center px-10 py-4 text-lg font-bold text-black bg-primary rounded-full hover:bg-primary-light hover:shadow-[0_0_40px_rgba(0,242,255,0.5)] hover:-translate-y-1 transition-all duration-300"
            >
              View All Workshops on YouTube
              <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
}