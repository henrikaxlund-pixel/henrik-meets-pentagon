# Henrik — Morning Coffee Talk (online)

Password-gated static deck. Deploys to GitHub Pages.

## What's in here

```
deploy/
├── index.html            ← the deck (loads at the URL root)
├── image-slot.js         ← slim, read-only viewer for image slots
├── deck-stage.js         ← slide framework (scaling, keyboard nav, etc.)
├── images/               ← baked-in slide images (26 webp files)
├── konstfack.png
├── blutnoir.png
├── intersection-1.jpg
├── intersection-2.jpg
└── (drop your .mp4 files next to index.html — see below)
```

## Videos

The deck expects these video files **next to `index.html`** (same folder):

| Slide | File |
| --- | --- |
| 07 Woland | `woland.mp4` |
| 09 Nokia x3 | `nokia.mp4` |
| 10 Nokia Devices | `nokia-devices.mp4` |
| 11 Complicated products | `clients.mp4` |
| 12 Complicated products II — hero | `c12-hero.mp4` |
| 12 Complicated products II — supporting | `clients2.mp4` |

Each `<video>` does a `HEAD` request on its file before setting `src`, so missing
videos fall back to a quiet placeholder caption — no console noise, no broken
slides. Add the files when you have them; nothing else changes.

GitHub has a **100 MB per-file limit**. If any single .mp4 is larger than
that:
- compress it (handbrake / `ffmpeg -crf 28`), OR
- host it elsewhere (Vimeo, CDN, S3) and change the `data-src` in `index.html`
  to the absolute URL, OR
- use [Git LFS](https://git-lfs.com/) for that file.

## Password

`pentagon1!pentagon1!`

Stored as a SHA-256 hash (`fa39fa5b…`) in `index.html`. Verified client-side.
Unlock persists for the browser session (closing the tab requires re-entering).

**Security note:** this is a casual gate, not encryption. Anyone with browser
dev tools can bypass it, and the deck content is in view-source. Fine for
"don't share with random recruiters"; not fine for confidential material.

To change the password, run this in any browser console and replace `HASH` in
`index.html`:

```js
const enc = new TextEncoder();
const buf = await crypto.subtle.digest('SHA-256', enc.encode('your new password'));
[...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('')
```

## Deploy to GitHub Pages

### Option A — dedicated repo (recommended)

1. Create a new repo (private is fine; Pages still works on private repos with
   GitHub Pro / Team / Enterprise — for a free account, the repo needs to be
   public, but the password gate still hides the deck from casual viewers).
2. Copy everything in this `deploy/` folder to the repo root.
3. Add your `.mp4` files at the root too.
4. `git push`.
5. On GitHub: **Settings → Pages → Build and deployment → Source: Deploy from
   a branch → `main` / `(root)` → Save.**
6. Wait ~1 min, then visit `https://<your-username>.github.io/<repo-name>/`.

### Option B — subfolder in an existing repo

If you already have a Pages-enabled repo and want the deck at e.g.
`/coffee-talk/`, drop this folder inside that repo as `coffee-talk/` and visit
`https://<your-username>.github.io/<repo>/coffee-talk/`.

### Option C — your own domain

Pages supports custom domains. Settings → Pages → Custom domain. Add a `CNAME`
file with the domain, point a DNS CNAME record at `<username>.github.io`.

## Things removed vs. the editing version

- **Image-drop / persistence** — viewers can't replace any image.
- **Speaker notes** — they only render through the editor's host. Stripped to
  keep them off public source.
- **Tweaks panel** — design-time tool, gone.
- **IndexedDB video store** — replaced with simple relative-path loading.

## Local preview

Any static file server works. From inside `deploy/`:

```bash
python3 -m http.server 8000
# then open http://localhost:8000/
```

`file://` won't work — the password gate's `fetch` calls need an http origin.
