export interface StateInfo {
  name: string;
  icon: string;
  region: string;
  population: number;
  solarBase: number;
  windBase: number;
  hydroBase: number;
  biomassBase: number;
  demandBase: number;
}

export interface GeneratedEnergy {
  stateName: string;
  solar: number;
  wind: number;
  hydro: number;
  biomass: number;
  totalRenewable: number;
  gridEnergy: number;
  totalDemand: number;
  energySaved: number;
  renewablePercent: number;
  peakDemand: number;
  minDemand: number;
  dominantSource: string;
}

export interface DemandPoint {
  hour: number;
  label: string;
  demand: number;
  renewable: number;
  grid: number;
  segment: string;
}

export interface WastageItem {
  sector: string;
  icon: string;
  wastedMW: number;
  percentWaste: number;
  financialLoss: number;
  avoidableCO2: number;
}

export interface ForecastPoint {
  month: string;
  predicted: number;
  upper: number;
  lower: number;
  historical?: number;
}

export const CHART_COLORS = {
  solar: '#F59E0B',
  wind: '#3B82F6',
  hydro: '#2563EB',
  biomass: '#22C55E',
  grid: '#EF4444',
  renewable: '#10B981',
  demand: '#06B6D4',
  wastage: '#F97316',
  carbon: '#8B5CF6',
  peak: '#EF4444',
  offpeak: '#22C55E',
};

