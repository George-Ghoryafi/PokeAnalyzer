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

const persister = createSyncStoragePersister({
  storage: window.localStorage,
  key: 'POKEMON_BUILDER_CACHE_V3', // Cache busted: V2 had stale Pokemon type data
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
