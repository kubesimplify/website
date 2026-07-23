// Excalidraw-style diagrams for the HAMi GPU sharing article.
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

let seed = 73;
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
        const id = `hami-clip-${this.clipId++}`;
        this.defs.push(`<clipPath id="${id}"><rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${radius}"/></clipPath>`);
        const hatch = [];
        for (let offset = -height; offset < width; offset += 11) {
          hatch.push(roughLine(x + offset, y + height, x + offset + height, y, 1));
        }
        this.add(`<path d="${hatch.join(' ')}" stroke="${fill}" stroke-width="2.5" opacity="0.58" fill="none" clip-path="url(#${id})" stroke-linecap="round"/>`);
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

  circle(x, y, radius, options = {}) {
    const { stroke = COLORS.ink, fill, strokeWidth = 2.4 } = options;
    if (fill) this.add(`<circle cx="${x}" cy="${y}" r="${radius}" fill="${fill}" fill-opacity="0.65"/>`);
    this.add(`<path d="M ${x - radius + jitter(1.5)} ${y} C ${x - radius} ${y - radius}, ${x + radius} ${y - radius}, ${x + radius + jitter(1.5)} ${y} C ${x + radius} ${y + radius}, ${x - radius} ${y + radius}, ${x - radius + jitter(1.5)} ${y}" stroke="${stroke}" stroke-width="${strokeWidth}" fill="none"/>`);
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

// Cover: a dedicated social-card aspect ratio, not a copy of an inline diagram.
{
  const sketch = new Sketch(1200, 630, '#f8fafc');
  sketch.text(64, 68, 'KUBESIMPLIFY · GPU SHARING', { size: 19, anchor: 'start', weight: 800, color: COLORS.green.stroke });
  sketch.lines(64, 158, ['Sharing GPUs in', 'Kubernetes with HAMi'], { size: 52, anchor: 'start', weight: 800, lineHeight: 1.12 });
  sketch.lines(64, 292, ['Flexible memory and compute limits in software,', 'tested on an 8× RTX PRO 6000 Kubernetes node.'], { size: 22, anchor: 'start', color: COLORS.muted, lineHeight: 1.38 });

  sketch.rect(70, 407, 515, 112, { stroke: COLORS.blue.stroke, fill: COLORS.blue.fill });
  sketch.text(327, 449, '8 physical GPUs  →  80 scheduling slots', { size: 24, weight: 800, color: COLORS.blue.stroke });
  sketch.text(327, 488, 'slots multiply · hardware capacity does not', { size: 18, color: COLORS.muted });

  sketch.rect(720, 95, 390, 420, { stroke: COLORS.gray.stroke, fill: COLORS.gray.fill, strokeWidth: 3 });
  sketch.text(915, 138, 'one physical GPU', { size: 26, weight: 800 });
  sketch.text(915, 170, '97,887 MiB', { size: 20, color: COLORS.muted });

  const pods = [
    { x: 760, y: 212, w: 145, h: 105, memory: '8 GB', cores: '10%', color: COLORS.green },
    { x: 925, y: 212, w: 145, h: 105, memory: '12 GB', cores: '20%', color: COLORS.blue },
    { x: 760, y: 338, w: 145, h: 105, memory: '20 GB', cores: '25%', color: COLORS.orange },
    { x: 925, y: 338, w: 145, h: 105, memory: '40 GB', cores: '45%', color: COLORS.violet },
  ];
  pods.forEach((pod, index) => {
    sketch.rect(pod.x, pod.y, pod.w, pod.h, { stroke: pod.color.stroke, fill: pod.color.fill });
    sketch.text(pod.x + pod.w / 2, pod.y + 35, `pod ${index + 1}`, { size: 19, weight: 800, color: pod.color.stroke });
    sketch.text(pod.x + pod.w / 2, pod.y + 67, `${pod.memory} · ${pod.cores}`, { size: 17 });
  });
  sketch.text(915, 487, 'software-enforced boundaries', { size: 18, color: COLORS.muted });
  sketch.text(64, 588, 'HAMi v2.9.0 · real commands · real OOM test', { size: 18, anchor: 'start', weight: 700, color: COLORS.orange.stroke });
  sketch.save(join(output, 'cover.svg'));
}

// Architecture: scheduling and runtime enforcement are distinct stages.
{
  const sketch = new Sketch(1600, 920);
  sketch.text(800, 62, 'What happens to one HAMi GPU request?', { size: 42, weight: 800 });
  sketch.text(800, 100, 'placement first · injection second · enforcement while the process runs', { size: 22, color: COLORS.muted });

  const topY = 170;
  const topBoxes = [
    { x: 65, title: 'Pod spec', lines: ['gpu: 1', 'gpumem: 8000', 'gpucores: 10'], color: COLORS.blue },
    { x: 375, title: 'Webhook', lines: ['recognizes HAMi', 'resources and sets', 'schedulerName'], color: COLORS.violet },
    { x: 685, title: 'Scheduler extender', lines: ['Filter: can it fit?', 'Score: which GPU?', 'Bind: write UUID'], color: COLORS.orange },
    { x: 995, title: 'Pod annotation', lines: ['GPU UUID', '8000 MiB', '10% compute'], color: COLORS.teal },
  ];

  topBoxes.forEach((box, index) => {
    sketch.rect(box.x, topY, 245, 205, { stroke: box.color.stroke, fill: box.color.fill });
    sketch.text(box.x + 122, topY + 42, `${index + 1}. ${box.title}`, { size: 23, weight: 800, color: box.color.stroke });
    sketch.lines(box.x + 122, topY + 88, box.lines, { size: 18, lineHeight: 1.35 });
    if (index < topBoxes.length - 1) sketch.arrow(box.x + 252, topY + 102, topBoxes[index + 1].x - 10, topY + 102, { stroke: COLORS.ink });
  });

  sketch.arrow(1118, 385, 1118, 490, { stroke: COLORS.teal.stroke });

  const bottomY = 510;
  const bottomBoxes = [
    { x: 995, title: 'Device plugin', lines: ['/dev/nvidia*', 'libvgpu.so', '/etc/ld.so.preload'], color: COLORS.teal },
    { x: 685, title: 'Workload container', lines: ['normal PyTorch or', 'CUDA application', 'no code change'], color: COLORS.blue },
    { x: 375, title: 'HAMi-Core', lines: ['tracks this container', 'returns OOM past', 'its memory grant'], color: COLORS.red },
    { x: 65, title: 'Physical GPU', lines: ['accepted CUDA work', 'runs on the real', 'RTX PRO 6000'], color: COLORS.gray },
  ];

  bottomBoxes.forEach((box, index) => {
    sketch.rect(box.x, bottomY, 245, 205, { stroke: box.color.stroke, fill: box.color.fill });
    sketch.text(box.x + 122, bottomY + 42, `${index + 5}. ${box.title}`, { size: 23, weight: 800, color: box.color.stroke });
    sketch.lines(box.x + 122, bottomY + 88, box.lines, { size: 18, lineHeight: 1.35 });
    if (index < bottomBoxes.length - 1) sketch.arrow(box.x - 10, bottomY + 102, bottomBoxes[index + 1].x + 252, bottomY + 102, { stroke: COLORS.ink });
  });

  sketch.rect(1285, 178, 255, 190, { stroke: COLORS.orange.stroke, fill: COLORS.orange.fill, dashed: true });
  sketch.text(1412, 219, 'Scheduling boundary', { size: 22, weight: 800, color: COLORS.orange.stroke });
  sketch.lines(1412, 260, ['slot available?', 'memory available?', 'compute available?'], { size: 18, lineHeight: 1.45 });
  sketch.arrow(1282, 275, 935, 275, { stroke: COLORS.orange.stroke, dashed: true });

  sketch.rect(1285, 520, 255, 190, { stroke: COLORS.red.stroke, fill: COLORS.red.fill, dashed: true });
  sketch.text(1412, 561, 'Runtime boundary', { size: 22, weight: 800, color: COLORS.red.stroke });
  sketch.lines(1412, 602, ['CUDA/NVML paths', 'inside the process', 'software-enforced'], { size: 18, lineHeight: 1.45 });
  sketch.arrow(1282, 615, 615, 615, { stroke: COLORS.red.stroke, dashed: true });

  sketch.text(800, 855, 'The scheduler prevents over-commit at placement; HAMi-Core enforces the chosen grant at runtime.', { size: 23, color: COLORS.muted });
  sketch.save(join(output, 'hami-architecture.svg'));
}

// Comparison: accurate boundaries for time-slicing, HAMi, and MIG.
{
  const sketch = new Sketch(1600, 790);
  sketch.text(800, 62, 'Three ways to share one GPU', { size: 42, weight: 800 });
  sketch.text(800, 100, 'same goal, very different isolation boundary', { size: 22, color: COLORS.muted });

  const columns = [
    { x: 75, title: 'Time-slicing', color: COLORS.orange, boundary: 'scheduler slots only', footer: ['no per-pod VRAM cap', 'all replicas see the full card'] },
    { x: 590, title: 'HAMi', color: COLORS.green, boundary: 'user-space CUDA/NVML hooks', footer: ['arbitrary MiB + 1% core steps', 'best-effort software isolation'] },
    { x: 1105, title: 'MIG', color: COLORS.blue, boundary: 'hardware partitions', footer: ['fixed profiles on supported GPUs', 'strong memory + compute isolation'] },
  ];

  columns.forEach((column) => {
    sketch.text(column.x + 205, 155, column.title, { size: 30, weight: 800, color: column.color.stroke });
    sketch.rect(column.x, 185, 410, 390, { stroke: COLORS.ink, strokeWidth: 3 });
    sketch.text(column.x + 205, 222, column.boundary, { size: 18, color: COLORS.muted });

    if (column.title === 'Time-slicing') {
      ['pod A', 'pod B', 'pod C'].forEach((name, index) => {
        sketch.rect(column.x + 50 + index * 108, 280, 92, 88, { stroke: column.color.stroke, fill: column.color.fill });
        sketch.text(column.x + 96 + index * 108, 333, name, { size: 18, weight: 700 });
      });
      sketch.arrow(column.x + 75, 430, column.x + 335, 430, { stroke: column.color.stroke });
      sketch.text(column.x + 205, 472, 'take turns on one open card', { size: 19 });
    }

    if (column.title === 'HAMi') {
      const widths = [90, 135, 105];
      let left = column.x + 32;
      widths.forEach((width, index) => {
        sketch.rect(left, 272, width, 180, { stroke: column.color.stroke, fill: column.color.fill, dashed: index === 1 });
        sketch.text(left + width / 2, 325, `pod ${String.fromCharCode(65 + index)}`, { size: 17, weight: 700 });
        sketch.text(left + width / 2, 360, ['8 GB', '20 GB', '12 GB'][index], { size: 18 });
        sketch.text(left + width / 2, 392, ['10%', '35%', '15%'][index], { size: 17, color: COLORS.muted });
        left += width + 13;
      });
      sketch.text(column.x + 205, 500, 'shared silicon, separate accounts', { size: 19 });
    }

    if (column.title === 'MIG') {
      for (let row = 0; row < 2; row += 1) {
        for (let col = 0; col < 2; col += 1) {
          const x = column.x + 42 + col * 174;
          const y = 262 + row * 125;
          sketch.rect(x, y, 152, 105, { stroke: column.color.stroke, fill: column.color.fill, strokeWidth: 2.8 });
          sketch.text(x + 76, y + 48, '1g.24gb', { size: 19, weight: 700 });
          sketch.text(x + 76, y + 78, 'own SMs', { size: 16, color: COLORS.muted });
        }
      }
      sketch.text(column.x + 205, 520, 'walls are built into the GPU', { size: 19 });
    }

    sketch.lines(column.x + 205, 630, column.footer, { size: 20, color: column.color.stroke, weight: 700, lineHeight: 1.45 });
  });

  sketch.text(800, 750, 'Choose flexibility, simplicity, or the strongest boundary based on the workload, not the buzzword.', { size: 23, color: COLORS.muted });
  sketch.save(join(output, 'hami-isolation-spectrum.svg'));
}

console.log(`Wrote HAMi diagrams to ${output}`);
