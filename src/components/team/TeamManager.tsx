import { useState, useEffect } from 'react';
import { Save, FolderOpen, Code2, Trash2, CheckCircle2, ChevronDown, Download, Upload } from 'lucide-react';
import { PokeballLoader } from '../ui/PokeballLoader';
import type { TeamSlotState } from '../../data/mocks';
import { cn } from '../../lib/utils';
import { getSavedTeams, saveTeam, deleteTeam, loadTeam } from '../../lib/teamStorage';
import type { SavedTeamManifest } from '../../lib/teamStorage';
import { exportTeamToShowdown, importTeamFromShowdown } from '../../lib/showdownParser';

interface TeamManagerProps {
  currentTeam: TeamSlotState[];
  selectedGame: string;
  onLoadTeam: (team: TeamSlotState[], game: string) => void;
}

export function TeamManager({ currentTeam, selectedGame, onLoadTeam }: TeamManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'manager' | 'export'>('manager');
  
  // Local store state
  const [savedTeams, setSavedTeams] = useState<SavedTeamManifest[]>([]);
  const [saveName, setSaveName] = useState('');
  
  // Parser loader bounds
  const [isProcessing, setIsProcessing] = useState(false);
  const [exportText, setExportText] = useState('');
  const [importText, setImportText] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSavedTeams(getSavedTeams());
      setExportText(exportTeamToShowdown(currentTeam));
      setImportText('');
    }
  }, [isOpen, currentTeam]);

  const handleSaveCurrent = () => {
    if (!saveName.trim()) return;
    saveTeam(saveName, selectedGame, currentTeam);
    setSaveName('');
    setSavedTeams(getSavedTeams());
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteTeam(id);
    setSavedTeams(getSavedTeams());
  };

  const handleLoad = async (id: string) => {
    setIsProcessing(true);
    const data = await loadTeam(id);
    if (data) {
      onLoadTeam(data.team, data.game);
      setIsOpen(false);
    }
    setIsProcessing(false);
  };

  const handleImportText = async () => {
    if (!importText.trim()) return;
    setIsProcessing(true);
    try {
      const parsedTeam = await importTeamFromShowdown(importText);
      onLoadTeam(parsedTeam, selectedGame); // Imports inherit the current gamemode to force checks on SlotEditor level
      setIsOpen(false);
    } catch (e) {
      console.error('Import failed', e);
      alert('Failed to parse Showdown string. Some Pokemon data could not be resolved from API!');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(exportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative z-50">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card border border-border/50 text-xs font-bold shadow-sm hover:border-pd-accent/50 hover:bg-pd-surface transition-all text-muted-foreground hover:text-foreground"
      >
        <FolderOpen className="w-3.5 h-3.5" />
        <span className="hidden md:inline">Manage Box</span>
        <ChevronDown className={cn("w-3 h-3 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/5" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-96 max-w-[90vw] bg-card/95 backdrop-blur-xl border border-border/80 shadow-2xl rounded-2xl z-50 overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2 duration-200">
            
            {/* Tabs */}
            <div className="flex w-full border-b border-border/40 bg-black/10">
              <button 
                onClick={() => setActiveTab('manager')}
                className={cn("flex-1 py-3 text-xs font-black uppercase tracking-widest border-b-2 transition-colors", activeTab === 'manager' ? "border-pd-accent text-pd-accent" : "border-transparent text-muted-foreground hover:bg-white/5")}
              >
                Local Saves
              </button>
              <button 
                onClick={() => setActiveTab('export')}
                className={cn("flex-1 py-3 text-xs font-black uppercase tracking-widest border-b-2 transition-colors", activeTab === 'export' ? "border-emerald-400 text-emerald-400" : "border-transparent text-muted-foreground hover:bg-white/5")}
              >
                Showdown I/O
              </button>
            </div>

            {/* Processing Overlay */}
            {isProcessing && (
              <div className="absolute inset-0 z-50 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in">
                <PokeballLoader size={32} className="mb-4 opacity-90" />
                <p className="text-xs font-bold tracking-widest uppercase animate-pulse">Resolving Pokedex Data...</p>
              </div>
            )}

            <div className="p-4 max-h-[400px] overflow-y-auto custom-scrollbar">
              {activeTab === 'manager' ? (
                <div className="space-y-6">
                  {/* Save current box */}
                  <div className="bg-black/20 p-3 rounded-xl border border-border/30">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center mb-2">
                      <Save className="w-3 h-3 mr-1.5" /> Save Current Team
                    </h4>
                    <div className="flex gap-2">
                      <input 
                        className="flex-1 bg-background rounded-md border border-border/50 px-2 py-1.5 text-xs font-bold placeholder:font-medium placeholder:text-muted-foreground/50 focus:border-pd-accent focus:outline-none"
                        placeholder="My VGC 2026 Core..."
                        value={saveName}
                        onChange={(e) => setSaveName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveCurrent()}
                      />
                      <button 
                        onClick={handleSaveCurrent}
                        disabled={!saveName.trim()}
                        className="px-3 rounded-md bg-pd-accent text-white disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110 active:scale-95 transition-all text-xs font-black"
                      >
                        SAVE
                      </button>
                    </div>
                  </div>

                  {/* Saved teams list */}
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">Saved Rosters</h4>
                    {savedTeams.length === 0 ? (
                      <div className="text-center py-8 opacity-50">
                        <FolderOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-xs font-medium">No saved teams yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {savedTeams.map(t => (
                          <div key={t.id} className="group flex items-center justify-between p-2 rounded-lg border border-border/30 hover:border-pd-accent/30 hover:bg-pd-accent/5 transition-all cursor-pointer" onClick={() => handleLoad(t.id)}>
                            <div className="flex flex-col flex-1 min-w-0">
                              <span className="text-sm font-bold text-foreground group-hover:text-pd-accent transition-colors truncate">{t.name}</span>
                              <span className="text-[9px] uppercase tracking-wider text-muted-foreground mb-1.5">{t.game.replace(/-/g, ' ')} • {new Date(t.createdAt).toLocaleDateString()}</span>
                              <div className="flex items-center gap-0.5">
                                {t.sprites?.map((url, i) => (
                                  <img key={i} src={url} alt="sprite" className="w-6 h-6 object-contain opacity-70 group-hover:opacity-100 transition-opacity rendering-pixelated drop-shadow-sm" />
                                ))}
                              </div>
                            </div>
                            <button onClick={(e) => handleDelete(t.id, e)} className="p-2 lg:opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20 text-red-400 rounded-md">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-400 flex items-center">
                        <Upload className="w-3 h-3 mr-1.5" /> Export Selection
                      </h4>
                      <button 
                        onClick={handleCopy}
                        className="text-[10px] uppercase font-bold text-muted-foreground hover:text-foreground flex items-center"
                      >
                        {copied ? <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-400" /> : <Code2 className="w-3 h-3 mr-1" />}
                        {copied ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <textarea 
                      readOnly
                      value={exportText}
                      className="w-full h-32 bg-black/40 border border-border/30 rounded-lg p-2 text-[10px] font-mono whitespace-pre text-muted-foreground resize-none focus:outline-none custom-scrollbar"
                    />
                  </div>

                  <div className="border-t border-border/30 pt-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-500 flex items-center mb-2">
                      <Download className="w-3 h-3 mr-1.5" /> Import String
                    </h4>
                    <textarea 
                      value={importText}
                      onChange={e => setImportText(e.target.value)}
                      placeholder="Paste Showdown format text here..."
                      className="w-full h-24 bg-background border border-border/50 rounded-lg p-2 text-xs font-mono resize-none focus:border-amber-500/50 focus:outline-none custom-scrollbar transition-colors"
                    />
                    <button 
                      onClick={handleImportText}
                      disabled={!importText.trim()}
                      className="mt-2 w-full py-2 bg-amber-500/20 border border-amber-500/30 text-amber-500 hover:bg-amber-500/30 disabled:opacity-50 transition-all rounded-lg text-xs font-black uppercase tracking-widest"
                    >
                      Import Team
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
