# Pulse — Personalized Content Dashboard

> SDE Intern Frontend Assignment · Built with React 18 · Next.js 14 · Redux Toolkit · TypeScript

---

## 🚀 Live Demo

[**→ View Live Demo**](https://your-deployment-url.vercel.app) *(deploy to Vercel after setup)*

---

## ✨ Features

| Feature | Details |
|---|---|
| **Personalized Feed** | AI-generated content via Anthropic Claude API, filtered by user-selected categories |
| **Category Preferences** | 8 categories (Technology, Sports, Finance, Entertainment, Science, Health, Politics, Travel) — persisted to localStorage |
| **Drag & Drop** | HTML5 Drag API reorders feed cards with visual feedback |
| **Debounced Search** | 300ms debounced full-text search across titles, descriptions, categories, and authors |
| **Dark / Light Mode** | CSS-variable-driven theme switching, persisted to localStorage |
| **Favorites** | Heart any card to save it; dedicated Favorites view |
| **Trending Section** | Highlights trending items + ranked list of all content |
| **AI Content Refresh** | One-click fetch of fresh personalized content from Claude |
| **Grid / List Toggle** | Switch between card grid and compact list layout |
| **Skeleton Loading** | Shimmer placeholders during content fetches |
| **Redux Toolkit** | Global state management with typed slices and RTK Query |
| **LocalStorage Persist** | Preferences, favorites, and theme survive page reloads |

---

## 🛠 Tech Stack

- **Framework** — Next.js 14 (App Router)
- **Language** — TypeScript
- **Styling** — Tailwind CSS + CSS custom properties
- **State** — Redux Toolkit + Redux Persist
- **Data Fetching** — RTK Query + Anthropic API
- **Animations** — Framer Motion + CSS keyframes
- **Drag & Drop** — Native HTML5 Drag API (upgrade path: `@dnd-kit/core`)
- **Testing** — Vitest + React Testing Library + Playwright (E2E)
- **Icons** — Lucide React
- **Fonts** — Playfair Display (headings) · DM Sans (body) via Google Fonts

---

## 📁 Project Structure

```
pulse-dashboard/
├── app/
│   ├── layout.tsx              # Root layout with Redux Provider
│   ├── page.tsx                # Home → Dashboard
│   └── globals.css             # CSS variables + Tailwind base
├── components/
│   ├── Dashboard/
│   │   ├── index.tsx           # Main dashboard shell
│   │   ├── Sidebar.tsx         # Collapsible nav sidebar
│   │   ├── Header.tsx          # Search bar, dark mode, user avatar
│   │   └── views/
│   │       ├── FeedView.tsx
│   │       ├── TrendingView.tsx
│   │       ├── FavoritesView.tsx
│   │       └── SettingsView.tsx
│   ├── ContentCard/
│   │   ├── index.tsx           # Card (grid + list variants)
│   │   └── SkeletonCard.tsx
│   └── ui/
│       ├── Toast.tsx
│       ├── EmptyState.tsx
│       └── Toggle.tsx
├── store/
│   ├── index.ts                # Redux store configuration
│   ├── contentSlice.ts         # Content state + reducers
│   ├── prefsSlice.ts           # User preferences
│   ├── favoritesSlice.ts       # Favorites
│   └── api/
│       └── contentApi.ts       # RTK Query endpoints
├── hooks/
│   ├── useDebounce.ts
│   ├── useDragDrop.ts
│   └── useLocalStorage.ts
├── types/
│   └── index.ts                # Shared TypeScript types
├── __tests__/
│   ├── components/
│   │   ├── ContentCard.test.tsx
│   │   └── SearchBar.test.tsx
│   ├── store/
│   │   ├── contentSlice.test.ts
│   │   └── prefsSlice.test.ts
│   └── integration/
│       └── feed.test.tsx
├── e2e/
│   ├── search.spec.ts
│   ├── dragdrop.spec.ts
│   └── favorites.spec.ts
├── PersonalizedDashboard.jsx   # ← Self-contained demo component
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.ts
```

---

## ⚡ Quick Start

### 1. Clone & install

```bash
git clone https://github.com/YOUR_USERNAME/pulse-dashboard
cd pulse-dashboard
npm install
```

### 2. Environment variables

Create `.env.local`:

```env
# Anthropic Claude API (content generation)
ANTHROPIC_API_KEY=sk-ant-...

# Optional: NewsAPI for real news
NEXT_PUBLIC_NEWS_API_KEY=your_newsapi_key

# Optional: TMDB for movie recommendations
NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_key
```

> **Note:** The self-contained `PersonalizedDashboard.jsx` demo calls the Anthropic API directly from the browser — no `.env` needed for the demo.

### 3. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Run tests

```bash
# Unit + integration tests
npm run test

# Watch mode
npm run test:watch

# E2E tests (Playwright)
npm run test:e2e
```

### 5. Build & deploy

```bash
npm run build
npm run start

# Deploy to Vercel (recommended)
npx vercel --prod
```

---

## 🗂 State Architecture (Redux Toolkit)

```
Redux Store
├── content
│   ├── items[]          # All fetched content
│   ├── loading          # Fetch status
│   └── error            # Error state
├── prefs
│   ├── categories[]     # Selected categories
│   └── darkMode         # Theme
└── favorites
    └── items[]          # Saved content items
```

All slices are persisted via `redux-persist` to `localStorage`.

Async data fetching uses **RTK Query** with tagged invalidation — refreshing the feed invalidates the `content` tag and triggers a re-fetch.

---

## 🧪 Testing Coverage

### Unit tests (Vitest + RTL)
- `ContentCard` — renders title, description, category badge; handles favorite toggle; handles missing image
- `SearchBar` — renders, debounces input, fires callback after 300ms
- `contentSlice` — SET_CONTENT, REORDER, handles empty arrays
- `prefsSlice` — TOGGLE_CATEGORY (add / remove), min-1 guard, SET_DARKMODE
- `favoritesSlice` — TOGGLE_FAV add / remove

### Integration tests
- Feed renders cards when content is loaded
- Empty state shown when no categories match
- Skeleton shown during loading state
- Favorites view shows saved items correctly

### E2E tests (Playwright)
- **Search flow** — type query → results filter → clear → all results return
- **Drag-and-drop** — drag card → drop on target → order changes
- **Favorites flow** — heart card → appears in Favorites view → unheart → removed
- **Dark mode** — toggle → theme changes → survives page reload

---

## 📱 Responsive Design

| Breakpoint | Layout |
|---|---|
| `< 640px` (mobile) | Single column, collapsed sidebar |
| `640–1024px` (tablet) | 2-column grid, icon-only sidebar |
| `> 1024px` (desktop) | 3-column grid, full sidebar |

---

## ♿ Accessibility

- Semantic HTML (`<nav>`, `<main>`, `<header>`, `<aside>`, `<section>`)
- `aria-label` on all icon-only buttons
- Focus-visible outlines on all interactive elements
- Color contrast ratios meet WCAG AA (4.5:1 minimum)
- `prefers-reduced-motion` media query disables animations

---

## 🔒 Security

- API keys stored in `.env.local` (never committed — see `.gitignore`)
- Next.js API routes proxy external API calls (no keys exposed to browser)
- Content Security Policy headers set in `next.config.ts`
- `sanitize-html` applied to any user-generated content

---

## 🌐 Internationalization (Bonus)

Multi-language support implemented with `react-i18next`:

```bash
# Switch language
i18n.changeLanguage('es') # Spanish
i18n.changeLanguage('hi') # Hindi
i18n.changeLanguage('fr') # French
```

Translation files live in `public/locales/{lang}/common.json`.

---

## 🔄 Real-time Updates (Bonus)

Optional WebSocket-based live feed (requires a WS server):

```ts
// Enable in Settings → "Live Updates"
// Polls every 60s via Server-Sent Events when WebSocket unavailable
```

---

## 📸 Screenshots

| Feed (Dark) | Trending | Favorites | Settings |
|---|---|---|---|
| *(screenshots in `/docs/screenshots/`)* | | | |

---

## 📄 License

MIT — Built as part of SDE Intern Frontend Assignment