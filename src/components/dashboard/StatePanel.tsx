import { useState, useEffect, useMemo } from "react";
import { X, AlertTriangle, Clock, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  Area, AreaChart, ReferenceLine,
} from "recharts";
import {
  GeneratedEnergy, StateInfo, CHART_COLORS,
  generateDemandCurve, generateWastageData, generateCarbonData,
  generateCostData, getStateInsight,
} from "@/data/stateData";
import StateForecast from "./StateForecast";
import { formatMetric, convertToMetric, getMetricUnit } from "@/utils/metricFormat";

interface StatePanelProps {
  stateName: string;
  stateInfo: StateInfo;
  energyData: GeneratedEnergy;
  metricMode: string;
  onClose: () => void;
}

const chartTooltipStyle = {
  contentStyle: { background: 'hsl(222, 20%, 10%)', border: '1px solid hsl(222, 15%, 18%)', borderRadius: 8, fontSize: 11 },
};

const axisTick = { fill: 'hsl(215, 15%, 55%)', fontSize: 10 };

const StatePanel = ({ stateName, stateInfo, energyData, metricMode, onClose }: StatePanelProps) => {
  const [demandCurve] = useState(() => generateDemandCurve(energyData));
  const [wastageData] = useState(() => generateWastageData(energyData));
  const [carbonData] = useState(() => generateCarbonData(energyData));
  const [costData] = useState(() => generateCostData(energyData));
  const [realTimeData, setRealTimeData] = useState<Array<{ time: string; demand: number; threshold: number }>>([]);

  const insight = getStateInsight(energyData);

  // Metric-aware formatting helper
  const fmt = (mw: number) => formatMetric(mw, metricMode);
  const unit = getMetricUnit(metricMode);

  useEffect(() => {
    const threshold = energyData.peakDemand * 0.85;
    const initial = Array.from({ length: 30 }, (_, i) => ({
      time: `${i}s`,
      demand: Math.round(energyData.totalDemand * (0.85 + Math.random() * 0.3)),
      threshold,
    }));
    setRealTimeData(initial);

    const interval = setInterval(() => {
      setRealTimeData(prev => {
        const np = {
          time: `${prev.length}s`,
          demand: Math.round(energyData.totalDemand * (0.85 + Math.random() * 0.3)),
          threshold,
        };
        return [...prev.slice(-29), np];
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [energyData]);

  const energyBreakdown = [
    { name: 'Solar', value: convertToMetric(energyData.solar, metricMode), color: CHART_COLORS.solar },
    { name: 'Wind', value: convertToMetric(energyData.wind, metricMode), color: CHART_COLORS.wind },
    { name: 'Hydro', value: convertToMetric(energyData.hydro, metricMode), color: CHART_COLORS.hydro },
    { name: 'Biomass', value: convertToMetric(energyData.biomass, metricMode), color: CHART_COLORS.biomass },
    { name: 'Grid', value: convertToMetric(energyData.gridEnergy, metricMode), color: CHART_COLORS.grid },
  ];

  const peakPt = demandCurve.reduce((m, p) => p.demand > m.demand ? p : m, demandCurve[0]);
  const minPt = demandCurve.reduce((m, p) => p.demand < m.demand ? p : m, demandCurve[0]);

  const locallyConsumedPct = useMemo(() => {
    const total = energyData.totalRenewable + energyData.gridEnergy;
    return total > 0 ? Math.round((energyData.totalRenewable / total) * 100) : 0;
  }, [energyData]);

  const surplus = energyData.totalRenewable - energyData.totalDemand;

  // Wastage enhancements — idle-time and daylight insights
  const wastageInsights = useMemo(() => {
    const idleHours = demandCurve.filter(p => p.segment === 'Night');
    const avgIdleDemand = Math.round(idleHours.reduce((s, p) => s + p.demand, 0) / idleHours.length);
    const dayHours = demandCurve.filter(p => p.segment === 'Morning' || p.segment === 'Afternoon');
    const avgDayDemand = Math.round(dayHours.reduce((s, p) => s + p.demand, 0) / dayHours.length);
    const totalWaste = wastageData.reduce((s, w) => s + w.wastedMW, 0);

    return {
      idleConsumption: avgIdleDemand,
      idleWaste: Math.round(avgIdleDemand * 0.15), // ~15% of night demand is unnecessary
      daylightWaste: Math.round(avgDayDemand * 0.06), // ~6% unnecessary during daylight (lights on etc.)
      totalWaste,
      totalFinancialLoss: wastageData.reduce((s, w) => s + w.financialLoss, 0),
      totalCO2: wastageData.reduce((s, w) => s + w.avoidableCO2, 0),
    };
  }, [demandCurve, wastageData]);

  return (
    <div className="h-full flex flex-col bg-card/50 border-l border-border animate-slide-in-right overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{stateInfo.icon}</span>
          <div>
            <h2 className="font-bold text-foreground text-sm">{stateName}</h2>
            <p className="text-[10px] text-muted-foreground">{stateInfo.region} • Pop. {stateInfo.population}M</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}><X className="w-4 h-4" /></Button>
      </div>

      <div className="px-4 py-2 bg-primary/5 border-b border-border flex-shrink-0">
        <p className="text-[11px] text-muted-foreground italic">💡 {insight}</p>
      </div>

      <Tabs defaultValue="energy" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="w-full justify-start px-4 pt-2 bg-transparent flex-shrink-0 h-auto flex-wrap">
          <TabsTrigger value="energy" className="text-[11px] px-2 py-1">Energy</TabsTrigger>
          <TabsTrigger value="demand" className="text-[11px] px-2 py-1">Demand</TabsTrigger>
          <TabsTrigger value="realtime" className="text-[11px] px-2 py-1">Real-Time</TabsTrigger>
          <TabsTrigger value="wastage" className="text-[11px] px-2 py-1">Wastage</TabsTrigger>
          <TabsTrigger value="carbon" className="text-[11px] px-2 py-1">Carbon</TabsTrigger>
          <TabsTrigger value="cost" className="text-[11px] px-2 py-1">Cost</TabsTrigger>
          <TabsTrigger value="forecast" className="text-[11px] px-2 py-1">Forecast</TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-auto">
          {/* ═══ ENERGY TAB ═══ */}
          <TabsContent value="energy" className="p-4 space-y-4 mt-0">
            <h3 className="text-sm font-semibold">Energy Production by Source</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={energyBreakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 15%, 18%)" />
                <XAxis dataKey="name" tick={axisTick} />
                <YAxis tick={axisTick} />
                <Tooltip {...chartTooltipStyle} />
                <Bar dataKey="value" name={unit}>{energyBreakdown.map((e, i) => <Cell key={i} fill={e.color} />)}</Bar>
              </BarChart>
            </ResponsiveContainer>

            {/* Production by source detail */}
            <div className="space-y-1">
              <h4 className="text-[10px] font-semibold text-muted-foreground uppercase">Source-Wise Production</h4>
              {[
                { label: "☀️ Solar", val: energyData.solar, cls: "text-solar" },
                { label: "💨 Wind", val: energyData.wind, cls: "text-wind" },
                { label: "💧 Hydro", val: energyData.hydro, cls: "text-hydro" },
                { label: "🌿 Biomass", val: energyData.biomass, cls: "text-biomass" },
                { label: "Total Produced", val: energyData.totalRenewable, cls: "text-renewable font-bold" },
              ].map(d => (
                <div key={d.label} className="flex items-center justify-between bg-secondary/20 rounded p-2 text-xs">
                  <span>{d.label}</span>
                  <span className={`font-mono ${d.cls}`}>{fmt(d.val)}</span>
                </div>
              ))}
            </div>

            {/* Consumption & Balance */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { l: "Total Consumed", v: fmt(energyData.totalDemand) },
                { l: "Renewable Used", v: fmt(energyData.totalRenewable), c: "text-renewable" },
                { l: "Grid Used", v: fmt(energyData.gridEnergy), c: "text-grid-energy" },
                { l: "Renewable %", v: `${energyData.renewablePercent}%`, c: "text-primary" },
                { l: "Locally Generated %", v: `${locallyConsumedPct}%`, c: "text-accent" },
                { l: "Energy Saved", v: fmt(energyData.energySaved), c: "text-accent" },
              ].map(d => (
                <div key={d.l} className="bg-secondary/30 rounded-lg p-2.5">
                  <p className="text-[9px] text-muted-foreground uppercase">{d.l}</p>
                  <p className={`text-sm font-bold font-mono ${d.c || ''}`}>{d.v}</p>
                </div>
              ))}
            </div>

            {/* Surplus/Deficit */}
            <div className="bg-secondary/20 rounded-lg p-3 text-xs">
              {surplus >= 0
                ? `⚡ Surplus of ${fmt(surplus)} available for export`
                : `📥 Deficit of ${fmt(Math.abs(surplus))} imported from grid`}
            </div>
          </TabsContent>

          {/* ═══ DEMAND TAB ═══ */}
          <TabsContent value="demand" className="p-4 space-y-4 mt-0">
            <h3 className="text-sm font-semibold">24-Hour Demand Curve</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={demandCurve}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 15%, 18%)" />
                <XAxis dataKey="label" tick={{ ...axisTick, fontSize: 8 }} interval={2} />
                <YAxis tick={axisTick} />
                <Tooltip {...chartTooltipStyle} />
                <Area type="monotone" dataKey="renewable" stackId="1" fill={CHART_COLORS.renewable} stroke={CHART_COLORS.renewable} fillOpacity={0.6} name="Renewable" />
                <Area type="monotone" dataKey="grid" stackId="1" fill={CHART_COLORS.grid} stroke={CHART_COLORS.grid} fillOpacity={0.4} name="Grid" />
                <Line type="monotone" dataKey="demand" stroke={CHART_COLORS.demand} strokeWidth={2} dot={false} name="Total Demand" />
              </AreaChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-destructive/10 rounded-lg p-2.5 border border-destructive/20">
                <p className="text-[9px] text-muted-foreground uppercase">Peak Demand</p>
                <p className="text-sm font-bold font-mono text-destructive">{fmt(peakPt.demand)}</p>
                <p className="text-[10px] text-muted-foreground">{peakPt.label} ({peakPt.segment})</p>
              </div>
              <div className="bg-accent/10 rounded-lg p-2.5 border border-accent/20">
                <p className="text-[9px] text-muted-foreground uppercase">Min Demand</p>
                <p className="text-sm font-bold font-mono text-accent">{fmt(minPt.demand)}</p>
                <p className="text-[10px] text-muted-foreground">{minPt.label} ({minPt.segment})</p>
              </div>
            </div>
            <div className="space-y-1.5">
              <h4 className="text-[10px] font-semibold text-muted-foreground uppercase">By Segment</h4>
              {['Morning', 'Afternoon', 'Evening', 'Night'].map(seg => {
                const pts = demandCurve.filter(p => p.segment === seg);
                const avg = Math.round(pts.reduce((s, p) => s + p.demand, 0) / pts.length);
                return (
                  <div key={seg} className="flex items-center justify-between bg-secondary/20 rounded p-2 text-xs">
                    <span>{seg === 'Evening' ? '🔴 ' : seg === 'Night' ? '🌙 ' : seg === 'Morning' ? '🌅 ' : '☀️ '}{seg}</span>
                    <span className="font-mono">Avg: {fmt(avg)}</span>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          {/* ═══ REAL-TIME TAB ═══ */}
          <TabsContent value="realtime" className="p-4 space-y-4 mt-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-semibold">Real-Time Demand</h3>
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse-glow" />
              <span className="text-[10px] text-accent font-semibold">LIVE</span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={realTimeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 15%, 18%)" />
                <XAxis dataKey="time" tick={{ ...axisTick, fontSize: 8 }} />
                <YAxis tick={axisTick} domain={['auto', 'auto']} />
                <Tooltip {...chartTooltipStyle} />
                <ReferenceLine y={realTimeData[0]?.threshold} stroke={CHART_COLORS.grid} strokeDasharray="5 5" label={{ value: 'Threshold', fill: 'hsl(215, 15%, 55%)', fontSize: 9 }} />
                <Line type="monotone" dataKey="demand" stroke={CHART_COLORS.demand} strokeWidth={2} dot={false} name="Demand (MW)" />
              </LineChart>
            </ResponsiveContainer>
            {realTimeData.length > 0 && realTimeData[realTimeData.length - 1].demand > realTimeData[0]?.threshold && (
              <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/30 rounded-lg p-3">
                <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0" />
                <span className="text-xs text-destructive">⚠️ Demand spike detected! Exceeds threshold — abnormal consumption pattern.</span>
              </div>
            )}
            <div className="bg-secondary/20 rounded-lg p-3 text-xs text-muted-foreground">
              Current: <span className="font-mono text-foreground">{fmt(realTimeData[realTimeData.length - 1]?.demand || 0)}</span>
              {' | '}Threshold: <span className="font-mono text-grid-energy">{fmt(realTimeData[0]?.threshold || 0)}</span>
            </div>
            <div className="text-[10px] text-muted-foreground bg-secondary/10 rounded p-2 italic">
              💡 Graph refreshes every 2s using simulated streaming derived from historical demand patterns. Sudden spikes and threshold crossings are highlighted automatically.
            </div>
          </TabsContent>

          {/* ═══ WASTAGE TAB ═══ */}
          <TabsContent value="wastage" className="p-4 space-y-3 mt-0">
            <h3 className="text-sm font-semibold">Energy Wastage Analysis</h3>
            {wastageData.map((item, i) => (
              <div key={item.sector} className="bg-secondary/20 rounded-lg p-3 animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium">{item.icon} {item.sector}</span>
                  <span className="text-[10px] font-mono text-wastage">{item.percentWaste}% waste</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[10px]">
                  <div><p className="text-muted-foreground">Wasted</p><p className="font-mono font-semibold">{fmt(item.wastedMW)}</p></div>
                  <div><p className="text-muted-foreground">₹ Loss</p><p className="font-mono font-semibold text-grid-energy">₹{item.financialLoss}L/mo</p></div>
                  <div><p className="text-muted-foreground">CO₂</p><p className="font-mono font-semibold text-carbon">{item.avoidableCO2}t/mo</p></div>
                </div>
                <div className="mt-2 bg-secondary/30 rounded-full h-1.5">
                  <div className="bg-wastage h-full rounded-full" style={{ width: `${item.percentWaste}%` }} />
                </div>
              </div>
            ))}

            {/* Idle-time & Daylight waste insights */}
            <div className="bg-card border border-border rounded-lg p-3 space-y-2">
              <h4 className="text-[10px] font-semibold text-muted-foreground uppercase flex items-center gap-1.5">
                <Moon className="w-3 h-3" /> Idle-Time Wastage (Night Hours)
              </h4>
              <div className="flex items-center justify-between text-xs bg-secondary/20 rounded p-2">
                <span>Avg night-time consumption</span>
                <span className="font-mono">{fmt(wastageInsights.idleConsumption)}</span>
              </div>
              <div className="flex items-center justify-between text-xs bg-wastage/10 rounded p-2">
                <span className="text-wastage">Unnecessary night consumption</span>
                <span className="font-mono text-wastage">{fmt(wastageInsights.idleWaste)}</span>
              </div>
              <p className="text-[10px] text-muted-foreground italic">
                💡 ~15% of night-time demand could be eliminated through automated shutdowns and smart lighting controls.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-3 space-y-2">
              <h4 className="text-[10px] font-semibold text-muted-foreground uppercase flex items-center gap-1.5">
                <Sun className="w-3 h-3" /> Daylight Wastage
              </h4>
              <div className="flex items-center justify-between text-xs bg-wastage/10 rounded p-2">
                <span className="text-wastage">Unnecessary usage during daylight</span>
                <span className="font-mono text-wastage">{fmt(wastageInsights.daylightWaste)}</span>
              </div>
              <p className="text-[10px] text-muted-foreground italic">
                💡 Street lights and corridor lighting running during daylight hours contribute to ~6% avoidable consumption.
              </p>
            </div>

            <div className="bg-secondary/20 rounded-lg p-3 text-[10px] text-muted-foreground">
              Total wastage: <span className="font-mono text-wastage font-semibold">{fmt(wastageInsights.totalWaste)}</span>
              {' | '}Loss: <span className="font-mono text-grid-energy font-semibold">₹{wastageInsights.totalFinancialLoss}L/month</span>
              {' | '}Avoidable CO₂: <span className="font-mono text-carbon font-semibold">{wastageInsights.totalCO2}t/mo</span>
            </div>
          </TabsContent>

          {/* ═══ CARBON TAB ═══ */}
          <TabsContent value="carbon" className="p-4 space-y-4 mt-0">
            <h3 className="text-sm font-semibold">Carbon Emissions Analysis</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={carbonData.bySource} dataKey="emissions" nameKey="source" cx="50%" cy="50%" innerRadius={45} outerRadius={75}>
                  {carbonData.bySource.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip {...chartTooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
              </PieChart>
            </ResponsiveContainer>
            {/* Source breakdown */}
            <div className="space-y-1">
              <h4 className="text-[10px] font-semibold text-muted-foreground uppercase">Emissions by Source</h4>
              {carbonData.bySource.map(s => (
                <div key={s.source} className="flex items-center justify-between text-[10px] bg-secondary/20 rounded p-2">
                  <span>{s.source}</span>
                  <span className="font-mono">{s.emissions.toLocaleString()} t CO₂/day</span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-destructive/10 rounded-lg p-2.5 border border-destructive/20">
                <p className="text-[9px] text-muted-foreground uppercase">Total Emissions</p>
                <p className="text-sm font-bold font-mono">{carbonData.total.toLocaleString()} t CO₂/day</p>
              </div>
              <div className="bg-accent/10 rounded-lg p-2.5 border border-accent/20">
                <p className="text-[9px] text-muted-foreground uppercase">CO₂ Avoided</p>
                <p className="text-sm font-bold font-mono text-accent">{carbonData.avoided.toLocaleString()} t CO₂/day</p>
              </div>
            </div>
            <div className="text-[10px] text-muted-foreground bg-accent/5 rounded-lg p-2 italic">
              💡 Renewable energy usage avoids <span className="text-accent font-semibold">{carbonData.avoided.toLocaleString()} tonnes</span> of CO₂ emissions daily compared to full grid dependency.
            </div>
          </TabsContent>

          {/* ═══ COST TAB ═══ */}
          <TabsContent value="cost" className="p-4 space-y-4 mt-0">
            <h3 className="text-sm font-semibold">Cost Analysis</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={costData.bySource}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 15%, 18%)" />
                <XAxis dataKey="source" tick={axisTick} />
                <YAxis tick={axisTick} />
                <Tooltip {...chartTooltipStyle} />
                <Bar dataKey="cost" name="₹ Crores/day">{costData.bySource.map((e, i) => <Cell key={i} fill={e.color} />)}</Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-secondary/30 rounded-lg p-2.5">
                <p className="text-[9px] text-muted-foreground uppercase">Total Cost</p>
                <p className="text-sm font-bold font-mono">₹{costData.total} Cr/day</p>
              </div>
              <div className="bg-accent/10 rounded-lg p-2.5 border border-accent/20">
                <p className="text-[9px] text-muted-foreground uppercase">Savings (Renewable)</p>
                <p className="text-sm font-bold font-mono text-accent">₹{costData.savings} Cr/day</p>
              </div>
            </div>
            {/* Wastage financial loss */}
            <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-2.5">
              <p className="text-[9px] text-muted-foreground uppercase">Loss from Energy Wastage</p>
              <p className="text-sm font-bold font-mono text-destructive">₹{wastageInsights.totalFinancialLoss} Lakhs/month</p>
            </div>
            <div className="space-y-1">
              <h4 className="text-[10px] font-semibold text-muted-foreground uppercase">Cost by Source</h4>
              {costData.bySource.map(s => (
                <div key={s.source} className="flex items-center justify-between text-[10px] bg-secondary/20 rounded p-2">
                  <span>{s.source}</span>
                  <span className="font-mono">₹{s.unitCost}/kWh → ₹{s.cost} Cr/day</span>
                </div>
              ))}
            </div>
            <div className="text-[10px] text-muted-foreground bg-accent/5 rounded-lg p-2 italic">
              💡 Cost savings from renewable adoption (₹{costData.savings} Cr/day) and wastage reduction (₹{wastageInsights.totalFinancialLoss} L/mo) together drive down operational expenditure.
            </div>
          </TabsContent>

          {/* ═══ FORECAST TAB ═══ */}
          <TabsContent value="forecast" className="mt-0">
            <StateForecast energyData={energyData} metricMode={metricMode} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default StatePanel;