export const STATES: Record<string, StateInfo> = {
  "Rajasthan": { name: "Rajasthan", icon: "🏜️", region: "West", population: 68.5, solarBase: 5200, windBase: 1600, hydroBase: 320, biomassBase: 420, demandBase: 14200 },
  "Gujarat": { name: "Gujarat", icon: "🦁", region: "West", population: 60.4, solarBase: 4600, windBase: 3600, hydroBase: 620, biomassBase: 320, demandBase: 16500 },
  "Maharashtra": { name: "Maharashtra", icon: "🏛️", region: "West", population: 112.4, solarBase: 2800, windBase: 3200, hydroBase: 2600, biomassBase: 1100, demandBase: 25000 },
  "Tamil Nadu": { name: "Tamil Nadu", icon: "🛕", region: "South", population: 72.1, solarBase: 2200, windBase: 4600, hydroBase: 1300, biomassBase: 650, demandBase: 15000 },
  "Karnataka": { name: "Karnataka", icon: "🏰", region: "South", population: 61.1, solarBase: 3200, windBase: 2600, hydroBase: 3600, biomassBase: 850, demandBase: 13000 },
  "Andhra Pradesh": { name: "Andhra Pradesh", icon: "🌺", region: "South", population: 49.5, solarBase: 3600, windBase: 2100, hydroBase: 1600, biomassBase: 520, demandBase: 11000 },
  "Telangana": { name: "Telangana", icon: "🏺", region: "South", population: 35.0, solarBase: 2100, windBase: 520, hydroBase: 1300, biomassBase: 420, demandBase: 10000 },
  "Kerala": { name: "Kerala", icon: "🐘", region: "South", population: 33.4, solarBase: 520, windBase: 220, hydroBase: 2300, biomassBase: 320, demandBase: 5000 },
  "Uttar Pradesh": { name: "Uttar Pradesh", icon: "🕌", region: "North", population: 199.8, solarBase: 2600, windBase: 220, hydroBase: 520, biomassBase: 1600, demandBase: 22000 },
  "Madhya Pradesh": { name: "Madhya Pradesh", icon: "🐅", region: "Central", population: 72.6, solarBase: 3100, windBase: 1600, hydroBase: 820, biomassBase: 620, demandBase: 11000 },
  "West Bengal": { name: "West Bengal", icon: "🎭", region: "East", population: 91.3, solarBase: 520, windBase: 120, hydroBase: 320, biomassBase: 420, demandBase: 10000 },
  "Bihar": { name: "Bihar", icon: "🪔", region: "East", population: 104.1, solarBase: 420, windBase: 60, hydroBase: 220, biomassBase: 620, demandBase: 6000 },
  "Odisha": { name: "Odisha", icon: "🎨", region: "East", population: 41.9, solarBase: 620, windBase: 220, hydroBase: 1900, biomassBase: 320, demandBase: 6000 },
  "Punjab": { name: "Punjab", icon: "🌾", region: "North", population: 27.7, solarBase: 1600, windBase: 120, hydroBase: 520, biomassBase: 820, demandBase: 9000 },
  "Haryana": { name: "Haryana", icon: "🌻", region: "North", population: 25.4, solarBase: 1300, windBase: 60, hydroBase: 120, biomassBase: 420, demandBase: 8000 },
  "Jharkhand": { name: "Jharkhand", icon: "🌿", region: "East", population: 32.9, solarBase: 220, windBase: 60, hydroBase: 320, biomassBase: 220, demandBase: 4000 },
  "Chhattisgarh": { name: "Chhattisgarh", icon: "🌳", region: "Central", population: 25.5, solarBase: 520, windBase: 60, hydroBase: 220, biomassBase: 320, demandBase: 5000 },
  "Uttarakhand": { name: "Uttarakhand", icon: "⛰️", region: "North", population: 10.1, solarBase: 220, windBase: 60, hydroBase: 1600, biomassBase: 220, demandBase: 2500 },
  "Himachal Pradesh": { name: "Himachal Pradesh", icon: "🏔️", region: "North", population: 6.9, solarBase: 120, windBase: 40, hydroBase: 2100, biomassBase: 120, demandBase: 1800 },
  "Jammu & Kashmir": { name: "Jammu & Kashmir", icon: "🌸", region: "North", population: 12.5, solarBase: 220, windBase: 60, hydroBase: 1900, biomassBase: 120, demandBase: 2500 },
  "Goa": { name: "Goa", icon: "🏖️", region: "West", population: 1.5, solarBase: 120, windBase: 30, hydroBase: 20, biomassBase: 20, demandBase: 700 },
  "Assam": { name: "Assam", icon: "🍵", region: "Northeast", population: 31.2, solarBase: 120, windBase: 40, hydroBase: 520, biomassBase: 120, demandBase: 2000 },
  "Meghalaya": { name: "Meghalaya", icon: "🌧️", region: "Northeast", population: 3.0, solarBase: 40, windBase: 15, hydroBase: 420, biomassBase: 40, demandBase: 500 },
  "Nagaland": { name: "Nagaland", icon: "🎺", region: "Northeast", population: 2.0, solarBase: 25, windBase: 12, hydroBase: 120, biomassBase: 25, demandBase: 200 },
  "Manipur": { name: "Manipur", icon: "💃", region: "Northeast", population: 2.9, solarBase: 25, windBase: 8, hydroBase: 90, biomassBase: 18, demandBase: 200 },
  "Mizoram": { name: "Mizoram", icon: "🎋", region: "Northeast", population: 1.1, solarBase: 18, windBase: 8, hydroBase: 80, biomassBase: 12, demandBase: 150 },
  "Tripura": { name: "Tripura", icon: "🎪", region: "Northeast", population: 3.7, solarBase: 25, windBase: 8, hydroBase: 40, biomassBase: 45, demandBase: 300 },
  "Arunachal Pradesh": { name: "Arunachal Pradesh", icon: "🌅", region: "Northeast", population: 1.4, solarBase: 35, windBase: 12, hydroBase: 320, biomassBase: 25, demandBase: 250 },
  "Sikkim": { name: "Sikkim", icon: "🏔️", region: "Northeast", population: 0.6, solarBase: 12, windBase: 8, hydroBase: 220, biomassBase: 12, demandBase: 150 },
  "Delhi": { name: "Delhi", icon: "🏛️", region: "North", population: 16.8, solarBase: 420, windBase: 0, hydroBase: 0, biomassBase: 60, demandBase: 6500 },
  "Ladakh": { name: "Ladakh", icon: "🗻", region: "North", population: 0.3, solarBase: 80, windBase: 20, hydroBase: 60, biomassBase: 5, demandBase: 80 },
  "Puducherry": { name: "Puducherry", icon: "🏝️", region: "South", population: 1.2, solarBase: 30, windBase: 15, hydroBase: 0, biomassBase: 10, demandBase: 350 },
  "Chandigarh": { name: "Chandigarh", icon: "🌹", region: "North", population: 1.1, solarBase: 35, windBase: 0, hydroBase: 0, biomassBase: 5, demandBase: 300 },
  "Andaman & Nicobar Islands": { name: "Andaman & Nicobar Islands", icon: "🏝️", region: "South", population: 0.4, solarBase: 15, windBase: 8, hydroBase: 0, biomassBase: 5, demandBase: 60 },
  "Dadra and Nagar Haveli and Daman and Diu": { name: "Dadra & Nagar Haveli", icon: "🏭", region: "West", population: 0.6, solarBase: 25, windBase: 10, hydroBase: 0, biomassBase: 8, demandBase: 400 },
  "Lakshadweep": { name: "Lakshadweep", icon: "🐚", region: "South", population: 0.06, solarBase: 5, windBase: 3, hydroBase: 0, biomassBase: 2, demandBase: 15 },
};

