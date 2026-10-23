import { useState } from "react";
import { TrendingUp, Loader2, AlertCircle, Zap, Info } from "lucide-react";
import { predictEmissions, PredictResponse } from "@/lib/api";

// Preset scenarios based on the real dataset (year 2000-2020, renewable 10-60%, energy 500-1000 TWh)
const PRESETS = [
  { label: "2025 – Moderate", year: 2025, renewable: 40, energy: 850 },
  { label: "2030 – Ambitious", year: 2030, renewable: 55, energy: 920 },
  { label: "2035 – Net-Zero Path", year: 2035, renewable: 70, energy: 980 },
  { label: "2020 – Baseline", year: 2020, renewable: 60, energy: 1000 },
];

const EmissionsPredictor = () => {
  const [year, setYear] = useState(2025);
  const [renewable, setRenewable] = useState(40);
  const [energy, setEnergy] = useState(850);
  const [result, setResult] = useState<PredictResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const applyPreset = (p: typeof PRESETS[0]) => {
    setYear(p.year); setRenewable(p.renewable); setEnergy(p.energy);
    setResult(null); setError(null);
  };

  const handlePredict = async () => {
    setLoading(true); setError(null); setResult(null);
    try {
      const data = await predictEmissions(year, renewable, energy);
      setResult(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to connect to backend.");
    } finally {
      setLoading(false);
    }
  };

  const statusColor = result
    ? result.predicted_emissions === 0
      ? "text-renewable"
      : result.predicted_emissions < 200
      ? "text-renewable"
      : result.predicted_emissions < 400
      ? "text-yellow-400"
      : "text-destructive"
    : "";

  const statusMsg = result
    ? result.predicted_emissions === 0
      ? "✅ Net-Zero achieved — excellent renewable adoption!"
      : result.predicted_emissions < 200
      ? "✅ On track for net-zero pathway"
      : result.predicted_emissions < 400
      ? "⚠️ Moderate emissions — increase renewable share"
      : "🔴 High emissions — urgent intervention needed"
    : "";

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="w-5 h-5 text-primary" />
        <h3 className="text-sm font-semibold">Future Emissions Predictor</h3>
        <span className="ml-auto text-[10px] text-muted-foreground bg-primary/10 px-2 py-0.5 rounded-full">
          ML · LinearRegression
        </span>
      </div>

      {/* Hint */}
      <div className="flex items-start gap-2 bg-primary/5 border border-primary/15 rounded-md p-2 mb-3">
        <Info className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
        <p className="text-[10px] text-muted-foreground">
          Model trained on India data (2000–2020). Best inputs: year 2020–2047, renewable 10–95%, energy 500–1500 TWh.
        </p>
      </div>

      {/* Presets */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            onClick={() => applyPreset(p)}
            className="text-[10px] px-2 py-1 rounded bg-secondary/40 hover:bg-primary/20 border border-border text-muted-foreground hover:text-foreground transition-colors"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="space-y-1">
          <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Year</label>
          <input
            type="number" min={2020} max={2047} value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="w-full bg-secondary/30 border border-border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
          />
          <p className="text-[9px] text-muted-foreground">2020 – 2047</p>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Renewable %</label>
          <input
            type="number" min={10} max={95} value={renewable}
            onChange={(e) => setRenewable(Number(e.target.value))}
            className="w-full bg-secondary/30 border border-border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
          />
          <div className="w-full bg-secondary/40 rounded-full h-1">
            <div className="bg-renewable h-full rounded-full" style={{ width: `${Math.min(renewable, 100)}%` }} />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Energy (TWh)</label>
          <input
            type="number" min={500} max={1500} value={energy}
            onChange={(e) => setEnergy(Number(e.target.value))}
            className="w-full bg-secondary/30 border border-border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
          />
          <p className="text-[9px] text-muted-foreground">500 – 1500 TWh</p>
        </div>
      </div>

      <button
        onClick={handlePredict} disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-60 text-primary-foreground rounded-md px-4 py-2 text-sm font-medium transition-colors"
      >
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Predicting...</> : <><Zap className="w-4 h-4" />Predict Emissions</>}
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
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-3">Prediction Result</p>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="text-center bg-secondary/20 rounded-lg p-3">
              <p className={`text-3xl font-bold font-mono ${statusColor}`}>
                {result.predicted_emissions.toFixed(1)}
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">Mt CO₂</p>
            </div>
            <div className="space-y-2">
              {[
                { label: "Year", value: result.year, color: "text-foreground" },
                { label: "Renewable", value: `${result.renewable_percent}%`, color: "text-renewable" },
                { label: "Energy", value: `${result.energy_consumption} TWh`, color: "text-foreground" },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex justify-between text-xs bg-secondary/20 rounded px-2 py-1">
                  <span className="text-muted-foreground">{label}</span>
                  <span className={`font-mono font-semibold ${color}`}>{value}</span>
                </div>
              ))}
            </div>
          </div>
          <p className={`text-[11px] font-medium ${statusColor}`}>{statusMsg}</p>
        </div>
      )}
    </div>
  );
};

export default EmissionsPredictor;
