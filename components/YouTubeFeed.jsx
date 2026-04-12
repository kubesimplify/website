'use client';

import { useState, useEffect } from 'react';

const PLAYLISTS = {
  workshops: 'PL5uLNcv9SibBrCVC9lKwRHOV6GjUbAhIn',
  dgxspark: 'PL5uLNcv9SibAv1mMBJtiPluQQ32TMOqTX',
  channel: null, // uses channel feed
};

async function fetchPlaylist(playlistId) {
  const feedUrl = `https://www.youtube.com/feeds/videos.xml?playlist_id=${playlistId}`;
  const resp = await fetch(
    `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`
  );
  const data = await resp.json();
  if (data.status === 'ok' && data.items?.length > 0) return data.items;
  return [];
}

async function fetchChannel() {
  const feedUrl = 'https://www.youtube.com/feeds/videos.xml?channel_id=UCi-1nnN0eC9nRleXdZA6ncg';
  const resp = await fetch(
    `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`
  );
  const data = await resp.json();
  if (data.status === 'ok' && data.items?.length > 0) return data.items;
  return [];
}

/**
 * @param {object} props
 * @param {number} props.count - Total videos to show
 * @param {'mixed'|'workshops'|'dgxspark'|'channel'} props.source - Which feed to pull from
 */
export default function YouTubeFeed({ count = 3, source = 'mixed' }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        let result = [];

        if (source === 'mixed') {
          // Mix from workshops + DGX spark playlists
          const [ws, ai] = await Promise.all([
            fetchPlaylist(PLAYLISTS.workshops).catch(() => []),
            fetchPlaylist(PLAYLISTS.dgxspark).catch(() => []),
          ]);
          // Interleave: 2 workshops, 1 AI, repeat
          let wi = 0, ai_i = 0;
          while (result.length < count && (wi < ws.length || ai_i < ai.length)) {
            if (wi < ws.length) result.push(ws[wi++]);
            if (result.length >= count) break;
            if (wi < ws.length) result.push(ws[wi++]);
            if (result.length >= count) break;
            if (ai_i < ai.length) result.push(ai[ai_i++]);
          }
          // If still need more, append remaining from either
          while (result.length < count && wi < ws.length) result.push(ws[wi++]);
          while (result.length < count && ai_i < ai.length) result.push(ai[ai_i++]);
        } else if (source === 'workshops') {
          result = await fetchPlaylist(PLAYLISTS.workshops);
        } else if (source === 'dgxspark') {
          result = await fetchPlaylist(PLAYLISTS.dgxspark);
        } else {
          result = await fetchChannel();
        }

        // Validate URLs from third-party API
        const safe = result.filter(v =>
          (!v.link || v.link.startsWith('https://')) &&
          (!v.thumbnail || v.thumbnail.startsWith('https://'))
        );
        if (safe.length > 0) {
          setVideos(safe.slice(0, count));
        } else {
          setError(true);
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [count, source]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(Math.min(count, 3))].map((_, i) => (
          <div key={i} className="glass-card rounded-2xl overflow-hidden">
            <div className="aspect-video animate-pulse" style={{ background: 'var(--bg-elevated)' }} />
            <div className="p-6">
              <div className="h-5 w-3/4 rounded animate-pulse mb-3" style={{ background: 'var(--bg-elevated)' }} />
              <div className="h-4 w-1/2 rounded animate-pulse" style={{ background: 'var(--bg-elevated)' }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 glass-card rounded-2xl">
        <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>Unable to load videos right now.</p>
        <a href="https://www.youtube.com/@kubesimplify" target="_blank" rel="noopener noreferrer"
          className="font-semibold hover:underline" style={{ color: 'var(--accent)' }}>
          Visit our YouTube Channel &rarr;
        </a>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {videos.map((video) => (
        <a
          key={video.guid}
          href={video.link}
          target="_blank"
          rel="noopener noreferrer"
          className="group glass-card rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-1 flex flex-col"
        >
          <div className="relative aspect-video overflow-hidden">
            <img src={video.thumbnail} alt={video.title} loading="lazy"
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <div className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center shadow-2xl scale-75 group-hover:scale-100 transition-transform duration-300">
                <svg className="w-6 h-6 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
              </div>
            </div>
          </div>
          <div className="p-5 flex-1 flex flex-col">
            <h3 className="text-base font-semibold mb-3 leading-snug line-clamp-2" style={{ color: 'var(--text-primary)' }}>
              {video.title}
            </h3>
            <div className="mt-auto flex items-center justify-between pt-4 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {new Date(video.pubDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
              </span>
              <span className="text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--accent)' }}>
                Watch &rarr;
              </span>
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}
