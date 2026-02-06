import { useMemo } from "react";
import {
  BarChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, Area, ComposedChart,
} from "recharts";
import { GeneratedEnergy, CHART_COLORS, generateForecast } from "@/data/stateData";
import { TrendingUp, Info } from "lucide-react";
import { convertToMetric, getMetricUnit } from "@/utils/metricFormat";
import India2047 from "./India2047";

interface AnalyzeViewProps {
  energyData: Map<string, GeneratedEnergy>;
  selectedState: string | null;
  metricMode: string;
}

const tt = { contentStyle: { background: 'hsl(222, 20%, 10%)', border: '1px solid hsl(222, 15%, 18%)', borderRadius: 8, fontSize: 11 } };
const tk = { fill: 'hsl(215, 15%, 55%)', fontSize: 10 };

const AnalyzeView = ({ energyData, selectedState, metricMode }: AnalyzeViewProps) => {
  const unit = getMetricUnit(metricMode);

  const stateComparison = useMemo(() => {
    return Array.from(energyData.entries())
      .map(([name, d]) => ({
        name: name.length > 12 ? name.slice(0, 11) + '..' : name,
        fullName: name,
        renewable: convertToMetric(d.totalRenewable, metricMode),
        grid: convertToMetric(d.gridEnergy, metricMode),
        total: convertToMetric(d.totalDemand, metricMode),
        renewablePercent: d.renewablePercent,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 15);
  }, [energyData, metricMode]);

  const forecastData = useMemo(() => {
    let raw;
    if (selectedState && energyData.has(selectedState)) {
      raw = generateForecast(energyData.get(selectedState)!);
    } else {
      const totalDemand = Array.from(energyData.values()).reduce((s, d) => s + d.totalDemand, 0);
      const totalRenewable = Array.from(energyData.values()).reduce((s, d) => s + d.totalRenewable, 0);
      raw = generateForecast({
        stateName: "India", solar: 0, wind: 0, hydro: 0, biomass: 0,
        totalRenewable, gridEnergy: totalDemand - totalRenewable,
        totalDemand, energySaved: 0,
        renewablePercent: Math.round(totalRenewable / totalDemand * 100),
        peakDemand: totalDemand * 1.2, minDemand: totalDemand * 0.5,
        dominantSource: "Mixed",
      });
    }
    return raw.map(p => ({
      ...p,
      predicted: convertToMetric(p.predicted, metricMode),
      upper: convertToMetric(p.upper, metricMode),
      lower: convertToMetric(p.lower, metricMode),
      historical: p.historical ? convertToMetric(p.historical, metricMode) : undefined,
    }));
  }, [energyData, selectedState, metricMode]);

  const renewableRanking = useMemo(() => {
    return Array.from(energyData.entries())
      .map(([name, d]) => ({ name, percent: d.renewablePercent }))
      .sort((a, b) => b.percent - a.percent)
      .slice(0, 10);
  }, [energyData]);

  const insights = useMemo(() => {
    const totalDemand = Array.from(energyData.values()).reduce((s, d) => s + d.totalDemand, 0);
    const totalRenewable = Array.from(energyData.values()).reduce((s, d) => s + d.totalRenewable, 0);
    const avgPct = Math.round(totalRenewable / totalDemand * 100);
    const sorted = Array.from(energyData.entries()).sort((a, b) => b[1].renewablePercent - a[1].renewablePercent);
    const top = sorted[0];
    const bottom = sorted[sorted.length - 1];

    return [
      `National renewable energy penetration stands at ${avgPct}% of total demand.`,
      `${top[0]} leads with ${top[1].renewablePercent}% renewable energy adoption.`,
      `${bottom[0]} has the lowest renewable share at ${bottom[1].renewablePercent}%, indicating high grid dependency.`,
      `States with higher renewable penetration consistently show lower grid dependency and carbon footprint.`,
      `Next-month demand is expected to ${forecastData[7]?.predicted > (forecastData[5]?.historical || 0) ? 'rise' : 'stabilize'} based on seasonal trends.`,
    ];
  }, [energyData, forecastData]);

  return (
    <div className="p-6 space-y-6 overflow-auto h-full animate-fade-in">
      <div className="flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-bold">
          {selectedState ? `${selectedState} — Deep Analysis` : 'National Energy Analysis'}
        </h2>
      </div>

      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-sm font-semibold mb-3">Statewise Consumption (Top 15) — Renewable vs Grid</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={stateComparison}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 15%, 18%)" />
            <XAxis dataKey="name" tick={{ ...tk, fontSize: 8 }} angle={-45} textAnchor="end" height={60} />
            <YAxis tick={tk} />
            <Tooltip {...tt} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="renewable" stackId="a" fill={CHART_COLORS.renewable} name={`Renewable (${unit})`} />
            <Bar dataKey="grid" stackId="a" fill={CHART_COLORS.grid} name={`Grid (${unit})`} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-sm font-semibold mb-3">Top 10 — Renewable Adoption</h3>
        <div className="space-y-2">
          {renewableRanking.map((s, i) => (
            <div key={s.name} className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-5">#{i + 1}</span>
              <span className="text-xs w-36 truncate">{s.name}</span>
              <div className="flex-1 bg-secondary/30 rounded-full h-2">
                <div className="bg-renewable h-full rounded-full transition-all" style={{ width: `${s.percent}%` }} />
              </div>
              <span className="text-xs font-mono text-renewable w-10 text-right">{s.percent}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-sm font-semibold mb-1">
          Energy Forecast — {selectedState || 'National'}
        </h3>
        <p className="text-[10px] text-muted-foreground mb-3">Based on historical demand patterns, seasonal variations, and trends</p>
        <ResponsiveContainer width="100%" height={250}>
          <ComposedChart data={forecastData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 15%, 18%)" />
            <XAxis dataKey="month" tick={tk} />
            <YAxis tick={tk} />
            <Tooltip {...tt} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Area type="monotone" dataKey="upper" fill="hsl(185, 80%, 45%)" stroke="none" fillOpacity={0.1} name="Upper Bound" />
            <Area type="monotone" dataKey="lower" fill="hsl(185, 80%, 45%)" stroke="none" fillOpacity={0.1} name="Lower Bound" />
            <Line type="monotone" dataKey="historical" stroke={CHART_COLORS.demand} strokeWidth={2} dot={{ fill: CHART_COLORS.demand, r: 3 }} name={`Historical (${unit})`} connectNulls={false} />
            <Line type="monotone" dataKey="predicted" stroke={CHART_COLORS.renewable} strokeWidth={2} strokeDasharray="5 5" dot={{ fill: CHART_COLORS.renewable, r: 3 }} name={`Predicted (${unit})`} connectNulls={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* India @ 2047 Sustainability Progress */}
      <India2047 energyData={energyData} />

      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Info className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold">Observations & Insights</h3>
        </div>
        <div className="space-y-2">
          {insights.map((ins, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
              <span className="text-primary mt-0.5">▸</span>
              <span>{ins}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyzeView;
