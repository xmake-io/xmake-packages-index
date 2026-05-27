# xmake-packages-index

Browse, search and integrate C/C++ packages from
[xmake-repo](https://github.com/xmake-io/xmake-repo).
A static Vue 3 site backed by a JSON dataset that is regenerated hourly via
GitHub Actions.

## Layout

```
xmake-packages-index/
├── site.config.json          # single source of truth (site, ads, build paths)
├── build.sh                  # local + CI full build
├── run.sh                    # local dev server
│
├── indexer/                  # xmake / lua: produces the JSON dataset
│   ├── build.lua             # `xmake l indexer/build.lua --repo=… --out=…`
│   └── lib/
│       ├── package_info.lua  # per-package metadata extraction
│       └── git_history.lua   # added_at / updated_at via git log
│
├── web/                      # Vue 3 + Vite static site
│   ├── public/data/          # JSON dataset (gitignored; populated by build.sh)
│   └── src/
│       ├── views/            # HomeView, PackagesView, PackageDetailView, …
│       ├── components/
│       │   ├── layout/       # AppHeader, AppFooter, AdBar, ThemeToggle
│       │   ├── package/      # PackageCard, PackageMeta, PackageConfigs, …
│       │   └── ui/           # CopyButton, CodeBlock, LoadingState
│       ├── composables/      # useTheme, useIndex, usePackage
│       ├── lib/              # data.ts, format.ts, usage.ts
│       ├── styles/           # tokens.css, themes.css, main.css
│       └── types/            # PackageDetail, PackageSummary, …
│
└── .github/workflows/update-index.yml   # hourly cron + Pages deploy
```

## Quick start

```bash
# one-shot local dev
./run.sh

# regenerate dataset against a fresh xmake-repo clone, then start dev server
./run.sh --refresh

# full production build (data + static site) under web/dist/
./build.sh
```

Prerequisites: `xmake`, Node 18+, Python 3 (for the tiny JSON probe in
`build.sh`), `git`.

## Data schema

The indexer writes four kinds of file into `web/public/data/`:

| File | Description |
| --- | --- |
| `index.json` | Compact summary list for the listing/search page |
| `latest.json` | Recently added + recently updated buckets (home feed) |
| `stats.json`  | Total counts + last generated timestamp |
| `packages/<name>.json` | Per-package detail document |

Schema is defined in `web/src/types/index.ts` and produced by
`indexer/lib/package_info.lua`.

## Theming

CSS variables in `web/src/styles/themes.css` mirror the VitePress
`--vp-c-*` convention used by [xmake-docs](https://github.com/xmake-io/xmake-docs)
so brand-color and surface styles stay aligned. Theme switching reads/writes
`localStorage['xmake-pkgs-theme']` and applies a `.dark` class on `<html>`
before paint (see the inline boot script in `index.html`).

## Ads

`web/src/components/layout/AdBar.vue` loads both
[WWAds](https://wwads.cn) and [Carbon Ads](https://www.carbonads.net) — the
same providers xmake-docs uses. Slot IDs are read from `site.config.json`:

```json
"ads": {
  "wwadsId": "239",
  "carbon": { "code": "CW7DTKQJ", "placement": "xmakeio" }
}
```

Drop `<AdBar slot-name="custom-slot" />` anywhere you need an ad container.

## CI

`.github/workflows/update-index.yml` runs hourly on `cron: '0 * * * *'`:

1. Checkout this repo
2. Install `xmake` and Node
3. `./build.sh` — refreshes the xmake-repo checkout, regenerates the JSON
   dataset, and builds the static site
4. Upload `web/dist/` as a Pages artifact and deploy

Set the repository variable `VITE_BASE` (e.g. `/` for a custom domain) to
control the site's base path.
