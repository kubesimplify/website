// Excalidraw-style cover for the multi-GPU vLLM article.
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

sketch.text(64, 82, 'One big model, four GPUs', { size: 50, weight: 800, anchor: 'start' });
sketch.text(64, 119, 'how a 235B model is cut up so it fits, and what that costs', {
  size: 22,
  color: COLORS.muted,
  anchor: 'start',
});
sketch.line(64, 139, 760, 139, { stroke: COLORS.muted, strokeWidth: 1.6, dashed: true });

// ── left: the model does not fit on one card ──────────────
sketch.text(64, 186, 'ONE CARD', { size: 18, weight: 800, anchor: 'start', color: COLORS.red.stroke });

const bY = 206;
sketch.rect(64, bY, 210, 132, { stroke: COLORS.gray.stroke, fill: '#ffffff', hachure: false, dashed: true });
sketch.text(169, bY + 30, '95 GiB', { size: 19, color: COLORS.muted });
sketch.text(169, bY + 54, 'usable', { size: 15, color: COLORS.muted });

// overflowing weights bar
sketch.rect(78, bY + 72, 330, 46, { stroke: COLORS.red.stroke, fill: COLORS.red.fill });
sketch.text(200, bY + 95, '236 GB of weights', { size: 19, weight: 800, color: COLORS.red.stroke });

sketch.text(64, bY + 164, '2.3x too big', { size: 26, weight: 800, anchor: 'start', color: COLORS.red.stroke });
sketch.text(64, bY + 192, 'no flag fixes this', { size: 16, anchor: 'start', color: COLORS.muted });

// ── divider ───────────────────────────────────────────────
sketch.line(452, 186, 452, 452, { stroke: COLORS.muted, strokeWidth: 1.6, dashed: true });

// ── right: four cards, each holds a quarter ───────────────
sketch.text(516, 186, 'FOUR CARDS, --tensor-parallel-size 4', {
  size: 18,
  weight: 800,
  anchor: 'start',
  color: COLORS.teal.stroke,
});

const cw = 145;
const gap = 10;
const gY = 206;
const palette = [COLORS.blue, COLORS.green, COLORS.violet, COLORS.orange];
[0, 1, 2, 3].forEach((gpu) => {
  const x = 516 + gpu * (cw + gap);
  const c = palette[gpu];
  sketch.rect(x, gY, cw, 132, { stroke: c.stroke, fill: c.fill });
  sketch.text(x + cw / 2, gY + 30, `GPU ${gpu}`, { size: 20, weight: 800, color: c.stroke });
  sketch.text(x + cw / 2, gY + 60, '59 GB', { size: 18, weight: 700 });
  sketch.text(x + cw / 2, gY + 84, 'weights', { size: 14, color: COLORS.muted });
  sketch.text(x + cw / 2, gY + 112, '16 of 64 heads', { size: 13, color: COLORS.muted });
});

// all-reduce arrows under the row of cards
const arrowY = gY + 154;
sketch.line(516 + 40, arrowY, 516 + 3 * (cw + gap) + cw - 40, arrowY, {
  stroke: COLORS.violet.stroke,
  dashed: true,
});
sketch.text(516 + (3 * (cw + gap) + cw) / 2, arrowY + 30, '188 all-reduces per token', {
  size: 18,
  weight: 800,
  color: COLORS.violet.stroke,
});

// ── footer ────────────────────────────────────────────────
sketch.line(64, 516, W - 64, 516, { stroke: COLORS.muted, strokeWidth: 1.6 });
sketch.text(64, 552, 'QWEN3-235B-A22B FP8 - 128 EXPERTS, 8 PER TOKEN - vLLM 0.27.1', {
  size: 18,
  weight: 800,
  anchor: 'start',
  color: COLORS.ink,
});
sketch.text(64, 582, 'tensor, pipeline and expert parallelism explained in plain english', {
  size: 16,
  anchor: 'start',
  color: COLORS.muted,
});
sketch.text(W - 64, 582, 'blog.kubesimplify.com', {
  size: 16,
  weight: 700,
  anchor: 'end',
  color: COLORS.muted,
});

sketch.save(join(output, 'cover.svg'));
console.log(`Wrote multi-GPU vLLM cover to ${output}`);
