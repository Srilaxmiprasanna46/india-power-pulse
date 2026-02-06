import { useState, useEffect } from "react";
import { X, AlertTriangle } from "lucide-react";
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

const StatePanel = ({ stateName, stateInfo, energyData, onClose }: StatePanelProps) => {
  const [demandCurve] = useState(() => generateDemandCurve(energyData));
  const [wastageData] = useState(() => generateWastageData(energyData));
  const [carbonData] = useState(() => generateCarbonData(energyData));
  const [costData] = useState(() => generateCostData(energyData));
  const [realTimeData, setRealTimeData] = useState<Array<{ time: string; demand: number; threshold: number }>>([]);

  const insight = getStateInsight(energyData);

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
    { name: 'Solar', value: energyData.solar, color: CHART_COLORS.solar },
    { name: 'Wind', value: energyData.wind, color: CHART_COLORS.wind },
    { name: 'Hydro', value: energyData.hydro, color: CHART_COLORS.hydro },
    { name: 'Biomass', value: energyData.biomass, color: CHART_COLORS.biomass },
    { name: 'Grid', value: energyData.gridEnergy, color: CHART_COLORS.grid },
  ];

  const peakPt = demandCurve.reduce((m, p) => p.demand > m.demand ? p : m, demandCurve[0]);
  const minPt = demandCurve.reduce((m, p) => p.demand < m.demand ? p : m, demandCurve[0]);

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
        </TabsList>

        <div className="flex-1 overflow-auto">
          <TabsContent value="energy" className="p-4 space-y-4 mt-0">
            <h3 className="text-sm font-semibold">Energy Production by Source</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={energyBreakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 15%, 18%)" />
                <XAxis dataKey="name" tick={axisTick} />
                <YAxis tick={axisTick} />
                <Tooltip {...chartTooltipStyle} />
                <Bar dataKey="value" name="MW">{energyBreakdown.map((e, i) => <Cell key={i} fill={e.color} />)}</Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2">
              {[
                { l: "Total Consumed", v: `${energyData.totalDemand.toLocaleString()} MW` },
                { l: "Renewable Used", v: `${energyData.totalRenewable.toLocaleString()} MW`, c: "text-renewable" },
                { l: "Grid Used", v: `${energyData.gridEnergy.toLocaleString()} MW`, c: "text-grid-energy" },
                { l: "Renewable %", v: `${energyData.renewablePercent}%`, c: "text-primary" },
              ].map(d => (
                <div key={d.l} className="bg-secondary/30 rounded-lg p-2.5">
                  <p className="text-[9px] text-muted-foreground uppercase">{d.l}</p>
                  <p className={`text-sm font-bold font-mono ${d.c || ''}`}>{d.v}</p>
                </div>
              ))}
            </div>
            <div className="bg-secondary/20 rounded-lg p-3 text-xs">
              {energyData.totalRenewable > energyData.totalDemand
                ? `⚡ Surplus of ${(energyData.totalRenewable - energyData.totalDemand).toLocaleString()} MW for export`
                : `📥 Deficit of ${(energyData.totalDemand - energyData.totalRenewable).toLocaleString()} MW imported from grid`}
            </div>
          </TabsContent>

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
                <p className="text-sm font-bold font-mono text-destructive">{peakPt.demand.toLocaleString()} MW</p>
                <p className="text-[10px] text-muted-foreground">{peakPt.label} ({peakPt.segment})</p>
              </div>
              <div className="bg-accent/10 rounded-lg p-2.5 border border-accent/20">
                <p className="text-[9px] text-muted-foreground uppercase">Min Demand</p>
                <p className="text-sm font-bold font-mono text-accent">{minPt.demand.toLocaleString()} MW</p>
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
                    <span>{seg === 'Evening' ? '🔴 ' : ''}{seg}</span>
                    <span className="font-mono">Avg: {avg.toLocaleString()} MW</span>
                  </div>
                );
              })}
            </div>
          </TabsContent>

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
                <ReferenceLine y={realTimeData[0]?.threshold} stroke={CHART_COLORS.grid} strokeDasharray="5 5" />
                <Line type="monotone" dataKey="demand" stroke={CHART_COLORS.demand} strokeWidth={2} dot={false} name="Demand (MW)" />
              </LineChart>
            </ResponsiveContainer>
            {realTimeData.length > 0 && realTimeData[realTimeData.length - 1].demand > realTimeData[0]?.threshold && (
              <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/30 rounded-lg p-3">
                <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0" />
                <span className="text-xs text-destructive">⚠️ Demand spike detected! Exceeds threshold.</span>
              </div>
            )}
            <div className="bg-secondary/20 rounded-lg p-3 text-xs text-muted-foreground">
              Current: <span className="font-mono text-foreground">{Math.round(realTimeData[realTimeData.length - 1]?.demand || 0).toLocaleString()} MW</span>
              {' | '}Threshold: <span className="font-mono text-grid-energy">{Math.round(realTimeData[0]?.threshold || 0).toLocaleString()} MW</span>
            </div>
          </TabsContent>

          <TabsContent value="wastage" className="p-4 space-y-3 mt-0">
            <h3 className="text-sm font-semibold">Energy Wastage Analysis</h3>
            {wastageData.map((item, i) => (
              <div key={item.sector} className="bg-secondary/20 rounded-lg p-3 animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium">{item.icon} {item.sector}</span>
                  <span className="text-[10px] font-mono text-wastage">{item.percentWaste}% waste</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[10px]">
                  <div><p className="text-muted-foreground">Wasted</p><p className="font-mono font-semibold">{item.wastedMW} MW</p></div>
                  <div><p className="text-muted-foreground">₹ Loss</p><p className="font-mono font-semibold text-grid-energy">₹{item.financialLoss}L/mo</p></div>
                  <div><p className="text-muted-foreground">CO₂</p><p className="font-mono font-semibold text-carbon">{item.avoidableCO2}t/mo</p></div>
                </div>
                <div className="mt-2 bg-secondary/30 rounded-full h-1.5">
                  <div className="bg-wastage h-full rounded-full" style={{ width: `${item.percentWaste}%` }} />
                </div>
              </div>
            ))}
            <div className="bg-secondary/20 rounded-lg p-3 text-[10px] text-muted-foreground">
              Total wastage: <span className="font-mono text-wastage font-semibold">{wastageData.reduce((s, w) => s + w.wastedMW, 0)} MW</span>
              {' | '}Loss: <span className="font-mono text-grid-energy font-semibold">₹{wastageData.reduce((s, w) => s + w.financialLoss, 0)}L/month</span>
            </div>
          </TabsContent>

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
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-destructive/10 rounded-lg p-2.5 border border-destructive/20">
                <p className="text-[9px] text-muted-foreground uppercase">Total Emissions</p>
                <p className="text-sm font-bold font-mono">{carbonData.total.toLocaleString()} t CO₂/day</p>
              </div>
              <div className="bg-accent/10 rounded-lg p-2.5 border border-accent/20">
                <p className="text-[9px] text-muted-foreground uppercase">Avoided</p>
                <p className="text-sm font-bold font-mono text-accent">{carbonData.avoided.toLocaleString()} t CO₂/day</p>
              </div>
            </div>
          </TabsContent>

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
                <p className="text-[9px] text-muted-foreground uppercase">Savings</p>
                <p className="text-sm font-bold font-mono text-accent">₹{costData.savings} Cr/day</p>
              </div>
            </div>
            <div className="space-y-1">
              {costData.bySource.map(s => (
                <div key={s.source} className="flex items-center justify-between text-[10px] bg-secondary/20 rounded p-2">
                  <span>{s.source}</span>
                  <span className="font-mono">₹{s.unitCost}/kWh → ₹{s.cost} Cr/day</span>
                </div>
              ))}
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default StatePanel;
