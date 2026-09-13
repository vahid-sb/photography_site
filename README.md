# 1729 Photography — static site for GitHub Pages

A fast, dependency-free static rebuild of **1729photography.com**, migrated off
Adobe Portfolio so it can be hosted for free on GitHub Pages.

- Plain HTML / CSS / vanilla JS — no build step, no framework.
- Galleries are data-driven: edit `assets/data/photos.json` to add, remove, or
  reorder photos. No code changes needed.
- Responsive masonry galleries, a keyboard-navigable lightbox, light/dark aware.
- Works today by loading photos from your Adobe CDN, and switches to your own
  local copies once you run `download-images.sh` (see step 3).

---

## Can I host two sites on GitHub Pages? (short answer: yes)

Each GitHub account gets:

- **One "user site"** at `https://<your-username>.github.io` — one per account.
- **Unlimited "project sites"** — one per repository, at
  `https://<your-username>.github.io/<repo>`.

So two (or more) independent sites is fine — each just lives in its own repo.

The **one** real limit is custom domains: **an apex domain like
`1729photography.com` can only be attached to one Pages site at a time.** If you
get *"custom domain is already taken,"* it's still assigned to another repo.
Your second site therefore needs either its own domain, a subdomain
(e.g. `blog.1729photography.com`), or the free `<username>.github.io` address.

---

## Quick start — get it live

### 1. Create the repository and push these files

```bash
cd 1729photography            # this folder
git init
git add .
git commit -m "Initial static site"
git branch -M main
# create an empty repo named e.g. 1729photography on github.com first, then:
git remote add origin https://github.com/<your-username>/1729photography.git
git push -u origin main
```

### 2. Turn on GitHub Pages

On GitHub: **repo → Settings → Pages**
- **Source:** *Deploy from a branch*
- **Branch:** `main` · **Folder:** `/ (root)` → **Save**

Within a minute it's live at `https://<your-username>.github.io/1729photography/`.
(Note: at this address the styling/images use root-relative paths that assume the
**custom domain**. It will look fully correct once step 4 is done — or you can test
with a local server, see "Preview locally" below.)

### 3. Localise the photos (pull them from your current site)

The galleries currently point at your Adobe CDN so the site works immediately.
To make it fully independent of Adobe, run **once, on your own machine, while the
Adobe site is still live**:

```bash
bash download-images.sh
git add images
git commit -m "Add local photos"
git push
```

This downloads all 30 photos into `images/` and the site then serves them itself.
> **Higher quality:** Adobe serves web-sized images (max ~1200–1920px wide). For
> print-grade quality, re-export the same shots from Lightroom at full resolution
> and drop them into the matching `images/<collection>/` files (same filenames).

### 4. Point your domain at GitHub Pages

The `CNAME` file in this repo already sets the custom domain to
`1729photography.com`. Now update DNS **at whoever hosts your domain's DNS** (your
registrar or e.g. Cloudflare). You'll move it away from Adobe's records.

**Apex domain `1729photography.com` — four A records:**

```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

**And the four AAAA (IPv6) records:**

```
2606:50c0:8000::153
2606:50c0:8001::153
2606:50c0:8002::153
2606:50c0:8003::153
```

**`www` subdomain — one CNAME record:**

```
www   CNAME   <your-username>.github.io
```

Then in **Settings → Pages → Custom domain**, confirm `1729photography.com` is
set, and tick **Enforce HTTPS** once the certificate is issued (can take up to a
few hours after DNS propagates).

> Source: [GitHub Docs — Managing a custom domain](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).
> These are GitHub's official records; don't mix in Adobe's old A record.

---

## Contact form

GitHub Pages is static, so the form uses [**Formspree**](https://formspree.io) to
deliver messages. It's **already connected** to your endpoint
(`https://formspree.io/f/mppzgzzv`) in `contact.html` — nothing to configure.

- The first time a real message is submitted from the live domain, Formspree emails
  you once to confirm the form; approve it and submissions flow to your inbox.
- To point it elsewhere later, just change the `action=` URL on the form in
  `contact.html` (any handler — Getform, Basin, etc. — works the same way).

---

## Editing the site

- **Add / remove / reorder photos:** edit `assets/data/photos.json`. Each photo is
  `{ "file": "images/<collection>/<name>.jpg", "cdn": "<optional fallback url>",
  "w": <width>, "h": <height> }`. Drop the image file into the folder, add its
  entry, done. (`w`/`h` are the aspect ratio — they just help layout; approximate
  is fine.)
- **Change page text, nav, or metadata:** edit `tools/build_pages.py`, then run
  `python3 tools/build_pages.py` to regenerate the `.html` pages. (Or just edit the
  `.html` files directly — they're plain HTML.)
- **Colors / fonts / spacing:** all in `assets/css/style.css` (design tokens at the
  top).

## Preview locally

Opening the files directly (`file://`) won't load `photos.json` (browser security).
Run a tiny local server instead:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## File structure

```
├── index.html                 home (hero + collections)
├── people.html places.html night.html dreams.html   galleries
├── about.html  contact.html   404.html
├── CNAME                       custom domain (1729photography.com)
├── .nojekyll                   serve files as-is (skip Jekyll)
├── robots.txt  sitemap.xml     SEO
├── download-images.sh          localises photos from the current site
├── assets/
│   ├── css/style.css
│   ├── js/app.js               galleries + lightbox
│   ├── data/photos.json        the photo list (edit this)
│   └── favicon.svg
├── images/                     photos land here (per collection)
└── tools/build_pages.py        regenerates the .html shells
```

## A couple of notes

- **About text:** the page still reads *"I am based in Tübingen, Germany"* — carried
  over verbatim from your current site. Update `about.html` if that's out of date.
- **Do the image download before cancelling Adobe.** The `cdn` fallback URLs stop
  working once the Portfolio site comes down.
