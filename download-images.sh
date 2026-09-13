#!/usr/bin/env bash
# ============================================================
# Download the photos from the current 1729photography.com site
# into the local images/ folders, so the site is fully
# self-hosted (no dependency on Adobe's servers).
#
# Run this ONCE, from the repo root, on your own machine:
#     bash download-images.sh
#
# Requirements: curl and python3 (both preinstalled on macOS).
# Safe to re-run: files already downloaded are skipped.
#
# IMPORTANT: run this while your Adobe Portfolio site is still
# live. Once you cancel Adobe, these source images disappear.
# ============================================================
set -euo pipefail
cd "$(dirname "$0")"

python3 - <<'PY'
import json, os, subprocess, sys

with open("assets/data/photos.json", encoding="utf-8") as fh:
    data = json.load(fh)

items = []
site = data.get("site", {})
if site.get("hero"):
    items.append(site["hero"])
for c in data.get("collections", []):
    if c.get("cover"):
        items.append(c["cover"])
    items.extend(c.get("photos", []))

seen, jobs = set(), []
for it in items:
    f, u = it.get("file"), it.get("cdn")
    if not f or not u or f in seen:
        continue
    seen.add(f)
    jobs.append((f, u))

print(f"Localising {len(jobs)} images into ./images/ …\n")
ok = skip = fail = 0
for f, u in jobs:
    os.makedirs(os.path.dirname(f), exist_ok=True)
    if os.path.exists(f) and os.path.getsize(f) > 0:
        print(f"  skip  {f}")
        skip += 1
        continue
    try:
        subprocess.run(["curl", "-fsSL", "-o", f, u], check=True)
        print(f"  ok    {f}")
        ok += 1
    except subprocess.CalledProcessError:
        print(f"  FAIL  {f}  <- {u}")
        fail += 1

print(f"\nDone. downloaded={ok}  skipped={skip}  failed={fail}")
if fail:
    print("Some images failed — is the Adobe site still live? Re-run to retry.")
    sys.exit(1)
print("\nNext: commit the images/ folder and push. The site now loads")
print("photos locally and no longer needs Adobe.")
PY
