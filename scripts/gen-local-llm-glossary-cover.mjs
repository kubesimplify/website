// Excalidraw-style cover for the local LLM glossary post.
// Sketch helpers shared with scripts/gen-two-gpu-vllm-cover.mjs.
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

let seed = 42;
const random = () => {
  seed = (seed * 16807) % 2147483647;
  return seed / 2147483647;
};
const jitter = (amount) => (random() - 0.5) * amount * 2;

const COLORS = {
  ink: '#172033',
  muted: '#5c677d',
  green: { stroke: '#5d8f00', fill: '#d8f5a2' },
  blue: { stroke: '#1971c2', fill: '#a5d8ff' },
  violet: { stroke: '#862e9c', fill: '#eebefa' },
  orange: { stroke: '#d9480f', fill: '#ffd8a8' },
  red: { stroke: '#c92a2a', fill: '#ffc9c9' },
  teal: { stroke: '#087f5b', fill: '#b2f2bb' },
  gray: { stroke: '#495057', fill: '#e9ecef' },
};

const FONT = 'Chalkboard SE, Comic Sans MS, sans-serif';

function roughLine(x1, y1, x2, y2, amount = 1.8) {
  const middleX = (x1 + x2) / 2 + jitter(amount * 1.5);
  const middleY = (y1 + y2) / 2 + jitter(amount * 1.5);
  return `M ${(x1 + jitter(amount)).toFixed(1)} ${(y1 + jitter(amount)).toFixed(1)} Q ${middleX.toFixed(1)} ${middleY.toFixed(1)} ${(x2 + jitter(amount)).toFixed(1)} ${(y2 + jitter(amount)).toFixed(1)}`;
}

class Sketch {
  constructor(width, height, background = '#ffffff') {
    this.width = width;
    this.height = height;
    this.background = background;
    this.parts = [];
    this.defs = [];
    this.clipId = 0;
  }

  add(value) {
    this.parts.push(value);
  }

  rect(x, y, width, height, options = {}) {
    const {
      stroke = COLORS.ink,
      fill,
      strokeWidth = 2.4,
      dashed = false,
      hachure = true,
      radius = 7,
    } = options;

    if (fill) {
      if (hachure) {
        // Hatch lines are clipped in math rather than with an SVG clipPath so
        // the file renders identically in renderers without clipPath support.
        const hatch = [];
        for (let offset = -height; offset < width; offset += 11) {
          const tMin = Math.max(0, -offset / height);
          const tMax = Math.min(1, (width - offset) / height);
          if (tMax - tMin < 0.05) continue;
          const x1 = x + offset + height * tMin;
          const y1 = y + height - height * tMin;
          const x2 = x + offset + height * tMax;
          const y2 = y + height - height * tMax;
          hatch.push(roughLine(x1, y1, x2, y2, 1));
        }
        this.add(`<path d="${hatch.join(' ')}" stroke="${fill}" stroke-width="2.5" opacity="0.58" fill="none" stroke-linecap="round"/>`);
      } else {
        this.add(`<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${radius}" fill="${fill}" fill-opacity="0.62"/>`);
      }
    }

    const points = [[x, y], [x + width, y], [x + width, y + height], [x, y + height]];
    for (let pass = 0; pass < 2; pass += 1) {
      const path = points.map((point, index) => {
        const next = points[(index + 1) % points.length];
        return roughLine(point[0], point[1], next[0], next[1], pass === 0 ? 2 : 1.2);
      }).join(' ');
      this.add(`<path d="${path}" stroke="${stroke}" stroke-width="${pass === 0 ? strokeWidth : strokeWidth * 0.55}" opacity="${pass === 0 ? 1 : 0.55}" fill="none" stroke-linecap="round"${dashed ? ' stroke-dasharray="9 8"' : ''}/>`);
    }
  }

  line(x1, y1, x2, y2, options = {}) {
    const { stroke = COLORS.ink, strokeWidth = 2.4, dashed = false } = options;
    this.add(`<path d="${roughLine(x1, y1, x2, y2)}" stroke="${stroke}" stroke-width="${strokeWidth}" fill="none" stroke-linecap="round"${dashed ? ' stroke-dasharray="8 8"' : ''}/>`);
  }

