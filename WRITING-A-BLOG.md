# Writing a blog post for Kubesimplify

This is the step-by-step guide for contributing a post to the [Kubesimplify blog](https://blog.kubesimplify.com). Every post is a single Markdown file in this repo, so writing for us means opening a pull request, nothing more. You keep your byline, the canonical URL, and the SEO value, and we promote it across YouTube, X, LinkedIn, and Substack.

If you just want the short version, it lives on the site at [blog.kubesimplify.com/write](https://blog.kubesimplify.com/write). The guide below is the long, do-it-yourself version.

## How the blog is built

A few facts that make the rest of this guide make sense:

- The site is a **Next.js** static site. There is no CMS and no database.
- Each post is one **Markdown file** in [`content/blog/`](content/blog/). The filename (minus `.md`) is the post's URL slug.
- Authors live in [`content/authors.json`](content/authors.json). Images live in `public/img/`.
- On merge to `main`, the site rebuilds and deploys automatically. Your post is live within minutes.

> Note: the older `CONTRIBUTING.md` mentions Docusaurus and Yarn. That is out of date. The current stack is Next.js with npm, as described here.

## Prerequisites

- **Node.js** 18 or newer (`node -v`)
- **npm** (ships with Node) (`npm -v`)
- **git** and a **GitHub account**
- A text editor you are comfortable writing Markdown in

You do not strictly need to run the site locally to contribute, but previewing your post before you open the PR catches almost every formatting problem, so it is worth the five minutes.

---

## Step 1: Fork and clone the repo

1. Click **Fork** on [github.com/kubesimplify/website](https://github.com/kubesimplify/website).
2. Clone your fork:

   ```bash
   git clone https://github.com/<your-github-username>/website.git
   cd website
   ```

3. Add the original repo as `upstream` so you can pull in updates later:

   ```bash
   git remote add upstream https://github.com/kubesimplify/website.git
   ```

4. Create a branch for your post (name it after your slug):

   ```bash
   git checkout -b blog/my-post-slug
   ```

## Step 2: Run the site locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000/blog](http://localhost:3000/blog). The dev server hot-reloads, so as you edit your Markdown file the page updates instantly. Drafts (`draft: true`) are visible in dev but hidden in production, which is exactly what you want while writing.

## Step 3: Add yourself as an author

Open [`content/authors.json`](content/authors.json) and add an entry. The key is your **handle** (lowercase, kebab-case); you will reference it from your post's frontmatter.

```json
"your-handle": {
  "handle": "your-handle",
  "name": "Your Name",
  "avatar": "/img/authors/your-handle.jpg",
  "bio": "One or two sentences about you. Shown on your author page and in schema.org metadata.",
  "socials": {
    "twitter": "https://x.com/you",
    "linkedin": "https://www.linkedin.com/in/you/",
    "github": "https://github.com/you",
    "youtube": "https://www.youtube.com/@you",
    "hashnode": "https://hashnode.com/@you"
  }
}
```

- Every field except `handle` and `name` is optional. Leave `bio` as `""` if you would rather not have one; it is then hidden.
- Drop your avatar image in `public/img/authors/your-handle.jpg` (or `.png`/`.jpeg`). Square images look best. If you skip it, a default Kubesimplify logo is used.
- `socials` keys are free-form; the ones above are the common ones. Each becomes a `sameAs` link in your structured data.

If you skip this step entirely, your post still publishes, but it falls back to the generic "Kubesimplify" byline. Add yourself; it is worth it.

## Step 4: Create your post file

Create `content/blog/<your-slug>.md`. **Name the file exactly the same as your slug** so the automatic "Edit this page on GitHub" link resolves correctly.

Start the file with frontmatter (the block between the `---` lines), then write your post in Markdown below it:

```markdown
---
title: "Your post title"
seoTitle: "SEO-optimized version of the title"
seoDescription: "1-2 sentence summary used as the meta description. Aim for under 160 characters."
datePublished: 2026-06-29T10:00:00.000Z
slug: your-slug
author: your-handle
cover: /img/blog/your-slug/cover.png
tags: ["kubernetes", "devops"]
---

Your post content starts here, in plain Markdown.
```

### Frontmatter field reference

| Field | Required | What it does |
| --- | --- | --- |
| `datePublished` | **Yes** | ISO 8601 timestamp. **A post with no `datePublished` will not appear at all.** Posts are sorted newest-first by this value. |
| `title` | Yes | The post's `<h1>` and the default for `seoTitle`. |
| `slug` | Recommended | The URL path (`blog.kubesimplify.com/<slug>`). Defaults to the filename if omitted. **Slugs are permanent; we never break them after publish, so choose one you will be happy with for years.** |
| `author` | Recommended | Your handle from `content/authors.json`. Falls back to the generic Kubesimplify byline if omitted. |
| `seoTitle` | Optional | Title used in `<title>` and social cards. Defaults to `title`. |
| `seoDescription` | Optional | Meta description. If omitted, it is auto-generated from your first ~155 characters of prose. Writing your own is better. |
| `cover` | Optional | Path to your cover/OG image (`/img/blog/<slug>/cover.png`) or an absolute `https://` URL. Used as the social-share image. |
| `tags` | Optional | Array of lowercase strings. Powers tag pages, related-post suggestions, and the article's topic metadata. Use 2 to 5. |
| `draft` | Optional | `true` keeps the post visible locally but hidden in production. Remove it (or set `false`) when you are ready to publish. |

Reading time is calculated automatically from your content; you do not set it.

## Step 5: Add your images

Put every image for the post in its own folder:

```
public/img/blog/<your-slug>/
```

Reference them from the Markdown with an absolute path (the `public/` prefix is dropped):

```markdown
![Architecture diagram](/img/blog/your-slug/architecture.png)
```

Your cover image goes in the same folder and is named in the `cover` frontmatter field. Keep images reasonably sized; large PNGs slow the page down. WebP, PNG, SVG, and JPG all work.

## Step 6: Write the body

The body is standard Markdown with [GitHub-Flavored Markdown](https://github.github.com/gfm/) extensions. What you get out of the box:

- **Headings** are automatically given anchor links and feed the in-page table of contents. Start your sections at `##` (the title is the `#`).
- **Fenced code blocks** with a language tag get syntax highlighting:

  ````markdown
  ```bash
  kubectl get pods -A
  ```
  ````

- **Tables**, **task lists**, **strikethrough**, and **autolinks** (GFM) all render.
- **Raw HTML** is allowed if you need it, but reach for plain Markdown first.

A few tips that make posts shine:

- Show real commands and their real output. Practitioner detail is what readers come for.
- One topic per post. Two focused posts beat one sprawling 8,000-word essay.
- Link to other Kubesimplify posts where relevant (`/blog/<other-slug>`).

> Interactive React visuals (the `{{...-animation}}` shortcodes you may see in some posts) are custom components maintainers build per-series. If you have an idea for one, raise it in your PR or an issue first.

## Step 7: Preview and proofread

With `npm run dev` running, open your post at `http://localhost:3000/blog/<your-slug>` and check:

- Code blocks render with the right language highlighting.
- Images load (broken images mean the path is wrong).
- The table of contents and headings look right.
- Your byline and avatar show up.

## Step 8 (optional): Add your post to a series

If your post is part of a multi-part series, open [`lib/series.js`](lib/series.js) and add your slug to the relevant series' `posts` array in reading order, or create a new series entry following the comments at the top of that file. This adds a series banner and next/previous navigation. It is purely additive and never changes your post's URL.

## Step 9: Commit, push, and open a pull request

We require a **DCO sign-off** on every commit (the `-s` flag adds it):

```bash
git add content/blog/your-slug.md content/authors.json public/img/blog/your-slug/
git commit -s -m "Add blog post: your post title"
git push -u origin blog/my-post-slug
```

Then open a pull request from your fork against `main`. The [PR template](.github/pull_request_template.md) asks for a short description and screenshots; a screenshot of your post rendered locally helps reviewers a lot.

A preview deployment is built on every PR so reviewers (and you) can see the post live. We review for fit and clarity, never to gatekeep your voice. Once merged, it deploys automatically.

---

## What we look for

- **Show, don't summarize.** Real code, real commands, real output. Diagrams and screenshots where they help.
- **Practitioner voice.** What did you try? What broke? What do the docs not tell you? That is the gold.
- **Stable, descriptive slugs.** Pick one you will be happy with in five years.
- **One topic per post.**
- **Original work or a fresh angle.** Cross-posts from your own blog are welcome; just mention the original source in your PR.

## Quick reference: copy-paste starter

```markdown
---
title: ""
seoTitle: ""
seoDescription: ""
datePublished: 2026-06-29T10:00:00.000Z
slug: 
author: 
cover: /img/blog/SLUG/cover.png
tags: []
draft: true
---

Write here. Remove `draft: true` when you are ready to publish.
```

## Troubleshooting

- **My post does not show up.** It is almost always a missing or malformed `datePublished`, or `draft: true` left in (drafts are hidden in production). Check the frontmatter parses as valid YAML.
- **My images are broken.** The path must start with `/img/...` (no `public/` prefix) and the file must be committed.
- **The "Edit this page" link 404s.** Your filename and `slug` do not match. Make them identical.
- **Author shows as "Kubesimplify".** Your `author` handle does not match a key in `content/authors.json`.

Questions? Open an issue, or ask in the [Kubesimplify Discord](https://kubesimplify.com/discord). Happy writing.
