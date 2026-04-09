'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
  { href: '/about', label: 'About' },
  { href: '/workshops', label: 'Watch & Learn' },
  { href: '/partnerships', label: 'Partnerships' },
  { href: '/blogs', label: 'Blog' },
  { href: 'https://www.youtube.com/@kubesimplify', label: 'YouTube', external: true },
];

function ThemeToggle() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = stored ? stored === 'dark' : prefersDark;
    setDark(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  return (
    <button
      onClick={toggle}
      className="w-9 h-9 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--border-subtle)] transition-all"
      aria-label="Toggle theme"
    >
      {dark ? (
        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ) : (
        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
    </button>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'navbar-blur border-b' : 'bg-transparent'
      }`}
      style={{ borderColor: scrolled ? 'var(--border-subtle)' : 'transparent' }}
    >
      <nav className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <img src="/img/color.svg" alt="Kubesimplify" className="h-8 w-8" />
          <span className="text-lg font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Kubesimplify
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const cls = "px-4 py-2 text-sm rounded-lg transition-colors";
            return link.external ? (
              <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer"
                className={cls} style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={e => e.target.style.color = 'var(--text-primary)'}
                onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}
              >{link.label}</a>
            ) : (
              <Link key={link.href} href={link.href}
                className={cls} style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={e => e.target.style.color = 'var(--text-primary)'}
                onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}
              >{link.label}</Link>
            );
          })}
          <ThemeToggle />
          <a
            href="https://saiyampathak.substack.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-3 px-5 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-[#5CFF68] to-[#05CAFF] text-gray-950 font-bold hover:shadow-[0_0_24px_rgba(5,202,255,0.3)] transition-all duration-300 hover:scale-105"
          >
            Newsletter
          </a>
        </div>

        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <button
            className="relative w-10 h-10 flex items-center justify-center"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <div className="w-5 flex flex-col gap-1.5">
              <span className={`block h-[2px] transition-all duration-300 ${mobileOpen ? 'rotate-45 translate-y-[5px]' : ''}`} style={{ background: 'var(--text-primary)' }} />
              <span className={`block h-[2px] transition-all duration-300 ${mobileOpen ? 'opacity-0' : ''}`} style={{ background: 'var(--text-primary)' }} />
              <span className={`block h-[2px] transition-all duration-300 ${mobileOpen ? '-rotate-45 -translate-y-[5px]' : ''}`} style={{ background: 'var(--text-primary)' }} />
            </div>
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="md:hidden overflow-hidden navbar-blur"
            style={{ borderTop: '1px solid var(--border-subtle)' }}
          >
            <div className="px-6 py-6 flex flex-col gap-2">
              {navLinks.map((link) => {
                const cls = "px-4 py-3 text-base rounded-lg transition-colors";
                return link.external ? (
                  <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer"
                    onClick={() => setMobileOpen(false)}
                    className={cls} style={{ color: 'var(--text-secondary)' }}
                  >{link.label}</a>
                ) : (
                  <Link key={link.href} href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={cls} style={{ color: 'var(--text-secondary)' }}
                  >{link.label}</Link>
                );
              })}
              <a
                href="https://saiyampathak.substack.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 px-4 py-3 text-center text-base font-semibold rounded-lg bg-gradient-to-r from-[#5CFF68] to-[#05CAFF] text-gray-950 font-bold"
              >
                Newsletter
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
