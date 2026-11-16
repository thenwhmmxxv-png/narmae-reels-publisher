# Narmae Wellness Hub Reels Planner

A lightweight, GitHub-ready planning board for the Narmae Wellness Hub® 30-day Instagram Reels campaign.

## What it does

- Creates 90 slots across 30 days: Awakening at 9:00 AM, Education at 1:00 PM, and Promotion at 6:00 PM (Philippine time).
- Tracks each Reel's distinct angle, hook, visual direction, Taglish script, caption, CTA, content details, assets, license evidence, and production stage.
- Gives educational Reels a practical execution checklist: scenario, failure, consequence, step-by-step correction, realistic example, and relevant NWH support.
- Keeps promotional content transparent about the actual service, inclusions, process, boundaries, and next step.
- Flags exact repeated themes, angles, or hooks and missing required content. It cannot judge semantic similarity, so review each Reel's angle before production.
- Builds per-Reel Pixabay video and music searches from the theme, angle, visual direction, and chosen music mood; tracks the selected media and license evidence.
- Copies a campaign or single-Reel prompt, exports the schedule as CSV or the complete plan as JSON, and restores a JSON backup.

## Use

Open `index.html` in a current browser. Set the campaign start date, open each Reel to fill its brief, and use the filters to work through the batch. The board saves in the current browser's local storage. Export a JSON backup before moving to another device or clearing browser data; restore that JSON from the **Restore backup** control.

## Publishing workflow

This planner organizes batch production; it does not create video files or connect to Instagram. Source licensed footage and music, retain license evidence, edit finished vertical MP4s, then upload and schedule them on the Narmae Wellness Hub® Instagram account in Meta Business Suite. Meta Business Suite automatically publishes Reels that are already uploaded and scheduled.

For each Reel, use the Pixabay search links in its editor to find a context-matched live-action clip and background track. Review each asset and its restrictions, then record the exact item pages and license/download evidence. Pixabay allows royalty-free use under its Content License restrictions; it does not clear every third-party right in every asset. Review the [Pixabay Content License](https://pixabay.com/service/license-summary/) and [Pixabay music FAQ](https://pixabay.com/service/faq/).

No Make.com or API keys are required for this initial workflow. Do not add Instagram credentials or tokens to this static app.

## GitHub use

The repository can store the planner and editorial standard. If you choose to use GitHub Pages later, host the static files as a project site; user-entered campaign data remains in each browser unless exported. A shared, multi-user content database or direct Meta API publishing would require a separate backend and explicit Meta app permissions.

## Project files

- `index.html` — planner interface
- `styles.css` — responsive layout and visual styling
- `app.js` — 90-slot board, local saving, prompts, validation, and exports
- `content-standard.md` — campaign requirements and reusable prompt standard
