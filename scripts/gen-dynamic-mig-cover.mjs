// Excalidraw-style cover for the HAMi dynamic MIG article.
// Same sketch helpers as scripts/gen-hami-diagrams.mjs.
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

// Cover: social-card aspect ratio, matching the trilogy's visual language.
{
  const sketch = new Sketch(1200, 630, '#f8fafc');
  sketch.text(64, 68, 'KUBESIMPLIFY · GPU SHARING', { size: 19, anchor: 'start', weight: 800, color: COLORS.green.stroke });
  sketch.lines(64, 158, ['Dynamic MIG in', 'Kubernetes with HAMi'], { size: 52, anchor: 'start', weight: 800, lineHeight: 1.12 });
  sketch.lines(64, 292, ['Hardware-isolated slices carved, grown, and re-carved', 'on demand on an 8× RTX PRO 6000 Kubernetes node.'], { size: 22, anchor: 'start', color: COLORS.muted, lineHeight: 1.38 });

  sketch.rect(70, 407, 515, 112, { stroke: COLORS.blue.stroke, fill: COLORS.blue.fill });
  sketch.text(327, 449, '4× 24GB idle  →  2× 48GB in ~35 s', { size: 24, weight: 800, color: COLORS.blue.stroke });
  sketch.text(327, 488, 'no drain · no eviction · no human', { size: 18, color: COLORS.muted });

  sketch.rect(720, 95, 390, 420, { stroke: COLORS.gray.stroke, fill: COLORS.gray.fill, strokeWidth: 3 });
  sketch.text(915, 138, 'one physical GPU', { size: 26, weight: 800 });
  sketch.text(915, 170, 'MIG mode on', { size: 20, color: COLORS.muted });

  const beforeY = 205;
  [750, 836, 922, 1008].forEach((x) => {
    sketch.rect(x, beforeY, 77, 95, { stroke: COLORS.green.stroke, fill: COLORS.green.fill });
    sketch.text(x + 38.5, beforeY + 42, '1g', { size: 18, weight: 700, color: COLORS.green.stroke });
    sketch.text(x + 38.5, beforeY + 68, '24gb', { size: 15, color: COLORS.muted });
  });

  sketch.arrow(915, 315, 915, 352, { stroke: COLORS.ink });

  const afterY = 365;
  [750, 922].forEach((x) => {
    sketch.rect(x, afterY, 163, 95, { stroke: COLORS.blue.stroke, fill: COLORS.blue.fill });
    sketch.text(x + 81.5, afterY + 55, '2g.48gb', { size: 19, weight: 700, color: COLORS.blue.stroke });
  });

  sketch.text(915, 487, 'hardware walls · scheduler lifecycle', { size: 18, color: COLORS.muted });
  sketch.text(64, 588, 'HAMi dynamic MIG · live re-slice captured on video', { size: 18, anchor: 'start', weight: 700, color: COLORS.orange.stroke });
  sketch.save(join(output, 'cover.svg'));
}

console.log(`Wrote dynamic MIG cover to ${output}`);