// Name mapping for GeoJSON/TopoJSON compatibility
export const STATE_NAME_MAP: Record<string, string> = {
  "Orissa": "Odisha",
  "Uttaranchal": "Uttarakhand",
  "NCT of Delhi": "Delhi",
  "Chattisgarh": "Chhattisgarh",
  "Jammu and Kashmir": "Jammu & Kashmir",
  "Andaman and Nicobar Islands": "Andaman & Nicobar Islands",
  "Andaman and Nicobar": "Andaman & Nicobar Islands",
  "Daman and Diu": "Dadra and Nagar Haveli and Daman and Diu",
  "Dadra and Nagar Haveli": "Dadra and Nagar Haveli and Daman and Diu",
};

export function normalizeStateName(name: string): string {
  return STATE_NAME_MAP[name] || name;
}

const rand = (min: number, max: number) => min + Math.random() * (max - min);
const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));

export function generateStateEnergy(state: StateInfo): GeneratedEnergy {
  const solar = clamp(state.solarBase * rand(0.7, 1.1), 0, state.demandBase);
  const wind = clamp(state.windBase * rand(0.5, 1.2), 0, state.demandBase);
  const hydro = clamp(state.hydroBase * rand(0.6, 1.1), 0, state.demandBase);
  const biomass = clamp(state.biomassBase * rand(0.6, 1.0), 0, state.demandBase);
  const totalRenewable = solar + wind + hydro + biomass;
  const totalDemand = clamp(state.demandBase * rand(0.88, 1.12), totalRenewable * 0.6, state.demandBase * 1.3);
  const gridEnergy = Math.max(0, totalDemand - totalRenewable);
  const energySaved = totalRenewable * rand(0.25, 0.35);
  const renewablePercent = clamp(Math.round((totalRenewable / totalDemand) * 100), 0, 100);
  const peakDemand = totalDemand * rand(1.15, 1.35);
  const minDemand = totalDemand * rand(0.45, 0.6);

  const sources = [
    { name: 'Solar', val: solar },
    { name: 'Wind', val: wind },
    { name: 'Hydro', val: hydro },
    { name: 'Biomass', val: biomass },
  ];
  const dominantSource = sources.sort((a, b) => b.val - a.val)[0].name;

  return {
    stateName: state.name,
    solar: Math.round(solar),
    wind: Math.round(wind),
    hydro: Math.round(hydro),
    biomass: Math.round(biomass),
    totalRenewable: Math.round(totalRenewable),
    gridEnergy: Math.round(gridEnergy),
    totalDemand: Math.round(totalDemand),
    energySaved: Math.round(energySaved),
    renewablePercent,
    peakDemand: Math.round(peakDemand),
    minDemand: Math.round(minDemand),
    dominantSource,
  };
}

