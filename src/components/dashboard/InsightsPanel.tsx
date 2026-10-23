import { useState } from "react";
import { Lightbulb, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { fetchInsights, InsightsResponse } from "@/lib/api";
import { GeneratedEnergy } from "@/data/stateData";

interface InsightsPanelProps {
  energyData: Map<string, GeneratedEnergy>;
}

const SAMPLE_VALUES = [
  { label: "15% — Early Stage",  value: 15 },
  { label: "35% — Developing",   value: 35 },
  { label: "55% — Good Progress",value: 55 },
  { label: "75% — Advanced",     value: 75 },
];

const InsightsPanel = ({ energyData }: InsightsPanelProps) => {
  const [result,  setResult]  = useState<InsightsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [manualRenewable, setManualRenewable] = useState<number | null>(null);

  const getAvgRenewable = () => {
    if (manualRenewable !== null) return manualRenewable;
    if (energyData.size === 0) return 45;
    const vals = Array.from(energyData.values());
    return Math.round(vals.reduce((s, d) => s + d.renewablePercent, 0) / vals.length);
  };

  const handleFetch = async (overrideRenewable?: number) => {
    setLoading(true); setError(null);
    const r = overrideRenewable ?? getAvgRenewable();
    try {
      setResult(await fetchInsights(r));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Backend unavailable");
    } finally { setLoading(false); }
  };

  const ICONS = ["💡", "🌱", "⚡", "🔋", "🌍"];

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb className="w-5 h-5 text-primary" />
        <h3 className="text-sm font-semibold">AI Policy Insights</h3>
        <span className="ml-auto text-[10px] text-muted-foreground bg-primary/10 px-2 py-0.5 rounded-full">
          {energyData.size > 0 ? `Avg ${getAvgRenewable()}% renewable` : "Select scenario below"}
        </span>
      </div>

      {/* Quick scenario buttons */}
      <div className="mb-3">
        <p className="text-[10px] text-muted-foreground mb-1.5">Quick scenarios (or use your generated data above):</p>
        <div className="flex flex-wrap gap-1.5">
          {SAMPLE_VALUES.map((s) => (
            <button key={s.label}
              onClick={() => { setManualRenewable(s.value); handleFetch(s.value); }}
              className="text-[10px] px-2 py-1 rounded bg-secondary/40 hover:bg-primary/20 border border-border text-muted-foreground hover:text-foreground transition-colors">
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Manual renewable slider */}
      <div className="mb-4">
        <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
          <span>Or set renewable % manually</span>
          <span className="font-mono text-primary">{manualRenewable ?? getAvgRenewable()}%</span>
        </div>
        <input type="range" min={5} max={95} step={5}
          value={manualRenewable ?? getAvgRenewable()}
          onChange={(e) => setManualRenewable(Number(e.target.value))}
          className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-secondary/40"
          style={{ accentColor: "hsl(var(--primary))" }}
        />
      </div>

      {result && (
        <div className="space-y-2 mb-4 animate-fade-in">
          <div className="flex justify-between text-[10px] text-muted-foreground mb-2">
            <span>Based on <span className="text-primary font-semibold">{result.renewable_percent}%</span> renewable energy</span>
            <span className="text-primary">{result.suggestions.length} recommendations</span>
          </div>
          {result.suggestions.map((s, i) => (
            <div key={i} className="flex items-start gap-2 bg-secondary/20 rounded-md p-2.5 border border-border/50">
              <span className="text-base flex-shrink-0">{ICONS[i]}</span>
              <p className="text-xs text-muted-foreground leading-relaxed">{s}</p>
            </div>
          ))}
        </div>
      )}

      {!result && !loading && (
        <div className="text-center py-4 text-muted-foreground mb-3">
          <Lightbulb className="w-8 h-8 mx-auto mb-2 opacity-20" />
          <p className="text-xs">Click a scenario above or press Get Insights</p>
        </div>
      )}

      {error && (
        <div className="mb-3 bg-destructive/10 border border-destructive/30 rounded-md p-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
            <p className="text-xs text-destructive font-medium">Backend not reachable</p>
          </div>
          <p className="text-[11px] text-destructive/80 mt-1 ml-6">{error}</p>
          <div className="mt-2 ml-6 bg-secondary/30 rounded p-2">
            <p className="text-[10px] text-muted-foreground font-mono">cd backend</p>
            <p className="text-[10px] text-muted-foreground font-mono">uvicorn app:app --reload</p>
          </div>
        </div>
      )}

      <button onClick={() => handleFetch()} disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-60 text-primary-foreground rounded-md px-4 py-2 text-sm font-medium transition-colors">
        {loading
          ? <><Loader2 className="w-4 h-4 animate-spin" />Fetching Insights...</>
          : <><RefreshCw className="w-4 h-4" />{result ? "Refresh Insights" : "Get Insights"}</>}
      </button>
    </div>
  );
};

export default InsightsPanel;
