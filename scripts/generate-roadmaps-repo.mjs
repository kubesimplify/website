#!/usr/bin/env node
/**
 * Generate the public kubesimplify/roadmaps repo content from
 * content/learning-paths.json, the same source of truth as /learn.
 *
 *   node scripts/generate-roadmaps-repo.mjs <output-dir>
 *
 * Flow: run this, then commit + push the output dir (a clone of
 * github.com/kubesimplify/roadmaps). Site and repo never drift because
 * both render the same JSON.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const OUT = process.argv[2] ? resolve(process.argv[2]) : null;
if (!OUT) {
  console.error('usage: node scripts/generate-roadmaps-repo.mjs <output-dir>');
  process.exit(1);
}
mkdirSync(OUT, { recursive: true });

const { paths } = JSON.parse(readFileSync(join(ROOT, 'content', 'learning-paths.json'), 'utf8'));
const SITE = 'https://kubesimplify.com';
const BLOG = 'https://blog.kubesimplify.com';

const ICON = { blog: '📖', video: '▶️', workshop: '🎓', playlist: '📺', book: '📕', lab: '⌨️', product: '🧩', tool: '🧩', path: '🗺️' };

function stepLine(step) {
  if (step.planned) {
    return `- [ ] 🚧 ${step.title} *(guide coming: [get notified](${SITE}/#newsletter))*`;
  }
  let href = null;
  let icon = '📖';
  if (step.blog) { href = `${BLOG}/${step.blog}`; icon = ICON.blog; }
  else if (step.video) { href = step.video; icon = ICON.video; }
  else if (step.workshop) { href = step.workshop; icon = ICON.workshop; }
  else if (step.playlist) { href = step.playlist; icon = ICON.playlist; }
  else if (step.book) { href = step.book; icon = ICON.book; }
  else if (step.lab) { href = step.lab; icon = ICON.lab; }
  else if (step.tool) { href = step.tool; icon = ICON.tool; }
  else if (step.product) { href = `${SITE}/products/${step.product}`; icon = ICON.product; }
  else if (step.path) { href = `${SITE}/learn/${step.path}`; icon = ICON.path; }
  return `- [ ] ${icon} [${step.title}](${href})`;
}

function pathMarkdown(p) {
  const total = p.stages.reduce((n, s) => n + s.steps.length, 0);
  const planned = p.stages.reduce((n, s) => n + s.steps.filter((x) => x.planned).length, 0);
  const lines = [
    `# ${p.emoji} ${p.name}`,
    '',
    `**${p.level}** · ${p.stages.length} stages · ${total - planned} resources ready · ${planned} guides on the way, all free`,
    '',
    `> ${p.description}`,
    '>',
    `> **Track your progress interactively** (checkpoints, missions, and a progress bar that remembers) at [kubesimplify.com/learn/${p.slug}](${SITE}/learn/${p.slug})`,
    '',
    'This is a **journey, not a map**: every stage ends with a checkpoint you can verify on a real system, and a hands-on mission to prove it.',
    '',
  ];
  p.stages.forEach((stage, i) => {
    lines.push(`## ${i + 1}. ${stage.title} \`~${stage.time}\``, '');
    if (stage.intro) lines.push(`*${stage.intro}*`, '');
    for (const step of stage.steps) lines.push(stepLine(step));
    lines.push(
      '',
      `> **✓ Checkpoint, you can now:** ${stage.outcome}`,
      '>',
      `> **⚡ Prove it:** ${stage.mission}`,
      '',
    );
  });
  lines.push(
    '---',
    '',
    `Maintained by [Kubesimplify](${SITE}) · [Blog](${BLOG}) · [YouTube](https://www.youtube.com/@kubesimplify) · [Hands-on labs](https://killercoda.com/saiyampathak)`,
    '',
    `Found a gap or a better resource of ours to slot in? [Open an issue](https://github.com/kubesimplify/roadmaps/issues).`,
    '',
  );
  return lines.join('\n');
}

const order = ['kubernetes', 'docker', 'devops', 'ai-infra'];
const fileFor = { kubernetes: 'kubernetes.md', docker: 'docker.md', devops: 'devops.md', 'ai-infra': 'ai-infrastructure.md' };

for (const slug of order) {
  const p = paths.find((x) => x.slug === slug);
  writeFileSync(join(OUT, fileFor[slug]), pathMarkdown(p));
}

const totals = order.map((slug) => {
  const p = paths.find((x) => x.slug === slug);
  const total = p.stages.reduce((n, s) => n + s.steps.length, 0);
  const planned = p.stages.reduce((n, s) => n + s.steps.filter((x) => x.planned).length, 0);
  return { p, total, planned };
});

const readme = `# Cloud Native Journeys

### Don't just learn it. Prove it.

Free learning journeys for **Kubernetes, Docker, DevOps, and AI infrastructure**, written by practitioners from real production experience.

A roadmap shows you a map of topics and wishes you luck. A **journey** walks one opinionated line through a domain, and every stage ends with two things no topic map can give you:

- **✓ Checkpoint**: a skill you can verify, not a box you clicked. *"Answer 'what happens when I kubectl apply' end to end."*
- **⚡ Prove it**: a mission on a real cluster. *"Break etcd on purpose and recover it."* *"Lock down a namespace so a compromised pod can reach nothing but its own database."*

Finish a journey and you have not read about the job. You have done the job.

| Journey | Level | Stages | Ready | Coming |
|---|---|---|---|---|
${totals.map(({ p, total, planned }) => `| ${p.emoji} [${p.name}](${fileFor[p.slug]}) | ${p.level} | ${p.stages.length} | ${total - planned} | ${planned} |`).join('\n')}

**Prefer progress tracking?** The same journeys live at [kubesimplify.com/learn](https://kubesimplify.com/learn) with checkboxes that remember where you left off.

## Why this is different

- **Missions, not trivia.** Every stage is proven on a real system. Interviews reward what you have done, and so do we.
- **Practitioners first.** Curated by the Kubesimplify team (KubeCon co-chair, CNCF TAG chair, Docker Captain, CNCF Ambassador) from what production systems actually run, not from what is trending.
- **Our own content only.** Every linked article, video, and workshop is ours and free. No affiliate links, no paywalls, ever.
- **Honest gaps.** When the right guide does not exist yet, the slot says 🚧 *guide coming*, and then we go create it. [Subscribe](https://kubesimplify.com/#newsletter) to know when new guides ship.

## Contributing

Spot a gap, a stale resource, or a better ordering? [Open an issue](https://github.com/kubesimplify/roadmaps/issues). The journeys are generated from the same source that powers the website, so accepted changes ship everywhere at once.

## License

Content is [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Attribution: Kubesimplify (kubesimplify.com).
`;
writeFileSync(join(OUT, 'README.md'), readme);
console.log(`Wrote README + ${order.length} journeys to ${OUT}`);
