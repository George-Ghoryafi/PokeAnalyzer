import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getSavedTeams, saveTeam, deleteTeam } from '../../lib/teamStorage';
import type { TeamSlotState } from '../../data/mocks';
import { createMockSlot, CHARIZARD, FLAMETHROWER } from '../fixtures/teamFixtures';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
    get length() { return Object.keys(store).length; },
    key: vi.fn((_index: number) => null),
  };
})();

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

// Mock crypto.randomUUID
vi.stubGlobal('crypto', { randomUUID: vi.fn(() => 'test-uuid-' + Math.random().toString(36).slice(2, 10)) });

describe('teamStorage', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('getSavedTeams', () => {
    it('returns empty array when localStorage is empty', () => {
      expect(getSavedTeams()).toEqual([]);
    });

    it('returns parsed array when valid data exists', () => {
      const manifests = [
        { id: '1', name: 'Team A', game: 'national', createdAt: 1000, showdownData: '', sprites: [] },
      ];
      localStorageMock.setItem('pokemon_team_builder_saves', JSON.stringify(manifests));

      const result = getSavedTeams();
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Team A');
    });

    it('returns empty array on malformed JSON (graceful fallback)', () => {
      localStorageMock.setItem('pokemon_team_builder_saves', '{bad json');

      const result = getSavedTeams();
      expect(result).toEqual([]);
    });
  });

  describe('saveTeam', () => {
    it('saves a manifest with correct name, game, and showdownData', () => {
      const team: TeamSlotState[] = [
        createMockSlot({
          pokemon: CHARIZARD,
          moves: [FLAMETHROWER, null, null, null],
        }),
        ...Array(5).fill(null).map(() => createMockSlot()),
      ];

      const result = saveTeam('My Team', 'national', team);
      expect(result.name).toBe('My Team');
      expect(result.game).toBe('national');
      expect(result.showdownData).toContain('Charizard');
      expect(result.id).toBeDefined();
    });

    it('generates unique IDs for multiple saves', () => {
      const team: TeamSlotState[] = Array(6).fill(null).map(() => createMockSlot());

      const r1 = saveTeam('Team 1', 'national', team);
      const r2 = saveTeam('Team 2', 'national', team);
      expect(r1.id).not.toBe(r2.id);
    });

    it('defaults name to "Untitled Team" when empty string provided', () => {
      const team: TeamSlotState[] = Array(6).fill(null).map(() => createMockSlot());
      const result = saveTeam('', 'national', team);
      expect(result.name).toBe('Untitled Team');
    });
  });

  describe('deleteTeam', () => {
    it('removes only the target team', () => {
      const manifests = [
        { id: 'a', name: 'Team A', game: 'national', createdAt: 1000, showdownData: '', sprites: [] },
        { id: 'b', name: 'Team B', game: 'national', createdAt: 2000, showdownData: '', sprites: [] },
      ];
      localStorageMock.setItem('pokemon_team_builder_saves', JSON.stringify(manifests));

      deleteTeam('a');

      const remaining = getSavedTeams();
      expect(remaining).toHaveLength(1);
      expect(remaining[0].id).toBe('b');
    });

    it('no-op when deleting a non-existent ID', () => {
      const manifests = [
        { id: 'a', name: 'Team A', game: 'national', createdAt: 1000, showdownData: '', sprites: [] },
      ];
      localStorageMock.setItem('pokemon_team_builder_saves', JSON.stringify(manifests));

      deleteTeam('nonexistent');

      const remaining = getSavedTeams();
      expect(remaining).toHaveLength(1);
    });
  });
});