export function generateAllStatesEnergy(): Map<string, GeneratedEnergy> {
  const map = new Map<string, GeneratedEnergy>();
  Object.entries(STATES).forEach(([name, state]) => {
    map.set(name, generateStateEnergy(state));
  });
  return map;
}

export function generateDemandCurve(energy: GeneratedEnergy): DemandPoint[] {
  const points: DemandPoint[] = [];
  const baseLoad = energy.minDemand;
  const range = energy.peakDemand - baseLoad;

  const pattern = [
    0.35, 0.30, 0.28, 0.25, 0.27, 0.35,
    0.45, 0.55, 0.65, 0.70, 0.72, 0.75,
    0.78, 0.80, 0.82, 0.78, 0.75, 0.80,
    0.92, 1.00, 0.95, 0.85, 0.65, 0.45,
  ];

  for (let h = 0; h < 24; h++) {
    const segment = h < 6 ? 'Night' : h < 12 ? 'Morning' : h < 18 ? 'Afternoon' : 'Evening';
    const demand = baseLoad + range * pattern[h] * rand(0.92, 1.08);
    let renewFactor = energy.renewablePercent / 100;
    if (h >= 6 && h <= 16) renewFactor *= 1.3;
    if (h >= 17 && h <= 22) renewFactor *= 0.7;
    renewFactor = clamp(renewFactor, 0, 0.95);

    points.push({
      hour: h,
      label: `${h.toString().padStart(2, '0')}:00`,
      demand: Math.round(demand),
      renewable: Math.round(demand * renewFactor),
      grid: Math.round(demand * (1 - renewFactor)),
      segment,
    });
  }
  return points;
}

export function generateWastageData(energy: GeneratedEnergy): WastageItem[] {
  const td = energy.totalDemand;
  return [
    { sector: "Street Lighting", icon: "💡", wastedMW: Math.round(td * rand(0.02, 0.04)), percentWaste: Math.round(rand(18, 28)), financialLoss: 0, avoidableCO2: 0 },
    { sector: "Schools & Colleges", icon: "🏫", wastedMW: Math.round(td * rand(0.015, 0.03)), percentWaste: Math.round(rand(12, 22)), financialLoss: 0, avoidableCO2: 0 },
    { sector: "Hospitals", icon: "🏥", wastedMW: Math.round(td * rand(0.01, 0.02)), percentWaste: Math.round(rand(8, 16)), financialLoss: 0, avoidableCO2: 0 },
    { sector: "Commercial Buildings", icon: "🏢", wastedMW: Math.round(td * rand(0.03, 0.06)), percentWaste: Math.round(rand(22, 32)), financialLoss: 0, avoidableCO2: 0 },
  ].map(item => ({
    ...item,
    financialLoss: Math.round(item.wastedMW * 4.5 * 24 * 30 / 10),
    avoidableCO2: Math.round(item.wastedMW * 0.82 * 24 * 30 / 1000),
  }));
}

export function generateCarbonData(energy: GeneratedEnergy) {
  const factors = { grid: 0.82, solar: 0.02, wind: 0.01, hydro: 0.02, biomass: 0.23 };
  const emissions = {
    grid: energy.gridEnergy * factors.grid * 24 / 1000,
    solar: energy.solar * factors.solar * 24 / 1000,
    wind: energy.wind * factors.wind * 24 / 1000,
    hydro: energy.hydro * factors.hydro * 24 / 1000,
    biomass: energy.biomass * factors.biomass * 24 / 1000,
  };
  const total = Object.values(emissions).reduce((a, b) => a + b, 0);
  const avoided = energy.totalRenewable * factors.grid * 24 / 1000;

  return {
    bySource: [
      { source: 'Grid (Coal/Gas)', emissions: Math.round(emissions.grid), color: CHART_COLORS.grid },
      { source: 'Solar', emissions: Math.round(emissions.solar), color: CHART_COLORS.solar },
      { source: 'Wind', emissions: Math.round(emissions.wind), color: CHART_COLORS.wind },
      { source: 'Hydro', emissions: Math.round(emissions.hydro), color: CHART_COLORS.hydro },
      { source: 'Biomass', emissions: Math.round(emissions.biomass), color: CHART_COLORS.biomass },
    ],
    total: Math.round(total),
    avoided: Math.round(avoided),
  };
}

export function generateCostData(energy: GeneratedEnergy) {
  const uc = { solar: 2.8, wind: 3.2, hydro: 2.5, biomass: 4.0, grid: 5.5 };
  const costs = {
    solar: energy.solar * uc.solar * 24 / 100000,
    wind: energy.wind * uc.wind * 24 / 100000,
    hydro: energy.hydro * uc.hydro * 24 / 100000,
    biomass: energy.biomass * uc.biomass * 24 / 100000,
    grid: energy.gridEnergy * uc.grid * 24 / 100000,
  };
  const total = Object.values(costs).reduce((a, b) => a + b, 0);
  const savings = energy.totalRenewable * (uc.grid - 3.0) * 24 / 100000;

  return {
    bySource: [
      { source: 'Solar', cost: +costs.solar.toFixed(2), unitCost: uc.solar, color: CHART_COLORS.solar },
      { source: 'Wind', cost: +costs.wind.toFixed(2), unitCost: uc.wind, color: CHART_COLORS.wind },
      { source: 'Hydro', cost: +costs.hydro.toFixed(2), unitCost: uc.hydro, color: CHART_COLORS.hydro },
      { source: 'Biomass', cost: +costs.biomass.toFixed(2), unitCost: uc.biomass, color: CHART_COLORS.biomass },
      { source: 'Grid', cost: +costs.grid.toFixed(2), unitCost: uc.grid, color: CHART_COLORS.grid },
    ],
    total: +total.toFixed(2),
    savings: +savings.toFixed(2),
  };
}

export function generateForecast(energy: GeneratedEnergy): ForecastPoint[] {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonth = new Date().getMonth();
  const seasonal = [1.05, 1.02, 0.98, 1.08, 1.15, 1.18, 1.05, 1.02, 0.98, 1.03, 1.08, 1.10];

  const points: ForecastPoint[] = [];
  const base = energy.totalDemand;

  for (let i = 5; i >= 0; i--) {
    const mi = (currentMonth - i + 12) % 12;
    points.push({
      month: months[mi],
      predicted: 0,
      upper: 0,
      lower: 0,
      historical: Math.round(base * seasonal[mi] * rand(0.9, 1.1)),
    });
  }

  for (let i = 1; i <= 6; i++) {
    const mi = (currentMonth + i) % 12;
    const trend = 1 + (i * 0.008);
    const predicted = base * seasonal[mi] * trend;
    points.push({
      month: months[mi],
      predicted: Math.round(predicted),
      upper: Math.round(predicted * 1.08),
      lower: Math.round(predicted * 0.92),
    });
  }
  return points;
}

export function getStateInsight(energy: GeneratedEnergy): string {
  const parts: string[] = [];
  if (energy.renewablePercent > 60) {
    parts.push(`${energy.stateName} demonstrates strong renewable adoption at ${energy.renewablePercent}% of total demand.`);
  } else if (energy.renewablePercent < 30) {
    parts.push(`${energy.stateName} relies heavily on grid power (${100 - energy.renewablePercent}%). Renewable expansion is a priority.`);
  } else {
    parts.push(`${energy.stateName} has moderate renewable penetration at ${energy.renewablePercent}%.`);
  }
  parts.push(`This state primarily relies on ${energy.dominantSource.toLowerCase()} energy.`);
  return parts.join(' ');
}
