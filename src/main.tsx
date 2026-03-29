import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { ThemeProvider } from './components/theme-provider'
import './index.css'
import App from './App.tsx'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24 * 7, // 7 Days Cache Time
      staleTime: 1000 * 60 * 60 * 24 * 7, // 7 Days Stale Time (Pokémon data rarely changes)
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  },
})

const CURRENT_CACHE_KEY = 'POKEMON_BUILDER_CACHE_V4'; // Cache busted: V3 lacked Mega/GMax dynamic forms

// Garbage collect old caches to prevent 5MB storage quota limits over time
try {
  for (let i = window.localStorage.length - 1; i >= 0; i--) {
    const key = window.localStorage.key(i);
    if (key && key.startsWith('POKEMON_BUILDER_CACHE_') && key !== CURRENT_CACHE_KEY) {
      window.localStorage.removeItem(key);
    }
  }
} catch (e) {
  console.error("Failed to garbage collect local storage caches", e);
}

const persister = createSyncStoragePersister({
  storage: window.localStorage,
  key: CURRENT_CACHE_KEY,
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="pokebuilder-theme">
      <PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
        <App />
      </PersistQueryClientProvider>
    </ThemeProvider>
  </StrictMode>,
)
