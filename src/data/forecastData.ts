import { GeneratedEnergy } from "./stateData";

export interface NextDayForecastPoint {
  hour: string;
  predicted: number;
  upper: number;
  lower: number;
}

const rand = (min: number, max: number) => min + Math.random() * (max - min);

/**
 * Generates a 24-hour next-day demand forecast for a state.
 * Weather-independent: uses historical time-of-day patterns, day-type, and seasonal trends.
 */
export function generateNextDayForecast(energy: GeneratedEnergy): NextDayForecastPoint[] {
  const baseLoad = energy.minDemand;
  const range = energy.peakDemand - baseLoad;

  // Historical demand pattern (normalized 0-1 across 24 hours)
  const pattern = [
    0.35, 0.30, 0.28, 0.25, 0.27, 0.35,
    0.45, 0.55, 0.65, 0.70, 0.72, 0.75,
    0.78, 0.80, 0.82, 0.78, 0.75, 0.80,
    0.92, 1.00, 0.95, 0.85, 0.65, 0.45,
  ];

  // Seasonal adjustment based on current month
  const month = new Date().getMonth();
  const seasonal = [1.05, 1.02, 0.98, 1.08, 1.15, 1.18, 1.05, 1.02, 0.98, 1.03, 1.08, 1.10];
  const seasonFactor = seasonal[month];

  // Day-type factor (weekday slightly higher than weekend average)
  const dayOfWeek = new Date().getDay();
  const dayFactor = dayOfWeek === 0 || dayOfWeek === 6 ? 0.92 : 1.02;

  return Array.from({ length: 24 }, (_, h) => {
    const predicted = (baseLoad + range * pattern[h]) * seasonFactor * dayFactor * rand(0.97, 1.03);
    return {
      hour: `${h.toString().padStart(2, '0')}:00`,
      predicted: Math.round(Math.max(0, predicted)),
      upper: Math.round(Math.max(0, predicted * 1.10)),
      lower: Math.round(Math.max(0, predicted * 0.90)),
    };
  });
}
