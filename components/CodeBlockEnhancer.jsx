'use client';
import { useEffect } from 'react';

export default function CodeBlockEnhancer() {
  useEffect(() => {
    const blocks = document.querySelectorAll('article pre');
    blocks.forEach((pre) => {
      if (pre.dataset.enhanced) return;
      pre.dataset.enhanced = '1';

      const wrapper = document.createElement('div');
      wrapper.className = 'relative group';
      pre.parentNode.insertBefore(wrapper, pre);
      wrapper.appendChild(pre);

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.setAttribute('aria-label', 'Copy code');
      btn.className =
        'absolute top-2 right-2 px-2 py-1 text-[11px] font-semibold rounded border border-white/20 bg-black/50 text-white/80 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70';
      btn.textContent = 'Copy';
      btn.addEventListener('click', async () => {
        const code = pre.querySelector('code')?.innerText || pre.innerText;
        try {
          await navigator.clipboard.writeText(code);
          btn.textContent = 'Copied!';
          setTimeout(() => (btn.textContent = 'Copy'), 1500);
        } catch {}
      });
      wrapper.appendChild(btn);
    });
  }, []);

  return null;
}
