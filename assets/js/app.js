/* ============================================================
   1729 Photography — behaviour
   - Mobile nav
   - Home hero + collection cards (from photos.json)
   - Gallery masonry (from photos.json)
   - Lightbox with keyboard + swipe navigation
   - Local image with CDN fallback (works before/after localising)
   ============================================================ */
(function () {
  "use strict";

  var DATA_URL = "assets/data/photos.json";

  /* ---- Mobile nav ------------------------------------------------- */
  var toggle = document.querySelector(".nav-toggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      document.body.classList.toggle("nav-open");
    });
    document.querySelectorAll(".nav a").forEach(function (a) {
      a.addEventListener("click", function () { document.body.classList.remove("nav-open"); });
    });
  }

  /* ---- Image element with graceful CDN fallback ------------------- */
  // Tries the local file first; if it 404s (not localised yet), falls
  // back to the original Adobe CDN url so the site still shows photos.
  function makeImg(photo, opts) {
    opts = opts || {};
    var img = new Image();
    if (photo.w && photo.h) { img.width = photo.w; img.height = photo.h; }
    img.alt = opts.alt || "";
    img.loading = opts.eager ? "eager" : "lazy";
    img.decoding = "async";
    img.dataset.fallback = photo.cdn || "";
    img.addEventListener("load", function () { img.classList.add("loaded"); });
    img.addEventListener("error", function () {
      if (img.dataset.fallback && img.src.indexOf(img.dataset.fallback) === -1) {
        var fb = img.dataset.fallback; img.dataset.fallback = ""; img.src = fb;
      }
    });
    img.src = photo.file || photo.cdn || "";
    return img;
  }

  /* ---- Fetch data then render ------------------------------------- */
  function boot(data) {
    renderHero(data);
    renderCollections(data);
    renderGallery(data);
  }

  function renderHero(data) {
    var el = document.querySelector("[data-hero]");
    if (!el || !data.site || !data.site.hero) return;
    var img = makeImg(data.site.hero, { alt: (data.site.title || "") + " — featured photograph", eager: true });
    el.insertBefore(img, el.firstChild);
  }

  function renderCollections(data) {
    var grid = document.querySelector("#collections");
    if (!grid) return;
    (data.collections || []).forEach(function (c) {
      var a = document.createElement("a");
      a.className = "card";
      a.href = c.slug + ".html";
      a.setAttribute("aria-label", c.title + " — " + c.photos.length + " photographs");
      a.appendChild(makeImg(c.cover || c.photos[0], { alt: c.title }));
      var label = document.createElement("div");
      label.className = "card-label";
      label.innerHTML =
        '<span class="name">' + esc(c.title) + '</span>' +
        '<span class="count">' + c.photos.length + '</span>';
      a.appendChild(label);
      grid.appendChild(a);
    });
  }

  function renderGallery(data) {
    var grid = document.querySelector("#gallery");
    if (!grid) return;
    var slug = grid.dataset.collection;
    var col = (data.collections || []).find(function (c) { return c.slug === slug; });
    if (!col) return;

    // page title / count hooks
    var titleEl = document.querySelector("[data-gallery-title]");
    if (titleEl) titleEl.textContent = col.title;
    var countEl = document.querySelector("[data-gallery-count]");
    if (countEl) countEl.textContent = col.photos.length + (col.photos.length === 1 ? " photograph" : " photographs");
    if (col.description) {
      var descEl = document.querySelector("[data-gallery-desc]");
      if (descEl) descEl.textContent = col.description;
    }
    document.title = col.title + " · 1729 Photography";

    col.photos.forEach(function (p, i) {
      var a = document.createElement("a");
      a.className = "tile";
      a.href = p.file || p.cdn;
      a.setAttribute("aria-label", col.title + " photograph " + (i + 1));
      a.appendChild(makeImg(p, { alt: col.title + " — photograph " + (i + 1) }));
      a.addEventListener("click", function (e) { e.preventDefault(); openLightbox(col, i); });
      grid.appendChild(a);
    });

    buildLightbox();
  }

  /* ---- Lightbox --------------------------------------------------- */
  var lb, lbImg, lbCounter, current = { photos: [], i: 0, title: "" };

  function buildLightbox() {
    if (lb) return;
    lb = document.createElement("div");
    lb.className = "lightbox";
    lb.setAttribute("role", "dialog");
    lb.setAttribute("aria-modal", "true");
    lb.setAttribute("aria-label", "Image viewer");
    lb.innerHTML =
      '<button class="lb-close" aria-label="Close">' + iconClose() + '</button>' +
      '<button class="lb-btn lb-prev" aria-label="Previous">' + iconArrow("left") + '</button>' +
      '<figure class="lb-figure"><img class="lb-img" alt=""><figcaption class="lb-counter"></figcaption></figure>' +
      '<button class="lb-btn lb-next" aria-label="Next">' + iconArrow("right") + '</button>';
    document.body.appendChild(lb);
    lbImg = lb.querySelector(".lb-img");
    lbCounter = lb.querySelector(".lb-counter");

    lb.querySelector(".lb-close").addEventListener("click", closeLightbox);
    lb.querySelector(".lb-prev").addEventListener("click", function (e) { e.stopPropagation(); step(-1); });
    lb.querySelector(".lb-next").addEventListener("click", function (e) { e.stopPropagation(); step(1); });
    lb.addEventListener("click", function (e) { if (e.target === lb || e.target.classList.contains("lb-figure")) closeLightbox(); });

    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") closeLightbox();
      else if (e.key === "ArrowLeft") step(-1);
      else if (e.key === "ArrowRight") step(1);
    });

    // swipe
    var sx = 0;
    lb.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener("touchend", function (e) {
      var dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 45) step(dx < 0 ? 1 : -1);
    }, { passive: true });
  }

  function openLightbox(col, i) {
    current.photos = col.photos; current.i = i; current.title = col.title;
    showCurrent();
    lb.classList.add("open");
    document.documentElement.style.overflow = "hidden";
  }
  function closeLightbox() {
    lb.classList.remove("open");
    document.documentElement.style.overflow = "";
  }
  function step(d) {
    var n = current.photos.length;
    current.i = (current.i + d + n) % n;
    showCurrent();
  }
  function showCurrent() {
    var p = current.photos[current.i];
    lbImg.classList.remove("loaded");
    lbImg.alt = current.title + " — photograph " + (current.i + 1);
    lbImg.dataset.fallback = p.cdn || "";
    lbImg.onload = function () { lbImg.classList.add("loaded"); };
    lbImg.onerror = function () {
      if (lbImg.dataset.fallback && lbImg.src.indexOf(lbImg.dataset.fallback) === -1) {
        var fb = lbImg.dataset.fallback; lbImg.dataset.fallback = ""; lbImg.src = fb;
      }
    };
    lbImg.src = p.file || p.cdn;
    lbCounter.textContent = (current.i + 1) + " / " + current.photos.length;
    // preload neighbours
    [1, -1].forEach(function (d) {
      var q = current.photos[(current.i + d + current.photos.length) % current.photos.length];
      if (q) { var pre = new Image(); pre.src = q.file || q.cdn; }
    });
  }

  /* ---- Contact form (Formspree-compatible) ------------------------ */
  var form = document.querySelector("#contact-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      var status = document.querySelector(".form-status");
      var action = form.getAttribute("action") || "";
      if (action.indexOf("YOUR_FORM_ID") !== -1 || !action) {
        // Not configured yet — don't pretend it sent.
        e.preventDefault();
        if (status) { status.textContent = "The form isn't connected yet — see the README to add your Formspree endpoint."; status.className = "form-status err"; }
        return;
      }
      // Let it submit to Formspree via fetch for a smoother UX
      e.preventDefault();
      if (status) { status.textContent = "Sending…"; status.className = "form-status"; }
      fetch(action, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } })
        .then(function (r) {
          if (r.ok) { form.reset(); if (status) { status.textContent = "Thank you — your message has been sent."; status.className = "form-status ok"; } }
          else { throw new Error("bad response"); }
        })
        .catch(function () { if (status) { status.textContent = "Something went wrong. Please try again later."; status.className = "form-status err"; } });
    });
  }

  /* ---- icons / helpers -------------------------------------------- */
  function iconArrow(dir) {
    var d = dir === "left" ? "M15 18l-6-6 6-6" : "M9 6l6 6-6 6";
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="' + d + '"/></svg>';
  }
  function iconClose() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>';
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]; }); }

  /* ---- go --------------------------------------------------------- */
  fetch(DATA_URL, { cache: "no-cache" })
    .then(function (r) { return r.json(); })
    .then(boot)
    .catch(function (err) {
      console.error("Could not load photos.json:", err);
      var g = document.querySelector("#gallery, #collections");
      if (g) g.innerHTML = '<p style="color:var(--fg-faint)">Could not load the photo list. If you are previewing locally, run a local server (see README) rather than opening the file directly.</p>';
    });
})();
