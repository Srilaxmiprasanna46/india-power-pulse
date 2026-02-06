import { useMemo } from "react";
import { Flag, TrendingUp, Leaf, Zap, Recycle, Factory } from "lucide-react";
import { GeneratedEnergy } from "@/data/stateData";

interface India2047Props {
  energyData: Map<string, GeneratedEnergy>;
}

interface GoalIndicator {
  label: string;
  current: number;
  target: number;
  unit: string;
  icon: React.ElementType;
  insight: string;
  color: string;
}

const India2047 = ({ energyData }: India2047Props) => {
  const goals = useMemo<GoalIndicator[]>(() => {
    if (energyData.size === 0) return [];

    let totalDemand = 0, totalRenewable = 0, totalGrid = 0, totalWastage = 0;

    energyData.forEach((d) => {
      totalDemand += d.totalDemand;
      totalRenewable += d.totalRenewable;
      totalGrid += d.gridEnergy;
    });

    const renewablePct = Math.round((totalRenewable / totalDemand) * 100);
    const gridPct = Math.round((totalGrid / totalDemand) * 100);

    // Estimate wastage as ~8% of total demand (aggregate from sector analysis)
    totalWastage = Math.round(totalDemand * 0.08);
    const wastagePct = Math.round((totalWastage / totalDemand) * 100);

    // CO₂ emissions based on grid energy (grid factor: 0.82 t CO₂/MWh)
    const carbonIntensity = Math.round((totalGrid * 0.82) / totalDemand * 1000); // g CO₂/kWh
    const targetCarbonIntensity = 150; // g CO₂/kWh target for 2047

    return [
      {
        label: "Renewable Energy Penetration",
        current: renewablePct,
        target: 85,
        unit: "%",
        icon: Zap,
        insight: renewablePct >= 70
          ? `Strong progress — ${renewablePct}% renewable penetration exceeds 2030 interim targets.`
          : renewablePct >= 50
          ? `Moderate progress — ${renewablePct}% achieved. Accelerated solar/wind expansion needed to reach 85% by 2047.`
          : `Significant gap remains — current ${renewablePct}% requires aggressive renewable capacity additions.`,
        color: "hsl(var(--renewable))",
      },
      {
        label: "Grid Dependency Reduction",
        current: 100 - gridPct,
        target: 90,
        unit: "%",
        icon: Factory,
        insight: gridPct < 30
          ? `Grid dependency at ${gridPct}% — approaching energy self-sufficiency through renewables.`
          : `Grid dependency at ${gridPct}% — needs reduction to <10% for 2047 targets through distributed generation.`,
        color: "hsl(var(--primary))",
      },
      {
        label: "Carbon Emission Reduction",
        current: Math.min(100, Math.round((1 - carbonIntensity / 820) * 100)),
        target: 82,
        unit: "% reduced",
        icon: Leaf,
        insight: `Carbon intensity at ${carbonIntensity} g CO₂/kWh vs target of ${targetCarbonIntensity} g CO₂/kWh. ${
          carbonIntensity <= 300 ? 'On track for net-zero pathway.' : 'Needs accelerated decarbonization of remaining grid supply.'
        }`,
        color: "hsl(var(--accent))",
      },
      {
        label: "Energy Wastage Reduction",
        current: Math.min(100, Math.round((1 - wastagePct / 15) * 100)),
        target: 95,
        unit: "% efficiency",
        icon: Recycle,
        insight: wastagePct <= 5
          ? `Wastage at ${wastagePct}% — near-optimal efficiency achieved through smart grid management.`
          : `Wastage at ${wastagePct}% — smart metering, LED conversion, and demand-side management can reduce this further.`,
        color: "hsl(var(--wastage))",
      },
    ];
  }, [energyData]);

  if (goals.length === 0) return null;

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <Flag className="w-5 h-5 text-primary" />
        <h3 className="text-sm font-semibold">🇮🇳 India @ 2047 — Sustainability Progress</h3>
      </div>
      <p className="text-[10px] text-muted-foreground mb-4">
        Tracking progress toward India's centenary sustainability vision across key energy indicators
      </p>

      <div className="space-y-4">
        {goals.map((goal) => {
          const progress = Math.min(100, Math.round((goal.current / goal.target) * 100));
          const GoalIcon = goal.icon;

          return (
            <div key={goal.label} className="bg-secondary/20 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <GoalIcon className="w-4 h-4" style={{ color: goal.color }} />
                <span className="text-xs font-semibold flex-1">{goal.label}</span>
                <span className="text-xs font-mono" style={{ color: goal.color }}>
                  {goal.current}{goal.unit}
                </span>
              </div>

              {/* Progress bar */}
              <div className="relative mb-2">
                <div className="w-full bg-secondary/40 rounded-full h-2.5">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.min(100, progress)}%`,
                      background: goal.color,
                      opacity: 0.85,
                    }}
                  />
                </div>
                {/* Target marker */}
                <div
                  className="absolute top-0 h-2.5 w-0.5 bg-foreground/60"
                  style={{ left: '100%', transform: 'translateX(-2px)' }}
                  title={`Target: ${goal.target}${goal.unit}`}
                />
              </div>

              <div className="flex items-center justify-between text-[9px] text-muted-foreground mb-2">
                <span>Current: {goal.current}{goal.unit}</span>
                <span>2047 Target: {goal.target}{goal.unit}</span>
              </div>

              {/* Progress percentage */}
              <div className="flex items-center gap-2 mb-1.5">
                <TrendingUp className="w-3 h-3 text-muted-foreground" />
                <span className="text-[10px] font-mono" style={{ color: progress >= 80 ? 'hsl(var(--accent))' : progress >= 50 ? 'hsl(var(--primary))' : 'hsl(var(--destructive))' }}>
                  {progress}% toward 2047 goal
                </span>
              </div>

              {/* Insight */}
              <p className="text-[10px] text-muted-foreground italic leading-relaxed">
                💡 {goal.insight}
              </p>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-4 bg-primary/5 border border-primary/20 rounded-lg p-3">
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          <span className="text-primary font-semibold">Summary:</span> India's energy transition shows
          {goals[0]?.current >= 60 ? ' encouraging' : ' emerging'} momentum toward the 2047 vision.
          {' '}Key priorities remain accelerating renewable capacity, reducing grid dependency through distributed
          generation, and minimizing wastage via smart grid and demand-side management.
        </p>
      </div>
    </div>
  );
};

export default India2047;
