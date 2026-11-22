# Slab Sense

Website Requirements

• Responsive website.

• Clearly describe the environmental problem and target users.

• Present an IT-enabled solution.

• Minimum four functional webpages/screens.

• Include at least two interactive features.

• Use HTML, CSS and JavaScript (frameworks optional).

• Provide references for external resources.

Deliverables

1. Website source code.

2. Hosted website URL.

3. Live demonstration (5–7 minutes).

4. Group Report (minimum 10 pages).

For the document,

Page 1 – Cover Page

Chapter 1 – Problem + Objectives

Chapter 2 – Users + Proposed Solution

Chapter 3 – Features + Requirements

Chapter 5 – System/User Flow

Chapter 6 – UI Wireframes

Chapter 7 – Database/ER Diagram

Chapter 8 – Technology Stack

Chapter 9 – Smart/Innovative Component

Chapter 10 – Expected Outcome + Individual Contributions

Last Page – ReferencesI'm building a group project website called SlabSense — a slab-aware

electricity dashboard for KSEB households, showing a "Slab Countdown"

widget, projected bill, usage graph, and appliance ranking.

Team of 6, split as: me (ML/phantom-load detection + integration),

2 people on frontend, 2 on backend, 1 on database. Documentation is

just a PPT, no separate report.

Project folder structure in VS Code:

slabsense-website/

  server.js       (Backend A — Express server + API routes)

  tariffLogic.js  (Backend B — slab bill calculation logic)

  phantomLoad.js  (me — phantom load detection function, DONE and tested)

  database.js     (Database person — SQLite, 4 tables, sample data)

  public/

    index.html    (Frontend A "Giya" — slab widget + bill card, DONE and tested, works)

    style.css     (Giya's CSS, DONE)

    script.js     (Giya's JS — uses a mock fetch for /api/usage-summary

                   and /api/slab-status, DONE and tested)

STILL TO DO:

1. Get Frontend B "Gopee"'s code (usage graph with Chart.js + appliance

   list) and merge it into the same index.html/style.css below Giya's

   section, without breaking Giya's part.

2. Paste Backend A's and Backend B's code into server.js/tariffLogic.js

   and test the server runs (node server.js, check localhost:3000

   routes return JSON).

3. Get database.js code from teammate, run it, confirm slabsense.db

   gets created.

4. IMPORTANT: the real backend uses routes named /api/usage/:householdId

   and /api/bill-projection/:id, but Giya's frontend mock-fetches

   /api/usage-summary and /api/slab-status instead — these names don't

   match and need to be reconciled before final integration.

5. Wire server.js to require() tariffLogic.js and phantomLoad.js instead

   of hardcoded fake data.

6. Deploy the finished site (planned: Render free tier).

I'm a beginner at this — please explain things simply, tell me exactly

which file to paste code into, and don't assume I know web dev jargon.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://slab-smart-insight.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/871701dc-cec9-4cd5-972a-f56ed8ecd940).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