  arrow(x1, y1, x2, y2, options = {}) {
    const { stroke = COLORS.ink, strokeWidth = 2.6, dashed = false } = options;
    this.line(x1, y1, x2, y2, { stroke, strokeWidth, dashed });
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const length = 14;
    for (const offset of [Math.PI * 0.82, -Math.PI * 0.82]) {
      this.line(
        x2,
        y2,
        x2 + length * Math.cos(angle + offset),
        y2 + length * Math.sin(angle + offset),
        { stroke, strokeWidth }
      );
    }
  }

  text(x, y, value, options = {}) {
    const {
      size = 22,
      color = COLORS.ink,
      anchor = 'middle',
      weight = 500,
      family = FONT,
    } = options;
    const safe = String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    this.add(`<text x="${x}" y="${y}" font-family="${family}" font-size="${size}" font-weight="${weight}" fill="${color}" text-anchor="${anchor}">${safe}</text>`);
  }

  lines(x, y, values, options = {}) {
    const lineHeight = (options.size || 22) * (options.lineHeight || 1.28);
    values.forEach((value, index) => this.text(x, y + index * lineHeight, value, options));
  }

  save(path) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${this.width}" height="${this.height}" viewBox="0 0 ${this.width} ${this.height}">
<defs>${this.defs.join('')}</defs>
<rect width="${this.width}" height="${this.height}" fill="${this.background}"/>
${this.parts.join('\n')}
</svg>`;
    writeFileSync(path, svg);
  }
}

const output = process.argv[2] || '.';
mkdirSync(output, { recursive: true });


const W = 1200;
const H = 630;
const sketch = new Sketch(W, H, '#fdfdfb');

// ── heading ──────────────────────────────────────────────
sketch.text(64, 88, 'The Local LLM Glossary', { size: 54, weight: 800, anchor: 'start' });
sketch.text(64, 128, 'every magic string in these posts, in plain English', {
  size: 23,
  color: COLORS.muted,
  anchor: 'start',
});
sketch.line(64, 150, 660, 150, { stroke: COLORS.muted, strokeWidth: 1.6, dashed: true });

// ── jargon on the left, plain English on the right ────────
const ROWS = [
  { term: 'tg128', plain: 'decode speed, measured over 128 tokens', accent: COLORS.blue },
  { term: 'FP8', plain: '1 byte per weight, so half the size', accent: COLORS.green },
  { term: 'KV cache', plain: 'memory that grows with your context', accent: COLORS.violet },
  { term: 'MTP', plain: 'the model drafts ahead for itself', accent: COLORS.orange },
  { term: 'UD-Q4_K_XL', plain: '4-bit, but not evenly 4-bit', accent: COLORS.teal },
];

const chipX = 64;
const chipW = 340;
const chipH = 56;
const rowTop = 186;
const rowGap = 68;

ROWS.forEach((row, index) => {
  const y = rowTop + index * rowGap;
  sketch.rect(chipX, y, chipW, chipH, { stroke: row.accent.stroke, fill: row.accent.fill });
  sketch.text(chipX + chipW / 2, y + 37, row.term, {
    size: 26,
    weight: 800,
    color: row.accent.stroke,
    family: 'Roboto Mono, Menlo, monospace',
  });
  sketch.arrow(chipX + chipW + 16, y + chipH / 2, chipX + chipW + 86, y + chipH / 2, {
    stroke: COLORS.muted,
    strokeWidth: 2.2,
  });
  sketch.text(chipX + chipW + 106, y + 37, row.plain, {
    size: 24,
    anchor: 'start',
    color: COLORS.ink,
  });
});

// ── footer strip ─────────────────────────────────────────
sketch.line(64, 528, W - 64, 528, { stroke: COLORS.muted, strokeWidth: 1.6 });
sketch.text(64, 564, 'PREFILL - DECODE - QUANT NAMES - YARN - GATED DELTANET - EVERY FLAG', {
  size: 19,
  weight: 800,
  anchor: 'start',
  color: COLORS.ink,
});
sketch.text(64, 594, 'Ctrl+F the thing that confused you, then go back to the post you came from', {
  size: 17,
  anchor: 'start',
  color: COLORS.muted,
});
sketch.text(W - 64, 594, 'blog.kubesimplify.com', {
  size: 17,
  weight: 700,
  anchor: 'end',
  color: COLORS.muted,
});

sketch.save(join(output, 'cover.svg'));
console.log(`Wrote local LLM glossary cover to ${output}`);
