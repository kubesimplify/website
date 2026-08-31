// Excalidraw-style cake diagram for the multi-GPU vLLM article.
// Replaces an AI-generated raster whose layer axis had a duplicated tick.
// Usage: node scripts/gen-multi-gpu-cake-diagram.mjs [outputDir]
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

let seed = 91;
const random = () => {
  seed = (seed * 16807) % 2147483647;
  return seed / 2147483647;
};
const jitter = (amount) => (random() - 0.5) * amount * 2;

const COLORS = {
  ink: '#172033',
  muted: '#5c677d',
  blue: { stroke: '#1971c2', fill: '#a5d8ff' },
  green: { stroke: '#5d8f00', fill: '#d8f5a2' },
  violet: { stroke: '#862e9c', fill: '#eebefa' },
};

const FONT = 'Chalkboard SE, Comic Sans MS, sans-serif';

function roughLine(x1, y1, x2, y2, amount = 1.8) {
  const mx = (x1 + x2) / 2 + jitter(amount * 1.5);
  const my = (y1 + y2) / 2 + jitter(amount * 1.5);
  return `M ${(x1 + jitter(amount)).toFixed(1)} ${(y1 + jitter(amount)).toFixed(1)} Q ${mx.toFixed(1)} ${my.toFixed(1)} ${(x2 + jitter(amount)).toFixed(1)} ${(y2 + jitter(amount)).toFixed(1)}`;
}

class Sketch {
  constructor(width, height, background = '#f8fafc') {
    Object.assign(this, { width, height, background, parts: [], defs: [] });
  }

  add(value) { this.parts.push(value); }

