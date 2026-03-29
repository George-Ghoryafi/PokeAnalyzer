import { exportTeamToShowdown, importTeamFromShowdown } from './showdownParser';
import type { TeamSlotState } from '../data/mocks';

export interface SavedTeamManifest {
  id: string;
  name: string;
  game: string;
  createdAt: number;
  showdownData: string;
  sprites: string[];
}

const STORAGE_KEY = 'pokemon_team_builder_saves';

export function getSavedTeams(): SavedTeamManifest[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to parse saved teams from localStorage');
    return [];
  }
}

export function saveTeam(name: string, game: string, team: TeamSlotState[]): SavedTeamManifest {
  const teams = getSavedTeams();
  const showdownData = exportTeamToShowdown(team);
  const sprites = team.filter(s => s.pokemon).map(s => s.pokemon!.spriteUrl);

  const manifest: SavedTeamManifest = {
    id: crypto.randomUUID(),
    name: name.trim() || 'Untitled Team',
    game,
    createdAt: Date.now(),
    showdownData,
    sprites
  };

  teams.push(manifest);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(teams));
  return manifest;
}

export function deleteTeam(id: string): void {
  const teams = getSavedTeams();
  const updated = teams.filter(t => t.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export async function loadTeam(id: string): Promise<{ team: TeamSlotState[], game: string } | null> {
  const teams = getSavedTeams();
  const manifest = teams.find(t => t.id === id);
  
  if (!manifest) return null;

  try {
    const parsedTeam = await importTeamFromShowdown(manifest.showdownData);
    return {
      team: parsedTeam,
      game: manifest.game
    };
  } catch (e) {
    console.error('Failed to parse loaded team data', e);
    return null;
  }
}
