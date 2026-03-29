import { useState, useEffect } from 'react';
import type { TeamSlotState } from '../../data/mocks';
import { compileTeamTelemetry } from '../../lib/telemetry';
import { Sparkles, AlertTriangle, Lightbulb, Zap, Cpu, Download } from 'lucide-react';
import { PokeballLoader } from '../ui/PokeballLoader';
import { cn } from '../../lib/utils';
import { CreateMLCEngine } from '@mlc-ai/web-llm';

interface ExpertAnalystProps {
  team: TeamSlotState[];
}

interface AnalysisResult {
  fatal_flaw: string;
  suggested_swap: string;
  moveset_tweak: string;
}

// We use Phi-3.5-mini as it is heavily optimized for WebGPU footprint while remaining instruction-compliant.
const SELECTED_MODEL = "Phi-3.5-mini-instruct-q4f16_1-MLC";

export function ExpertAnalyst({ team }: ExpertAnalystProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadText, setDownloadText] = useState("");
  
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Reset output when team structurally changes
    setResult(null);
  }, [team]);

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    setError(null);
    setDownloadProgress(0);
    
    try {
      setIsDownloading(true);
      
      // Initialize WebGPU Local LLM
      const engine = await CreateMLCEngine(SELECTED_MODEL, {
        initProgressCallback: (progress) => {
          setDownloadProgress(Math.round(progress.progress * 100));
          setDownloadText(progress.text);
        }
      });
      
      setIsDownloading(false);
      
      const telemetry = compileTeamTelemetry(team);
      const prompt = `You are an elite competitive Pokémon analyst expert system. Evaluate the provided team telemetry. Identify the largest structural flaw (be specific), suggest one optimal Pokémon replacement to fix it, and suggest one move change for an existing member. Respond ONLY with valid JSON using exactly these keys: 'fatal_flaw', 'suggested_swap', 'moveset_tweak'. Do not add markdown formatting or explain yourself outside the JSON object.\n\nTelemetry: ${telemetry}`;

      const response = await engine.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1, // Near-zero deterministic JSON
        max_tokens: 500
      });
      
      const rawText = response.choices[0].message.content || "";
      
      // Fast heuristic cleanup of trailing markdown
      let cleaned = rawText.trim();
      if (cleaned.startsWith('```json')) cleaned = cleaned.replace('```json', '');
      if (cleaned.startsWith('```')) cleaned = cleaned.replace('```', '');
      if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);

      const parsed = JSON.parse(cleaned.trim()) as AnalysisResult;
      setResult(parsed);
      
      // Release GPU resources safely
      engine.unload();
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes('WebGPU')) {
        setError("WebGPU is not supported by your current browser. Try Chrome or Edge desktop.");
      } else {
        setError("Analysis Engine failed to process the telemetry node. The model may have returned malformed JSON or the device ran out of VRAM.");
      }
    } finally {
      setIsAnalyzing(false);
      setIsDownloading(false);
    }
  };

  const hasEmptyRoster = team.filter(t => t.pokemon !== null).length === 0;

  return (
    <div className="mt-8 rounded-[2rem] border border-pd-accent/30 bg-pd-accent/5 p-6 md:p-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-pd-accent to-transparent opacity-50" />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 px-2">
        <div>
          <h3 className="text-xl font-black uppercase tracking-widest flex items-center text-foreground">
            <Sparkles className="w-6 h-6 mr-3 text-pd-accent" /> 
            AI Analyst
          </h3>
          <p className="text-xs font-bold text-pd-accent/80 uppercase tracking-widest mt-1">Powered by WebGPU Local Inference</p>
        </div>
        
        <button
          onClick={runAnalysis}
          disabled={isAnalyzing || hasEmptyRoster}
          className={cn(
            "flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-black uppercase tracking-widest text-sm transition-all shadow-sm border",
            isAnalyzing || hasEmptyRoster
              ? "bg-background/50 text-muted-foreground border-border cursor-not-allowed"
              : "bg-pd-accent text-white border-pd-accent/20 hover:bg-pd-accent/90 hover:scale-[1.02] shadow-[0_0_20px_rgba(59,130,246,0.3)]"
          )}
        >
          {isDownloading ? (
            <><Download className="w-4 h-4 animate-bounce" /> Loading Weights</>
          ) : isAnalyzing ? (
            <><PokeballLoader size={16} /> Compiling</>
          ) : (
            <><Cpu className="w-4 h-4" /> Run Diagnostics</>
          )}
        </button>
      </div>

      {isDownloading && (
        <div className="w-full bg-background border border-pd-accent/20 h-14 rounded-xl relative overflow-hidden flex items-center mb-6 shadow-inner">
           <div className="absolute top-0 left-0 h-full bg-pd-accent/10 transition-all duration-300" style={{ width: `${downloadProgress}%` }} />
           <div className="relative z-10 w-full px-5 flex justify-between items-center">
             <span className="text-xs font-mono font-bold text-pd-accent/70 uppercase truncate pr-4">{downloadText}</span>
             <span className="text-sm font-black text-pd-accent">{downloadProgress}%</span>
           </div>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-sm font-medium mb-6 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
          
          <div className="bg-background/80 border border-red-500/20 rounded-2xl p-5 shadow-sm">
            <h4 className="flex items-center text-xs font-black uppercase tracking-widest text-red-500 mb-3 pb-3 border-b border-border/50">
              <AlertTriangle className="w-4 h-4 mr-2" /> Fatal Flaw
            </h4>
            <p className="text-sm font-medium text-muted-foreground leading-relaxed">{result.fatal_flaw}</p>
          </div>

          <div className="bg-background/80 border border-emerald-500/20 rounded-2xl p-5 shadow-sm">
            <h4 className="flex items-center text-xs font-black uppercase tracking-widest text-emerald-500 mb-3 pb-3 border-b border-border/50">
              <Lightbulb className="w-4 h-4 mr-2" /> Suggested Swap
            </h4>
            <p className="text-sm font-medium text-muted-foreground leading-relaxed">{result.suggested_swap}</p>
          </div>

          <div className="bg-background/80 border border-yellow-500/20 rounded-2xl p-5 shadow-sm">
            <h4 className="flex items-center text-xs font-black uppercase tracking-widest text-yellow-500 mb-3 pb-3 border-b border-border/50">
              <Zap className="w-4 h-4 mr-2" /> Moveset Tweak
            </h4>
            <p className="text-sm font-medium text-muted-foreground leading-relaxed">{result.moveset_tweak}</p>
          </div>

        </div>
      )}

      {!result && !isAnalyzing && !error && (
         <div className="w-full flex items-center justify-center py-10 opacity-30">
            <Cpu className="w-12 h-12 text-muted-foreground" />
         </div>
      )}
    </div>
  );
}
