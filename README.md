# gta6-trophy-guide

[![GTA 6 Trophy Guide](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![Rank](https://make.fun/badge/gta6-trophy-guide-01/lucky-marten-44/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![Reward](https://make.fun/badge/gta6-trophy-guide-01/lucky-marten-44/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

An offline guide and tracker for all **55 PlayStation 5 trophies** of Grand Theft Auto VI (1 platinum, 2 gold, 6 silver, 46 bronze, 28 hidden). Every trophy shows its official name, description and grade as PlayStation publishes them, plus a guide written for this entry in its own words, with its sources cited beside it.

What it does:

- **Checklist tracker** — tick trophies off; progress is saved in `localStorage`, with export to a file and import back.
- **Roadmap to the platinum** — six ordered stages: saves first, story Chapters 1–4, strangers and side missions, the finale, activities and robberies, then collectibles and exploration.
- **Missable flags** — the one missable trophy, Positive Mental Attitude (the Chapter 1 balcony meditation), is flagged everywhere, with a time-sensitive warning for the Chapter 3 Yago race.
- **Filters and search** — by kind (story, missable, collectibles, activities, online) and by free text. There are no online trophies: GTA VI launches single-player only.
- **Spoiler mode** — hides the names and descriptions of story trophies until they are earned.
- **Shareable views** — `?filter=missable`, `?spoiler=1`, `?open=28`, `?earned=2,3,8`, `?view=roadmap`.
- **Honest about launch day** — the game released 19 November 2026. Steps not yet confirmed by an official or reliable source are marked **Unconfirmed** in the guide instead of presented as fact.

The app is plain static files under `app/` with no build step and makes zero network requests at runtime — it works in desktop Chrome with the network off. No Rockstar logo, artwork or game screenshots are used; the look is original.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080

## Files

- `app/index.html`, `app/app.js`, `app/style.css` — the guide app
- `app/data/trophies.json` — the 55 official trophies with guides, kinds, roadmap stages and sources
- `screenshots/` — four renders of the app in headless Chrome
- `main.ts` — copies `app/` and `screenshots/` to the output directory and writes `dossier.json`

## License

MIT — see [LICENSE](LICENSE).

Entered on [make.fun](https://make.fun/?ref=dct6qh8g&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards
