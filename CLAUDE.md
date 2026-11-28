# Rules for this repo (cexagon/abaqa)

- **Repo first.** GitHub `cexagon/abaqa`, branch `main`, is the single source of truth. Pull `main` before any task; never work from a loose copy on the Mac.
- What this is: **Abaqa**, cex's learning app for their child (PWA). One home with two categories:
  - Pelajaran formal: `latihan-kelas-1/`, `latihan-kelas-2/` (latihan ujian ASAS sesuai kisi-kisi + modul Belajar dulu).
  - Game edukasi: `kebun-hitung/` (Kebun Hitung, bab 1-10, Cerita, Pasar 3D) and `lab-bu-canni/` (Lab Rahasia Bu Canni).
- Questions and learning cards are generated: edit `latihan-kelas-*/_soal_<mapel>.py` / `_materi_<mapel>.py`, then run `python3 _buat_soal.py` (must pass; it checks every paket against the school's kisi-kisi). Never hand-edit `soal.js` / `materi.js`.
- Sekolah Islam (Muhammadiyah): no pictures of prophets, angels or Allah; religious facts and Arabic text checked against sources.
- Hosting: GitHub Pages via `.github/workflows/pages.yml` (push to `main`). Not on Cloudflare.
- Work on a branch and open a PR; cex merges.
- If this ever needs a Cloudflare site: add `.github/workflows/deploy.yml` like the other cexagon repos (push to `main` → `npx -y wrangler@4.86.0`, secrets `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID`, `workers_dev`/`preview_urls` false) and a DEPLOY.md. Never deploy by hand.
- Cloudflare account 894dad2a4e4a1b9d82ab4d2f4f209b41 only (never "Incandescent Saltasaurus").
- Never print or commit secrets (tokens, API keys, .env / .dev.vars / .secrets files).

## GitHub Actions quota
- All private cexagon repos share one monthly GitHub Actions allowance (the cexagon account plan). Heavy work is anything that runs many or long Actions jobs: new or changed workflows, renders or censuses in CI, matrix or scheduled runs, bulk pushes or many PR updates, re-running failed jobs.
- Before heavy work, stop and ask cex where it should run, and wait for his choice:
  1. **On cex's Mac** (uses no Actions minutes). Give him numbered steps he can copy and paste: open Terminal, `cd ~/Code/<repo>` (clone it there first if missing), `git pull`, the install command, the exact render or test command, how long it takes, where the output lands, and how the result gets back (commit and push with `[skip ci]`, or tell the agent it is done so it can check the files). Say what to do if a step fails.
  2. **On the server (GitHub Actions).** Say what will run, rough minutes per run and per month, and the cheaper setup you will use (`paths` filter, `concurrency` cancel-in-progress).
- Docs-only commits always use `[skip ci]`.
