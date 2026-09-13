#!/usr/bin/env python3
"""
Regenerate the HTML pages for 1729photography.com from shared parts.
Run from the repo root:  python3 tools/build_pages.py
Galleries themselves are data-driven (assets/data/photos.json) — this only
stamps out the page shells so the header/footer/meta stay consistent.
"""
import os

SITE_URL = "https://1729photography.com"
DESC = "1729 Photography — portraits, landscapes, night and abstract photography."
OG_IMAGE = "https://cdn.myportfolio.com/bfeeaad6fa5b63d903257e109272d246/9c9ed463-4336-4ee8-98a9-4f6dea701e8b_rw_1920.jpg?h=2da472dab426cdfe84c5d82084e62893"

NAV = [
    ("People",  "people.html"),
    ("Places",  "places.html"),
    ("Night",   "night.html"),
    ("Dreams",  "dreams.html"),
    ("About",   "about.html"),
    ("Contact", "contact.html"),
]

def nav_html(active, base):
    items = []
    for label, href in NAV:
        cur = ' aria-current="page"' if href == active else ""
        items.append(f'<a href="{base}{href}"{cur}>{label}</a>')
    return "\n        ".join(items)

def head(title, description, active, canonical, base):
    home = f"{base}index.html" if base == "" else base  # "/" for 404
    return f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{title}</title>
  <meta name="description" content="{description}">
  <link rel="canonical" href="{canonical}">
  <link rel="icon" href="{base}assets/favicon.svg" type="image/svg+xml">
  <meta property="og:type" content="website">
  <meta property="og:title" content="{title}">
  <meta property="og:description" content="{description}">
  <meta property="og:url" content="{canonical}">
  <meta property="og:image" content="{OG_IMAGE}">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="{base}assets/css/style.css">
</head>
<body data-page="{active}">
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header">
    <div class="wrap">
      <a class="brand" href="{home}" aria-label="1729 Photography — home"><span>1729</span><span class="brand-sub">Photography</span></a>
      <button class="nav-toggle" aria-label="Menu" aria-expanded="false"><span></span></button>
      <nav class="nav" aria-label="Primary">
        {nav_html(active, base)}
      </nav>
    </div>
  </header>
  <main id="main">
"""

def footer(base):
    return f"""  </main>
  <footer class="site-footer">
    <div class="wrap">
      <span class="footer-brand">1729 Photography</span>
      <nav class="footer-nav" aria-label="Footer">
        <a href="{base}people.html">People</a>
        <a href="{base}places.html">Places</a>
        <a href="{base}night.html">Night</a>
        <a href="{base}dreams.html">Dreams</a>
        <a href="{base}about.html">About</a>
        <a href="{base}contact.html">Contact</a>
      </nav>
      <span>© <span id="year"></span> 1729 Photography</span>
    </div>
  </footer>
  <script>document.getElementById('year').textContent=new Date().getFullYear();</script>
  <script src="{base}assets/js/app.js" defer></script>
</body>
</html>
"""

def page(filename, title, description, active, body, base=""):
    canonical = f"{SITE_URL}/" if active == "index.html" else f"{SITE_URL}/{active}"
    return head(title, description, active, canonical, base) + body + footer(base)

# ---- Home --------------------------------------------------------------
HOME_BODY = """    <section class="hero" data-hero>
      <div class="wrap hero-inner">
        <h1 class="hero-title">1729 Photography</h1>
        <p class="hero-tagline">Portraits · Landscapes · Night · Abstract</p>
      </div>
    </section>

    <section class="section wrap">
      <div class="section-head">
        <p class="eyebrow">Portfolio</p>
        <h2 class="section-title">Collections</h2>
      </div>
      <div id="collections" class="collections"></div>
    </section>

    <hr class="divider">

    <section class="section wrap center">
      <p class="eyebrow">About</p>
      <p class="lead" style="margin:0 auto 1.6rem;">Photography from Germany — a personal archive of people, places, and the quiet hours in between.</p>
      <a class="btn" href="about.html">Read more</a>
    </section>