  rect(x, y, w, h, options = {}) {
    const { stroke = COLORS.ink, fill, strokeWidth = 2.2, radius = 5, dashed = false } = options;
    if (fill) this.add(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${radius}" fill="${fill}" fill-opacity="0.62"/>`);
    const pts = [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
    const d = pts.map((p, i) => {
      const n = pts[(i + 1) % pts.length];
      return roughLine(p[0], p[1], n[0], n[1], 1.1);
    }).join(' ');
    this.add(`<path d="${d}" stroke="${stroke}" stroke-width="${strokeWidth}" fill="none" stroke-linecap="round"${dashed ? ' stroke-dasharray="8 7"' : ''}/>`);
  }

  line(x1, y1, x2, y2, options = {}) {
    const { stroke = COLORS.ink, strokeWidth = 2.2, dashed = false } = options;
    this.add(`<path d="${roughLine(x1, y1, x2, y2)}" stroke="${stroke}" stroke-width="${strokeWidth}" fill="none" stroke-linecap="round"${dashed ? ' stroke-dasharray="7 6"' : ''}/>`);
  }

  arrow(x1, y1, x2, y2, options = {}) {
    const { stroke = COLORS.ink, strokeWidth = 2.4 } = options;
    this.line(x1, y1, x2, y2, { stroke, strokeWidth });
    const angle = Math.atan2(y2 - y1, x2 - x1);
    for (const off of [Math.PI * 0.84, -Math.PI * 0.84]) {
      this.line(x2, y2, x2 + 12 * Math.cos(angle + off), y2 + 12 * Math.sin(angle + off), { stroke, strokeWidth });
    }
  }

  text(x, y, value, options = {}) {
    const { size = 20, color = COLORS.ink, anchor = 'middle', weight = 600 } = options;
    const safe = String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    this.add(`<text x="${x}" y="${y}" font-family="${FONT}" font-size="${size}" font-weight="${weight}" fill="${color}" text-anchor="${anchor}">${safe}</text>`);
  }

  lines(x, y, values, options = {}) {
    const lh = (options.size || 20) * (options.lineHeight || 1.3);
    values.forEach((v, i) => this.text(x, y + i * lh, v, options));
  }

  save(path) {
    writeFileSync(path, `<svg xmlns="http://www.w3.org/2000/svg" width="${this.width}" height="${this.height}" viewBox="0 0 ${this.width} ${this.height}" role="img">
<defs>${this.defs.join('')}</defs>
<rect width="${this.width}" height="${this.height}" fill="${this.background}"/>
${this.parts.join('\n')}
</svg>`);
  }
}

const LAYERS = 10;
const GPUS = [
  { label: 'GPU 1', color: COLORS.blue },
  { label: 'GPU 2', color: COLORS.green },
  { label: 'GPU 3', color: COLORS.violet },
];
// 10 layers over 3 GPUs cannot be even, which is the point the prose makes
// about the ends of the model not being symmetric.
const PIPELINE_GROUPS = [[1, 3], [4, 6], [7, 10]];

const output = process.argv[2] || '.';
mkdirSync(output, { recursive: true });

const W = 1200;
const H = 620;
const s = new Sketch(W, H);

const CAKE_W = 210;
const LAYER_H = 34;
const TOP = 132;
const CAKE_H = LAYERS * LAYER_H;

function panel(originX, title, subtitle, mode) {
  const cakeX = originX + 92;

  s.text(originX + 250, 54, title, { size: 26, weight: 800, anchor: 'middle' });
  s.text(originX + 250, 84, subtitle, { size: 17, weight: 500, color: COLORS.muted, anchor: 'middle' });

  // One rect per layer. Exactly LAYERS of them, numbered once each.
  for (let i = 0; i < LAYERS; i += 1) {
    const y = TOP + i * LAYER_H;
    const n = i + 1;
    let fill;
    if (mode === 'pipeline') {
      const gi = PIPELINE_GROUPS.findIndex(([lo, hi]) => n >= lo && n <= hi);
      fill = GPUS[gi].color.fill;
    }
    s.rect(cakeX, y, CAKE_W, LAYER_H - 4, { fill, radius: 4 });
    s.text(cakeX - 18, y + LAYER_H / 2 + 2, String(n), { size: 16, weight: 600, color: COLORS.muted, anchor: 'end' });
  }

  s.text(cakeX - 18, TOP - 14, 'layer', { size: 13, weight: 600, color: COLORS.muted, anchor: 'end' });

  if (mode === 'pipeline') {
    // Horizontal cuts between groups, plus a bracket and label per GPU.
    PIPELINE_GROUPS.forEach(([lo, hi], gi) => {
      if (gi > 0) {
        const cutY = TOP + (lo - 1) * LAYER_H - 2;
        s.line(cakeX - 8, cutY, cakeX + CAKE_W + 8, cutY, { stroke: COLORS.ink, strokeWidth: 2.6, dashed: true });
      }
      const midY = TOP + ((lo - 1) + (hi - lo + 1) / 2) * LAYER_H - 2;
      const g = GPUS[gi];
      s.arrow(cakeX + CAKE_W + 14, midY, cakeX + CAKE_W + 54, midY, { stroke: g.color.stroke });
      s.rect(cakeX + CAKE_W + 60, midY - 24, 132, 48, { fill: g.color.fill, stroke: g.color.stroke, radius: 8 });
      s.text(cakeX + CAKE_W + 126, midY - 4, g.label, { size: 17, weight: 800, color: g.color.stroke });
      s.text(cakeX + CAKE_W + 126, midY + 16, `layers ${lo}–${hi}`, { size: 14, weight: 500, color: COLORS.muted });
    });
  } else {
    // Vertical cuts: every GPU owns a strip of all LAYERS layers.
    const stripW = CAKE_W / GPUS.length;
    GPUS.forEach((g, gi) => {
      if (gi > 0) {
        const cutX = cakeX + gi * stripW;
        s.line(cutX, TOP - 8, cutX, TOP + CAKE_H + 4, { stroke: COLORS.ink, strokeWidth: 2.6, dashed: true });
      }
      const midY = TOP + CAKE_H * (0.2 + gi * 0.3);
      s.arrow(cakeX + CAKE_W + 14, midY, cakeX + CAKE_W + 54, midY, { stroke: g.color.stroke });
      s.rect(cakeX + CAKE_W + 60, midY - 24, 132, 48, { fill: g.color.fill, stroke: g.color.stroke, radius: 8 });
      s.text(cakeX + CAKE_W + 126, midY - 4, g.label, { size: 17, weight: 800, color: g.color.stroke });
      s.text(cakeX + CAKE_W + 126, midY + 16, `1/3 of all ${LAYERS}`, { size: 14, weight: 500, color: COLORS.muted });
    });
    // Tint each strip so the vertical ownership reads at a glance.
    GPUS.forEach((g, gi) => {
      s.add(`<rect x="${cakeX + gi * stripW}" y="${TOP}" width="${stripW}" height="${CAKE_H - 4}" fill="${g.color.fill}" fill-opacity="0.34"/>`);
    });
  }
}

panel(30, 'PIPELINE PARALLELISM', 'Layers are cut. Each GPU owns a block of whole layers.', 'pipeline');
panel(620, 'TENSOR PARALLELISM', 'Layers are not cut. Every GPU owns a slice of each one.', 'tensor');

// Divider between the two panels.
s.line(600, 40, 600, H - 74, { stroke: '#cbd5e1', strokeWidth: 2, dashed: true });

// Footers.
s.lines(280, H - 46, [
  'Work moves down the line, one stage at a time.',
  'Little chatter, but GPUs wait their turn.',
], { size: 15, weight: 500, color: COLORS.muted, anchor: 'middle', lineHeight: 1.35 });
s.lines(870, H - 46, [
  'All GPUs work on the same token at once.',
  'Fast, but they must compare notes every layer.',
], { size: 15, weight: 500, color: COLORS.muted, anchor: 'middle', lineHeight: 1.35 });

s.save(join(output, 'cake-layers.svg'));
console.log(`wrote ${join(output, 'cake-layers.svg')}  (${LAYERS} layers, ${GPUS.length} GPUs)`);
