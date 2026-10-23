const BASE_URL = "http://127.0.0.1:8000";

// Helper: fetch with timeout + clear error message
async function apiFetch(url: string): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    return res;
  } catch (err: unknown) {
    clearTimeout(timer);
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("Request timed out. Is the backend running?");
    }
    throw new Error(
      "Cannot reach backend at http://127.0.0.1:8000 — open a terminal and run: uvicorn app:app --reload  (inside the backend folder)"
    );
  }
}

export interface PredictResponse {
  predicted_emissions: number;
  year: number;
  renewable_percent: number;
  energy_consumption: number;
}

export interface SimulateResponse {
  simulated_emissions: number;
  solar: number;
  wind: number;
  coal: number;
}

export interface InsightsResponse {
  suggestions: string[];
  renewable_percent: number;
}

export async function predictEmissions(
  year: number,
  renewable: number,
  energy: number
): Promise<PredictResponse> {
  const res = await apiFetch(
    `${BASE_URL}/predict?year=${year}&renewable=${renewable}&energy=${energy}`
  );
  if (!res.ok) throw new Error(`Predict API error: ${res.status} ${res.statusText}`);
  return res.json();
}

export async function simulatePolicy(
  solar: number,
  wind: number,
  coal: number
): Promise<SimulateResponse> {
  const res = await apiFetch(
    `${BASE_URL}/simulate?solar=${solar}&wind=${wind}&coal=${coal}`
  );
  if (!res.ok) throw new Error(`Simulate API error: ${res.status} ${res.statusText}`);
  return res.json();
}

export async function fetchInsights(renewable: number): Promise<InsightsResponse> {
  const res = await apiFetch(`${BASE_URL}/insights?renewable=${renewable}`);
  if (!res.ok) throw new Error(`Insights API error: ${res.status} ${res.statusText}`);
  return res.json();
}

export async function fetchFutureTrend(
  baseRenewable: number,
  baseEnergy: number
): Promise<{ year: number; emissions: number }[]> {
  const years = [2025, 2027, 2030, 2032, 2035, 2040, 2045, 2047];
  const results = await Promise.all(
    years.map(async (year) => {
      const offset = year - 2025;
      const renewable = Math.min(95, Math.round(baseRenewable + offset * 1.5));
      const energy = Math.round(baseEnergy * Math.pow(1.02, offset));
      try {
        const data = await predictEmissions(year, renewable, energy);
        return { year, emissions: data.predicted_emissions };
      } catch {
        return null;
      }
    })
  );
  const valid = results.filter(Boolean) as { year: number; emissions: number }[];
  if (valid.length === 0) {
    throw new Error(
      "Cannot reach backend at http://127.0.0.1:8000 — open a terminal and run: uvicorn app:app --reload  (inside the backend folder)"
    );
  }
  return valid;
}