"""

def gallery_body(title, slug):
    return f"""    <section class="wrap gallery-head">
      <p class="eyebrow">Collection</p>
      <h1 class="section-title" data-gallery-title>{title}</h1>
      <p class="lead" data-gallery-count></p>
    </section>
    <section class="wrap">
      <div id="gallery" class="gallery" data-collection="{slug}"></div>
    </section>
"""

ABOUT_BODY = """    <section class="section wrap">
      <div class="section-head">
        <p class="eyebrow">About</p>
        <h1 class="section-title">1729 Photography</h1>
      </div>
      <div class="prose">
        <p>I am based in Tübingen, Germany.</p>
        <p>If you're interested in collaborating — as a photographer or a model — please use the contact form to get in touch.</p>
      </div>
    </section>
"""

CONTACT_BODY = """    <section class="section wrap">
      <div class="section-head">
        <p class="eyebrow">Contact</p>
        <h1 class="section-title">Get in touch</h1>
      </div>
      <div class="contact-grid">
        <div class="prose">
          <p>For prints, collaborations, or commissions, send a message and I'll get back to you.</p>
        </div>
        <form id="contact-form" class="form" action="https://formspree.io/f/mppzgzzv" method="POST">
          <div class="field">
            <label for="name">Name</label>
            <input id="name" name="name" type="text" required autocomplete="name">
          </div>
          <div class="field">
            <label for="email">Email</label>
            <input id="email" name="email" type="email" required autocomplete="email">
          </div>
          <div class="field">
            <label for="message">Message</label>
            <textarea id="message" name="message" required></textarea>
          </div>
          <input type="text" name="_gotcha" style="display:none" tabindex="-1" autocomplete="off" aria-hidden="true">
          <button class="btn" type="submit">Send</button>
          <p class="form-status" role="status" aria-live="polite"></p>
          <p class="form-note">Your message comes straight to my inbox.</p>
        </form>
      </div>
    </section>
"""

NOTFOUND_BODY = """    <section class="section wrap center" style="min-height:52vh;display:flex;flex-direction:column;justify-content:center;align-items:center;">
      <p class="eyebrow">404</p>
      <h1 class="section-title">Page not found</h1>
      <p class="lead" style="margin:1rem auto 1.8rem;">That page doesn't exist. Let's get you back to the photographs.</p>
      <a class="btn" href="/">Return home</a>
    </section>
"""

PAGES = [
    ("index.html",   "1729 Photography", DESC, "index.html", HOME_BODY, ""),
    ("people.html",  "People · 1729 Photography",  "Portrait photography — 1729 Photography.",  "people.html",  gallery_body("People", "people"), ""),
    ("places.html",  "Places · 1729 Photography",  "Landscape photography — 1729 Photography.", "places.html",  gallery_body("Places", "places"), ""),
    ("night.html",   "Night · 1729 Photography",   "Night photography — 1729 Photography.",     "night.html",   gallery_body("Night", "night"), ""),
    ("dreams.html",  "Dreams · 1729 Photography",  "Abstract photography — 1729 Photography.",  "dreams.html",  gallery_body("Dreams", "dreams"), ""),
    ("about.html",   "About · 1729 Photography",   DESC, "about.html",   ABOUT_BODY, ""),
    ("contact.html", "Contact · 1729 Photography", "Get in touch with 1729 Photography.", "contact.html", CONTACT_BODY, ""),
    ("404.html",     "Not found · 1729 Photography", "Page not found.", "404.html", NOTFOUND_BODY, "/"),
]

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
for fn, title, desc, active, body, base in PAGES:
    with open(os.path.join(root, fn), "w", encoding="utf-8") as f:
        f.write(page(fn, title, desc, active, body, base))
    print("wrote", fn)
print("done —", len(PAGES), "pages")
