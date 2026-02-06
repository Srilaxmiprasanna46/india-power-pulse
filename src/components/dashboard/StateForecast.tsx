import { useMemo } from "react";
import {
  ComposedChart, Line, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceLine,
} from "recharts";
import { TrendingUp, Calendar, Clock } from "lucide-react";
import { GeneratedEnergy, CHART_COLORS, generateForecast } from "@/data/stateData";
import { generateNextDayForecast, NextDayForecastPoint } from "@/data/forecastData";
import { formatMetric, convertToMetric, getMetricUnit } from "@/utils/metricFormat";

interface StateForecastProps {
  energyData: GeneratedEnergy;
  metricMode: string;
}

const tt = {
  contentStyle: {
    background: 'hsl(222, 20%, 10%)',
    border: '1px solid hsl(222, 15%, 18%)',
    borderRadius: 8,
    fontSize: 11,
  },
};
const tk = { fill: 'hsl(215, 15%, 55%)', fontSize: 10 };

const StateForecast = ({ energyData, metricMode }: StateForecastProps) => {
  const monthlyForecast = useMemo(() => {
    const raw = generateForecast(energyData);
    return raw.map(p => ({
      ...p,
      predicted: convertToMetric(p.predicted, metricMode),
      upper: convertToMetric(p.upper, metricMode),
      lower: convertToMetric(p.lower, metricMode),
      historical: p.historical ? convertToMetric(p.historical, metricMode) : undefined,
    }));
  }, [energyData, metricMode]);

  const dailyForecast = useMemo(() => {
    const raw = generateNextDayForecast(energyData);
    return raw.map(p => ({
      ...p,
      predicted: convertToMetric(p.predicted, metricMode),
      upper: convertToMetric(p.upper, metricMode),
      lower: convertToMetric(p.lower, metricMode),
    }));
  }, [energyData, metricMode]);

  const unit = getMetricUnit(metricMode);

  const dailyPeak = dailyForecast.reduce((m, p) => p.predicted > m.predicted ? p : m, dailyForecast[0]);
  const dailyMin = dailyForecast.reduce((m, p) => p.predicted < m.predicted ? p : m, dailyForecast[0]);

  const insights = useMemo(() => {
    const lines: string[] = [];
    if (dailyPeak && dailyMin) {
      lines.push(`Next-day peak predicted at ${dailyPeak.hour} with ${dailyPeak.predicted.toLocaleString()} ${unit}.`);
      lines.push(`Minimum demand expected at ${dailyMin.hour} (${dailyMin.predicted.toLocaleString()} ${unit}).`);
    }
    const futureMonths = monthlyForecast.filter(p => p.predicted > 0);
    if (futureMonths.length > 1) {
      const trend = futureMonths[futureMonths.length - 1].predicted > futureMonths[0].predicted ? 'upward' : 'downward';
      lines.push(`Monthly forecast shows an ${trend} trend driven by seasonal patterns.`);
    }
    lines.push(`Confidence bounds account for ±8-10% variance from historical patterns.`);
    return lines;
  }, [dailyPeak, dailyMin, monthlyForecast, unit]);

  return (
    <div className="p-4 space-y-5">
      {/* Next-Day Forecast */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Clock className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold">Next-Day Demand Prediction</h3>
        </div>
        <p className="text-[10px] text-muted-foreground mb-3">
          Based on historical time-of-day patterns, day-type, and seasonal trends (weather-independent)
        </p>
        <ResponsiveContainer width="100%" height={200}>
          <ComposedChart data={dailyForecast}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 15%, 18%)" />
            <XAxis dataKey="hour" tick={{ ...tk, fontSize: 8 }} interval={2} />
            <YAxis tick={tk} />
            <Tooltip {...tt} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Area type="monotone" dataKey="upper" fill="hsl(185, 80%, 45%)" stroke="none" fillOpacity={0.08} name="Upper Bound" />
            <Area type="monotone" dataKey="lower" fill="hsl(185, 80%, 45%)" stroke="none" fillOpacity={0.08} name="Lower Bound" />
            <Line type="monotone" dataKey="predicted" stroke={CHART_COLORS.renewable} strokeWidth={2} dot={{ r: 2, fill: CHART_COLORS.renewable }} name={`Predicted (${unit})`} />
          </ComposedChart>
        </ResponsiveContainer>
        <div className="grid grid-cols-2 gap-2 mt-3">
          <div className="bg-destructive/10 rounded-lg p-2.5 border border-destructive/20">
            <p className="text-[9px] text-muted-foreground uppercase">Peak Predicted</p>
            <p className="text-sm font-bold font-mono text-destructive">
              {dailyPeak?.predicted.toLocaleString()} {unit}
            </p>
            <p className="text-[10px] text-muted-foreground">{dailyPeak?.hour} (Evening)</p>
          </div>
          <div className="bg-accent/10 rounded-lg p-2.5 border border-accent/20">
            <p className="text-[9px] text-muted-foreground uppercase">Min Predicted</p>
            <p className="text-sm font-bold font-mono text-accent">
              {dailyMin?.predicted.toLocaleString()} {unit}
            </p>
            <p className="text-[10px] text-muted-foreground">{dailyMin?.hour} (Night)</p>
          </div>
        </div>
      </div>

      {/* Next-Month Forecast */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Calendar className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold">Monthly Demand Forecast</h3>
        </div>
        <p className="text-[10px] text-muted-foreground mb-3">
          6-month historical + 6-month predicted with confidence range
        </p>
        <ResponsiveContainer width="100%" height={200}>
          <ComposedChart data={monthlyForecast}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 15%, 18%)" />
            <XAxis dataKey="month" tick={tk} />
            <YAxis tick={tk} />
            <Tooltip {...tt} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Area type="monotone" dataKey="upper" fill="hsl(185, 80%, 45%)" stroke="none" fillOpacity={0.1} name="Upper Bound" />
            <Area type="monotone" dataKey="lower" fill="hsl(185, 80%, 45%)" stroke="none" fillOpacity={0.1} name="Lower Bound" />
            <Line type="monotone" dataKey="historical" stroke={CHART_COLORS.demand} strokeWidth={2} dot={{ fill: CHART_COLORS.demand, r: 3 }} name={`Historical (${unit})`} connectNulls={false} />
            <Line type="monotone" dataKey="predicted" stroke={CHART_COLORS.renewable} strokeWidth={2} strokeDasharray="5 5" dot={{ fill: CHART_COLORS.renewable, r: 3 }} name={`Predicted (${unit})`} connectNulls={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Insights */}
      <div className="bg-card border border-border rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-3.5 h-3.5 text-primary" />
          <h4 className="text-xs font-semibold">Forecast Insights</h4>
        </div>
        <div className="space-y-1.5">
          {insights.map((ins, i) => (
            <div key={i} className="flex items-start gap-2 text-[10px] text-muted-foreground">
              <span className="text-primary mt-0.5">▸</span>
              <span>{ins}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StateForecast;
