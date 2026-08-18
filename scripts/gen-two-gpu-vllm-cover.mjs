// Excalidraw-style cover for the two-GPU vLLM article.
// Sketch helpers shared with scripts/gen-hami-diagrams.mjs.
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
sketch.text(64, 84, 'One LLM, two GPUs', { size: 52, weight: 800, anchor: 'start' });
sketch.text(64, 122, 'tensor parallelism splits every layer, not the stack', {
  size: 23,
  color: COLORS.muted,
  anchor: 'start',
});
sketch.line(64, 142, 700, 142, { stroke: COLORS.muted, strokeWidth: 1.6, dashed: true });

// ── left: one card fails ─────────────────────────────────
sketch.text(64, 190, 'ONE 45 GiB CARD', { size: 19, weight: 800, anchor: 'start', color: COLORS.red.stroke });

const boxY = 210;
sketch.rect(64, boxY, 300, 150, { stroke: COLORS.gray.stroke, fill: '#ffffff', hachure: false, dashed: true });
sketch.text(214, boxY + 34, 'budget 40.47 GiB', { size: 17, color: COLORS.muted });

// the weights bar overflowing the box
sketch.rect(80, boxY + 52, 330, 62, { stroke: COLORS.red.stroke, fill: COLORS.red.fill });
sketch.text(200, boxY + 80, 'weights 61.03 GiB', { size: 20, weight: 800, color: COLORS.red.stroke });
sketch.text(200, boxY + 103, 'does not fit', { size: 16, color: COLORS.muted });

sketch.text(64, boxY + 182, 'Available KV cache memory:', { size: 17, anchor: 'start', color: COLORS.muted });
sketch.text(64, boxY + 208, '-24.42 GiB', { size: 30, weight: 800, anchor: 'start', color: COLORS.red.stroke });

// ── middle divider ───────────────────────────────────────
sketch.line(470, 190, 470, 470, { stroke: COLORS.muted, strokeWidth: 1.6, dashed: true });
sketch.text(470, 340, 'vs', { size: 26, weight: 800, color: COLORS.muted });

// ── right: two cards work ────────────────────────────────
sketch.text(560, 190, 'TWO CARDS, --tensor-parallel-size 2', {
  size: 19,
  weight: 800,
  anchor: 'start',
  color: COLORS.teal.stroke,
});

const cardW = 246;
const cardGap = 84;
const gpuY = 210;
[0, 1].forEach((gpu) => {
  const x = 560 + gpu * (cardW + cardGap);
  const accent = gpu === 0 ? COLORS.blue : COLORS.green;
  sketch.rect(x, gpuY, cardW, 150, { stroke: accent.stroke, fill: accent.fill });
  sketch.text(x + cardW / 2, gpuY + 34, `GPU ${gpu}`, { size: 22, weight: 800, color: accent.stroke });
  sketch.text(x + cardW / 2, gpuY + 66, 'weights 30.59 GiB', { size: 18, weight: 700 });
  sketch.text(x + cardW / 2, gpuY + 94, 'KV cache 8.22 GiB', { size: 17, color: COLORS.muted });
  sketch.text(x + cardW / 2, gpuY + 124, gpu === 0 ? 'heads 0-31' : 'heads 32-63', {
    size: 16,
    color: COLORS.muted,
  });
});

// all-reduce link between the two cards
const gapL = 560 + cardW + 10;
const gapR = 560 + cardW + cardGap - 10;
const gapMid = (gapL + gapR) / 2;
const linkY = gpuY + 66;
sketch.arrow(gapL, linkY, gapR, linkY, { stroke: COLORS.violet.stroke });
sketch.arrow(gapR, linkY + 24, gapL, linkY + 24, { stroke: COLORS.violet.stroke });
sketch.text(gapMid, gapMid && linkY + 60, 'all-', { size: 15, weight: 700, color: COLORS.violet.stroke });
sketch.text(gapMid, linkY + 80, 'reduce', { size: 15, weight: 700, color: COLORS.violet.stroke });

sketch.text(560, gpuY + 182, 'GPU KV cache size:', { size: 17, anchor: 'start', color: COLORS.muted });
sketch.text(560, gpuY + 208, '67,296 tokens', {
  size: 30,
  weight: 800,
  anchor: 'start',
  color: COLORS.teal.stroke,
});
sketch.text(830, gpuY + 208, '2.05x concurrency', { size: 18, anchor: 'start', color: COLORS.muted });

// ── footer strip ─────────────────────────────────────────
sketch.line(64, 520, W - 64, 520, { stroke: COLORS.muted, strokeWidth: 1.6 });
sketch.text(64, 556, 'QWEN3-32B BF16 - 61.02 GiB CHECKPOINT - vLLM 0.27.1', {
  size: 19,
  weight: 800,
  anchor: 'start',
  color: COLORS.ink,
});
sketch.text(64, 586, '2 x 128 all-reduces per token, no NVLink, measured not estimated', {
  size: 17,
  anchor: 'start',
  color: COLORS.muted,
});
sketch.text(W - 64, 586, 'blog.kubesimplify.com', {
  size: 17,
  weight: 700,
  anchor: 'end',
  color: COLORS.muted,
});

sketch.save(join(output, 'cover.svg'));
console.log(`Wrote two-GPU vLLM cover to ${output}`);
