# Swine Dashboard

A full-stack dashboard for tracking sow pregnancy dates, feeding schedules, and fattening
batch costs.

- **Backend:** Laravel API + MySQL
- **Frontend:** Vue 3 + Vite + Vue Router

## Pages

| Page | Route | Description |
|---|---|---|
| Home | `/` | Today's date and the current feeding program for the active swine |
| Swine calculator | `/calculator` | Enter a swine name and breeding date, view the full feeding schedule, save it (persists to the database and downloads a PDF) |
| Swine lists | `/swine-list` | Table of all saved swine records with Swine ID, Swine name, Pregnant date, Iron date, Labor date, and a Save as PDF button per row |
| Fattening guide | `/fattening-guide` | Add fattening batches by number of heads, add feed cost entries per batch, see running total cost |

## Setup order

1. **Backend first** — follow `backend/README.md` to scaffold a Laravel project, copy in the
   models/controllers/migrations/routes, set up MySQL, and run `php artisan serve`
   (defaults to `http://localhost:8000`).
2. **Frontend second**:

   ```bash
   cd frontend
   npm install
   cp .env.example .env
   npm run dev
   ```

   Opens at `http://localhost:5173` and talks to the API at the URL in `.env`
   (`VITE_API_BASE_URL`).

## How the pieces connect

- Saving a record on **Swine calculator** does a `POST /api/swines`. The Laravel controller
  computes the pregnant/iron/labor dates from the breeding date and stores the row in MySQL,
  which is why it then shows up on **Swine lists** and can drive the **Home** page.
- **Home** fetches all swines and picks the one currently inside its 118-day gestation-to-labor
  window to show as the active feeding program.
- **Fattening guide** batches and their feed cost entries are two related tables
  (`fattening_batches` has many `fattening_feeds`); `total_cost` is the sum of a batch's feeds,
  computed by the API.
- PDF generation (`src/utils/pdf.js`) runs entirely in the browser with `jspdf`, using the same
  feeding-stage logic (`src/utils/feeding.js`) shared by the calculator, the list page, and home.
