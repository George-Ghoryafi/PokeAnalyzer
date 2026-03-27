# Pokémon Team Analyzer — project plan

## Purpose

Casual players build teams based on favourites rather than strategy, and get steamrolled in competitive play or late-game content. The official games provide almost no analytical tooling — you're expected to just know the type chart.

This app gives players a real-time weakness audit and coverage map as they build their team, backed by aggressive client-side caching so the experience feels instant even though it's pulling from a live API.

**Interview pitch:** "Pokémon has 1,000+ Pokémon across 18 types and hundreds of moves. I built a team analyzer that surfaces type weaknesses and coverage gaps as you build your team, using React Query to cache static game data aggressively and keep every interaction zero-latency."

---

## Tech stack

- **React** with Vite
- **React Query (TanStack Query v5)** — server state and caching
- **PokéAPI** (`https://pokeapi.co`) — free, no auth required for public data

---

## Phase structure

Each phase delivers a user-facing feature first. The React Query concept is the implementation mechanism, not the goal.

---

### Phase 1 — Pokédex browser + stat panel

**Feature:** Browse Pokémon and click one to load its full stats into a detail panel.

| Concept | Application |
|---|---|
| `useQuery` | Fetch the Pokémon list; fetch individual stats on selection |
| Query keys | Key by Pokémon ID so each entry is cached independently |
| `staleTime` / `gcTime` | Pokémon data never changes — set aggressive `staleTime` and watch the network tab go quiet |

**Learning goal:** Understand why query keys are more than strings — treat them like a dependency array. Observe the difference between `staleTime: 0` and `staleTime: Infinity` in the network tab.

---

### Phase 2 — Type & weakness analysis

**Feature:** When a Pokémon is selected, display its full weakness/resistance matrix (4×, 2×, ½×, 0×) derived from its type damage relations.

| Concept | Application |
|---|---|
| `useQueries` | Each Pokémon has 1–2 types — fetch all type damage relations in parallel |
| `enabled` flag | Gate type lookups on a Pokémon being selected — no wasted fetches on load |
| Derived state | Combine cached type data to compute the weakness matrix without re-fetching |

**Learning goal:** Feel the difference between sequential (waterfall) and parallel fetching. Understand why derived state should be computed from cached data rather than stored separately.

---

### Phase 3 — Team builder + coverage audit

**Feature:** Build a 6-Pokémon team. The app audits your team's collective weaknesses and flags uncovered offensive types in real time.

| Concept | Application |
|---|---|
| `useMutation` | Add / remove Pokémon from your team with optimistic cache writes |
| `setQueryData` | Write team state directly into the cache — faster and more appropriate than invalidating here |
| `onError` rollback | Enforce the 6-Pokémon cap: attempt the add, catch the conflict, restore prior state |

**Learning goal:** Understand when to use `setQueryData` (local, deterministic changes) vs `invalidateQueries` (server-authoritative data). The 6-slot cap creates a real reason to implement rollback.

---

### Phase 4 — Infinite Pokédex scroll

**Feature:** Load the full 1,000+ Pokémon list lazily as the user scrolls, rather than paginating with buttons.

| Concept | Application |
|---|---|
| `useInfiniteQuery` | Load the Pokémon list in pages — understand how the cache stores an array of pages, not a flat list |
| `getNextPageParam` | PokéAPI uses offset/limit pagination — map cursor to query params |
| Intersection Observer | Trigger `fetchNextPage` at the scroll boundary — a classic pairing with `useInfiniteQuery` |

**Learning goal:** Internalize how `useInfiniteQuery`'s cache shape differs from `useQuery`. Understand why `getNextPageParam` returning `undefined` stops the fetch loop.

---

### Phase 5 — Prefetch + instant comparison

**Feature:** Hovering over a Pokémon card prefetches its data so the detail panel opens instantly. A side-by-side stat comparison view renders from cache with no loading states.

| Concept | Application |
|---|---|
| `prefetchQuery` | Call `queryClient.prefetchQuery` on card hover — open the panel and it's already there |
| `placeholderData` | Show list-level data (name, sprite) instantly while the full stat fetch resolves |
| Side-by-side compare | Select two Pokémon and render a stat chart — both fetched from cache, zero loading states |

**Learning goal:** Understand the difference between `initialData` (treated as real, affects `staleTime`) and `placeholderData` (treated as a placeholder, always re-fetches). Feel how Phase 1–4 cache warmth makes Phase 5 feel instantaneous by design.

---

## Caching strategy summary

Pokémon data is completely static — types, stats, and moves never change between requests. This makes it an ideal candidate for aggressive caching:

- Set `staleTime: Infinity` for Pokémon and type data
- Use `setQueryData` for local team mutations (no server round-trip needed)
- Prefetch on hover to eliminate perceived latency entirely

The result is an app that feels like a local database after the first browsing session, even though all data is fetched from a live API.
