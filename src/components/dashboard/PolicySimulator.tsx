import { useState, useRef } from "react";
import { SlidersHorizontal, Loader2, AlertCircle, Play } from "lucide-react";
import { simulatePolicy, SimulateResponse } from "@/lib/api";

const PRESETS = [
  { label: "Coal Heavy",    solar: 10, wind: 10, coal: 70 },
  { label: "Balanced",      solar: 30, wind: 25, coal: 40 },
  { label: "Green Future",  solar: 50, wind: 35, coal: 10 },
  { label: "Full Renewable",solar: 55, wind: 40, coal: 5  },
];

interface SliderProps {
  label: string; value: number; min: number; max: number;
  color: string; onChange: (v: number) => void;
}
const Slider = ({ label, value, min, max, color, onChange }: SliderProps) => (
  <div className="space-y-1.5">
    <div className="flex items-center justify-between">
      <label className="text-xs text-muted-foreground font-medium">{label}</label>
      <span className="text-xs font-mono font-bold" style={{ color }}>{value}%</span>
    </div>
    <input type="range" min={min} max={max} value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-secondary/40"
      style={{ accentColor: color }}
    />
    <div className="flex justify-between text-[9px] text-muted-foreground/50">
      <span>{min}%</span><span>{max}%</span>
    </div>
  </div>
);

const PolicySimulator = () => {
  const [solar, setSolar] = useState(30);
  const [wind,  setWind]  = useState(25);
  const [coal,  setCoal]  = useState(40);
  const [result, setResult] = useState<SimulateResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runSim = async (s: number, w: number, c: number) => {
    setLoading(true); setError(null);
    try {
      setResult(await simulatePolicy(s, w, c));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Backend unavailable");
    } finally { setLoading(false); }
  };

  const debounced = (setter: (v: number) => void, val: number, s: number, w: number, c: number) => {
    setter(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSim(s, w, c), 700);
  };

  const applyPreset = (p: typeof PRESETS[0]) => {
    setSolar(p.solar); setWind(p.wind); setCoal(p.coal);
    setResult(null); setError(null);
    setTimeout(() => runSim(p.solar, p.wind, p.coal), 50);
  };

  const renewable = solar + wind;
  const emColor = result
    ? result.simulated_emissions < 400 ? "hsl(var(--renewable))"
    : result.simulated_emissions < 700 ? "hsl(50,80%,55%)"
    : "hsl(var(--destructive))"
    : "hsl(var(--muted-foreground))";

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <SlidersHorizontal className="w-5 h-5 text-primary" />
        <h3 className="text-sm font-semibold">Policy Simulator</h3>
        <span className="ml-auto text-[10px] text-muted-foreground bg-primary/10 px-2 py-0.5 rounded-full">Live Simulation</span>
      </div>

      {/* Presets */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {PRESETS.map((p) => (
          <button key={p.label} onClick={() => applyPreset(p)}
            className="text-[10px] px-2 py-1 rounded bg-secondary/40 hover:bg-primary/20 border border-border text-muted-foreground hover:text-foreground transition-colors">
            {p.label}
          </button>
        ))}
      </div>

      <div className="space-y-4 mb-4">
        <Slider label="☀️ Solar"  value={solar} min={0} max={80} color="hsl(50,80%,55%)"           onChange={(v) => debounced(setSolar, v, v, wind, coal)} />
        <Slider label="💨 Wind"   value={wind}  min={0} max={80} color="hsl(185,80%,45%)"          onChange={(v) => debounced(setWind,  v, solar, v, coal)} />
        <Slider label="🏭 Coal"   value={coal}  min={0} max={100} color="hsl(var(--destructive))"  onChange={(v) => debounced(setCoal,  v, solar, wind, v)} />
      </div>

      {/* Mix bar */}
      <div className="mb-4">
        <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
          <span>Energy Mix</span>
          <span className={solar + wind + coal > 100 ? "text-destructive" : ""}>
            Total: {solar + wind + coal}%{solar + wind + coal > 100 ? " ⚠ over 100%" : ""}
          </span>
        </div>
        <div className="flex h-3 rounded-full overflow-hidden bg-secondary/30">
          <div style={{ width: `${Math.min(solar, 100)}%`, background: "hsl(50,80%,55%)" }} className="transition-all" />
          <div style={{ width: `${Math.min(wind, 100 - solar)}%`, background: "hsl(185,80%,45%)" }} className="transition-all" />
          <div style={{ width: `${Math.min(coal, Math.max(0, 100 - solar - wind))}%`, background: "hsl(var(--destructive))" }} className="transition-all" />
        </div>
        <div className="flex justify-between text-[9px] text-muted-foreground mt-1">
          <span>☀️ {solar}%</span><span>💨 {wind}%</span><span>🏭 {coal}%</span>
        </div>
      </div>

      <button onClick={() => runSim(solar, wind, coal)} disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-60 text-primary-foreground rounded-md px-4 py-2 text-sm font-medium transition-colors">
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Simulating...</> : <><Play className="w-4 h-4" />Run Simulation</>}
      </button>

      {error && (
        <div className="mt-3 bg-destructive/10 border border-destructive/30 rounded-md p-3">
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

      {result && (
        <div className="mt-3 bg-primary/5 border border-primary/20 rounded-lg p-4 animate-fade-in">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-3">Simulation Result</p>
          <div className="text-center mb-3">
            <p className="text-4xl font-bold font-mono transition-all" style={{ color: emColor }}>
              {result.simulated_emissions.toFixed(1)}
            </p>
            <p className="text-[10px] text-muted-foreground mt-1">Mt CO₂ Simulated</p>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[
              { label: "Solar", val: result.solar, color: "hsl(50,80%,55%)" },
              { label: "Wind",  val: result.wind,  color: "hsl(185,80%,45%)" },
              { label: "Coal",  val: result.coal,  color: "hsl(var(--destructive))" },
            ].map(({ label, val, color }) => (
              <div key={label} className="bg-secondary/20 rounded p-2 text-center">
                <p className="text-sm font-semibold font-mono" style={{ color }}>{val}%</p>
                <p className="text-[9px] text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-center" style={{ color: emColor }}>
            {renewable >= 60
              ? `✅ High renewable mix (${renewable}%) — strong decarbonization`
              : renewable >= 40
              ? `⚠️ Moderate mix (${renewable}%) — increase renewables further`
              : `🔴 Low renewable mix (${renewable}%) — transition needed urgently`}
          </p>
        </div>
      )}
    </div>
  );
};

export default PolicySimulator;
