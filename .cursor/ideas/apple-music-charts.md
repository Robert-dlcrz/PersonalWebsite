## Apple Music – Top Artists (Idea Draft)

**High-level goal**: Add a simple, visually polished section on the `Music` page that highlights my **top artists**, optionally powered by Apple Music data in the future.

### Core Concept
- **Feature**: "Top Artists This Month" section rendered **below the playlists grid** and above the "About My Music Taste" card.
- **Layout**: Responsive **3-column card grid** (similar visual style to `PLAYLISTS`) with each card showing:
  - Artist artwork or emoji avatar
  - Artist name
  - Primary genre / vibe
  - "Open in Apple Music" link icon
- **Data source**: Start with **static data** in `constants/content.ts` (like `PLAYLISTS`), with room to later swap to live Apple Music data.

### Data Shape / Parameters
Add a new constant in `constants/content.ts`:

- **`TOP_ARTISTS` (array)**:
  - `id: number` – unique identifier for React key
  - `name: string` – artist name (`'Fred again..'`, `'Disclosure'`, etc.)
  - `genre: string` – high-level genre or vibe (`'Electronic'`, `'R&B'`, `'Indie'`)
  - `emoji: string` – simple visual avatar (🥁, 🎹, 🎧) to keep it on-brand with current UI
  - `blurb: string` – 1–2 sentence description of why this artist is in the top list
  - `appleMusicUrl?: string` – optional deep link to the artist on Apple Music
  - `rank?: number` – optional position (1–10) for ordering / badges later

### How It Fits in the Current Codebase
- **Where to display**: In `music/page.tsx`, insert a new "Top Artists" section after the playlists grid (`PLAYLISTS.map`) and before the "About My Music Taste" card.
- **UI implementation**:
  - Use a container + heading, e.g. `h2` with "Top Artists Right Now".
  - Render `TOP_ARTISTS.map` into cards styled similarly to playlist cards:
    - Card background: `bg-white dark:bg-slate-800` with `rounded-2xl shadow-lg border-slate-200 dark:border-slate-700`.
    - Header: small emoji / avatar in a gradient circle (reusing gradient patterns like `from-purple-400 to-pink-500`).
    - Body: artist name (bold), genre (accent color), and blurb (muted body text).
    - Optional Apple Music link: small external-link icon in the corner using existing `ArrowTopRightOnSquareIcon`.
- **Content management**: All text and artist metadata are centralized in `constants/content.ts` so the UI remains a simple mapping layer.

### Stretch Goals
- **Stretch Goal 1 – Live Apple Music Integration**
  - Pull real **top artists** via Apple Music / MusicKit JS or a serverless function on Vercel.
  - Replace the static `TOP_ARTISTS` array with a `getTopArtists()` call that:
    - Fetches my most played artists over a timeframe (e.g., last 4 weeks).
    - Normalizes the response into the `TOP_ARTISTS` shape for the UI.

- **Stretch Goal 2 – Timeframe & Insight Toggles**
  - Add simple pills or buttons above the grid (e.g., "Last 4 Weeks", "Last 6 Months", "All Time").
  - Show small insights per artist: play count badge, "New" tag for recently discovered artists, or trend indicator (up/down arrow) if play count increased vs last period.


