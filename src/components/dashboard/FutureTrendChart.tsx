import { useState } from "react";
import {
  ComposedChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, ReferenceLine, Area,
} from "recharts";
import { BarChart2, Loader2, AlertCircle, TrendingUp } from "lucide-react";
import { fetchFutureTrend } from "@/lib/api";
import { GeneratedEnergy } from "@/data/stateData";

interface Props { energyData: Map<string, GeneratedEnergy>; selectedState: string | null; }

const tt = { contentStyle: { background: "hsl(222,20%,10%)", border: "1px solid hsl(222,15%,18%)", borderRadius: 8, fontSize: 11 } };
const tk = { fill: "hsl(215,15%,55%)", fontSize: 10 };

// Pre-baked scenarios the user can click without needing backend (for demo)
const SCENARIOS = [
  { label: "Business as Usual", renewable: 30, energy: 800 },
  { label: "Moderate Transition", renewable: 45, energy: 900 },
  { label: "Aggressive Green",   renewable: 60, energy: 950 },
];

const FutureTrendChart = ({ energyData, selectedState }: Props) => {
  const [trendData, setTrendData] = useState<{ year: number; emissions: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [loaded,  setLoaded]  = useState(false);
  const [activeScenario, setActiveScenario] = useState<string | null>(null);

  const getBaseStats = () => {
    if (energyData.size > 0) {
      const vals = Array.from(energyData.values());
      const totalDemand    = vals.reduce((s, d) => s + d.totalDemand, 0);
      const totalRenewable = vals.reduce((s, d) => s + d.totalRenewable, 0);
      const renewablePct   = Math.round((totalRenewable / totalDemand) * 100);
      // Clamp energy to model-friendly range 500-1200 TWh
      const energy = Math.min(1200, Math.max(500, Math.round(totalDemand / 600)));
      return { renewable: renewablePct, energy };
    }
    return { renewable: 45, energy: 880 };
  };

  const doFetch = async (renewable: number, energy: number, label?: string) => {
    setLoading(true); setError(null); setActiveScenario(label ?? null);
    try {
      const data = await fetchFutureTrend(renewable, energy);
      setTrendData(data);
      setLoaded(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to fetch trend data");
    } finally { setLoading(false); }
  };

  const maxEm = trendData.length ? Math.max(...trendData.map((d) => d.emissions)) : 1;
  const minEm = trendData.length ? Math.min(...trendData.map((d) => d.emissions)) : 0;

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center gap-2 mb-1">
        <BarChart2 className="w-5 h-5 text-primary" />
        <h3 className="text-sm font-semibold">
          Predicted Emissions Trend — {selectedState || "National"} (2025–2047)
        </h3>
        <span className="ml-auto text-[10px] text-muted-foreground bg-primary/10 px-2 py-0.5 rounded-full">
          ML Powered
        </span>
      </div>
      <p className="text-[10px] text-muted-foreground mb-3">
        Calls /predict for 8 future years — renewable grows +1.5%/yr, energy +2%/yr from base.
      </p>

      {/* Scenario presets */}
      <div className="mb-3">
        <p className="text-[10px] text-muted-foreground mb-1.5">Select a scenario to load trend:</p>
        <div className="flex flex-wrap gap-1.5">
          {SCENARIOS.map((s) => (
            <button key={s.label}
              onClick={() => doFetch(s.renewable, s.energy, s.label)}
              className={`text-[10px] px-2 py-1 rounded border transition-colors
                ${activeScenario === s.label
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-secondary/40 hover:bg-primary/20 border-border text-muted-foreground hover:text-foreground"}`}>
              {s.label}
            </button>
          ))}
          {energyData.size > 0 && (
            <button
              onClick={() => { const { renewable, energy } = getBaseStats(); doFetch(renewable, energy, "From Current Data"); }}
              className={`text-[10px] px-2 py-1 rounded border transition-colors
                ${activeScenario === "From Current Data"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-primary/10 hover:bg-primary/20 border-primary/30 text-primary"}`}>
              📊 From Current Data
            </button>
          )}
        </div>
      </div>

      {!loaded && !loading && (
        <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
          <TrendingUp className="w-8 h-8 mb-2 opacity-20" />
          <p className="text-xs">Select a scenario above or click Load Trend below</p>
        </div>
      )}

      {loaded && trendData.length > 0 && (
        <div className="mb-4 animate-fade-in">
          <ResponsiveContainer width="100%" height={230}>
            <ComposedChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222,15%,18%)" />
              <XAxis dataKey="year" tick={tk} />
              <YAxis tick={tk} domain={[0, Math.ceil(maxEm * 1.1)]} />
              <Tooltip {...tt} formatter={(v: number) => [`${v.toFixed(1)} Mt CO₂`, "Emissions"]} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {/* Shaded area under line */}
              <Area type="monotone" dataKey="emissions" fill="hsl(185,80%,45%)" fillOpacity={0.08} stroke="none" />
              {/* Net-zero reference */}
              <ReferenceLine y={50} stroke="hsl(var(--renewable))" strokeDasharray="4 4"
                label={{ value: "Near Net-Zero (50 Mt)", fill: "hsl(var(--renewable))", fontSize: 9, position: "insideTopLeft" }} />
              <Line type="monotone" dataKey="emissions"
                stroke="hsl(185,80%,45%)" strokeWidth={2.5} strokeDasharray="6 3"
                dot={{ fill: "hsl(185,80%,45%)", r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6 }} name={`Emissions (Mt CO₂) · ${activeScenario ?? ""}`} />
            </ComposedChart>
          </ResponsiveContainer>

          {/* Year badges */}
          <div className="flex flex-wrap gap-2 mt-3">
            {trendData.map((d) => {
              const pct = maxEm > 0 ? d.emissions / maxEm : 0;
              const col = d.emissions === 0
                ? "hsl(var(--renewable))"
                : pct < 0.35 ? "hsl(var(--renewable))"
                : pct < 0.65 ? "hsl(50,80%,55%)"
                : "hsl(var(--destructive))";
              return (
                <div key={d.year} className="flex flex-col items-center bg-secondary/20 rounded px-2 py-1 min-w-[54px] text-center">
                  <span className="text-[9px] text-muted-foreground">{d.year}</span>
                  <span className="text-[11px] font-bold font-mono" style={{ color: col }}>
                    {d.emissions.toFixed(0)}
                  </span>
                  <span className="text-[8px] text-muted-foreground/60">Mt</span>
                </div>
              );
            })}
          </div>

          {minEm === 0 && (
            <p className="mt-2 text-[10px] text-renewable">
              ✅ Net-zero achieved in some future years — shown as 0 Mt CO₂
            </p>
          )}
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

      <button onClick={() => { const { renewable, energy } = getBaseStats(); doFetch(renewable, energy); }}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-60 text-primary-foreground rounded-md px-4 py-2 text-sm font-medium transition-colors">
        {loading
          ? <><Loader2 className="w-4 h-4 animate-spin" />Fetching Trend...</>
          : <><TrendingUp className="w-4 h-4" />{loaded ? "Refresh Trend" : "Load Predicted Trend"}</>}
      </button>
    </div>
  );
};

export default FutureTrendChart;
