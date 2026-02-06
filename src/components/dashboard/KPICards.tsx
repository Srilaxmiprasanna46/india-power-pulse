import { Zap, TrendingUp, Leaf, Sun, TreePine, Activity } from "lucide-react";
import { GeneratedEnergy } from "@/data/stateData";

interface KPICardsProps {
  energyData: Map<string, GeneratedEnergy>;
  selectedState: string | null;
  metricMode: string;
}

const KPICards = ({ energyData, selectedState, metricMode }: KPICardsProps) => {
  if (energyData.size === 0) return null;

  let totalDemand = 0, totalRenewable = 0, totalSaved = 0, totalGrid = 0, peakDemand = 0;

  if (selectedState && energyData.has(selectedState)) {
    const d = energyData.get(selectedState)!;
    totalDemand = d.totalDemand;
    totalRenewable = d.totalRenewable;
    totalSaved = d.energySaved;
    totalGrid = d.gridEnergy;
    peakDemand = d.peakDemand;
  } else {
    energyData.forEach((d) => {
      totalDemand += d.totalDemand;
      totalRenewable += d.totalRenewable;
      totalSaved += d.energySaved;
      totalGrid += d.gridEnergy;
      peakDemand += d.peakDemand;
    });
  }

  const renewablePercent = Math.round((totalRenewable / totalDemand) * 100);

  const fmt = (mw: number) => {
    if (metricMode === 'carbon') return `${(mw * 0.82 * 24 / 1000).toFixed(0)} t CO₂`;
    if (metricMode === 'cost') return `₹${(mw * 4.5 * 24 / 100000).toFixed(1)} Cr`;
    if (mw > 99999) return `${(mw / 1000).toFixed(1)}K MW`;
    return `${mw.toLocaleString()} MW`;
  };

  const cards = [
    { label: "Total Demand", value: fmt(totalDemand), icon: Zap, cls: "text-primary" },
    { label: "Renewable", value: fmt(totalRenewable), icon: Sun, cls: "text-renewable" },
    { label: "Grid Energy", value: fmt(totalGrid), icon: TrendingUp, cls: "text-grid-energy" },
    { label: "Energy Saved", value: fmt(totalSaved), icon: Leaf, cls: "text-accent" },
    { label: "Peak Demand", value: fmt(peakDemand), icon: Activity, cls: "text-destructive" },
    { label: "Renewable %", value: `${renewablePercent}%`, icon: TreePine, cls: "text-renewable" },
  ];

  return (
    <div className="grid grid-cols-3 md:grid-cols-6 gap-2 px-4 py-3 border-b border-border bg-card/40">
      {cards.map((c, i) => (
        <div
          key={c.label}
          className="bg-secondary/30 rounded-lg p-2.5 animate-fade-in"
          style={{ animationDelay: `${i * 0.05}s` }}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] uppercase tracking-wider text-muted-foreground">{c.label}</span>
            <c.icon className={`w-3.5 h-3.5 ${c.cls}`} />
          </div>
          <div className="text-sm md:text-base font-bold font-mono text-foreground leading-tight">{c.value}</div>
        </div>
      ))}
    </div>
  );
};

export default KPICards;
