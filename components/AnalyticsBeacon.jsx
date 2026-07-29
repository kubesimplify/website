'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

// First-party analytics beacon. Sends pageviews and time-on-page slices to
// the Worker API on blog.kubesimplify.com (see worker/index.js). No cookies,
// nothing stored client-side. Works from both kubesimplify.com (GitHub Pages)
// and blog.kubesimplify.com so the dashboard sees the whole property.
const ENDPOINT = 'https://blog.kubesimplify.com/api/collect';

function send(payload) {
  try {
    const body = JSON.stringify(payload);
    if (navigator.sendBeacon) {
      navigator.sendBeacon(ENDPOINT, body);
    } else {
      fetch(ENDPOINT, { method: 'POST', body, keepalive: true }).catch(() => {});
    }
  } catch {
    // analytics must never break the page
  }
}

export default function AnalyticsBeacon() {
  const pathname = usePathname();
  // Tracks visible time for the current path. `since` is null while hidden.
  const state = useRef({ path: null, since: null, firstView: true });

  useEffect(() => {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') return;

    const s = state.current;

    // Send accumulated visible seconds for the current path and reset the
    // clock. Slices are summed server-side, so partial flushes are additive.
    const flush = () => {
      if (!s.path || s.since === null) return;
      const secs = Math.round((performance.now() - s.since) / 1000);
      s.since = performance.now();
      if (secs >= 1) send({ type: 'time', path: s.path, duration: secs });
    };

    if (s.path !== pathname) {
      flush();
      s.path = pathname;
      s.since = document.visibilityState === 'visible' ? performance.now() : null;
      send({
        type: 'view',
        path: pathname,
        // Only the first view of the session carries the external referrer;
        // client-side navigations are internal.
        referrer: s.firstView ? document.referrer : '',
      });
      s.firstView = false;
    }

    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        flush();
        s.since = null;
      } else if (s.since === null) {
        s.since = performance.now();
      }
    };
    const onPageHide = () => {
      flush();
      s.since = null;
    };

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', onPageHide);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', onPageHide);
    };
  }, [pathname]);

  return null;
}
