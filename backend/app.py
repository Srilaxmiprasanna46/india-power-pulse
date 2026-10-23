from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pickle
import pandas as pd

app = FastAPI(title="India Power Pulse — Emissions API")

# ── CORS: allow ALL origins — fixes "Failed to fetch" in any browser ──────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Load model once at startup ────────────────────────────────────────────────
model = pickle.load(open("model.pkl", "rb"))
# Feature order the model was trained on: year, renewable, energy_consumption


@app.get("/")
def home():
    return {"message": "India Power Pulse API is running 🚀"}


@app.get("/predict")
def predict(year: int, renewable: float, energy: float):
    """
    Predict CO₂ emissions.
    Params:
      year       — target year  (e.g. 2030)
      renewable  — renewable %  (e.g. 50)
      energy     — energy consumption in TWh  (e.g. 900)
    Returns:
      predicted_emissions — Mt CO₂ (clamped to 0 minimum)
      year, renewable_percent, energy_consumption
    """
    df = pd.DataFrame(
        [[year, renewable, energy]],
        columns=["year", "renewable", "energy_consumption"],
    )
    raw = float(model.predict(df)[0])
    # Linear regression can go negative for far-future high-renewable scenarios.
    # Clamp to 0 — physically means near-zero / net-zero achieved.
    emissions = max(0.0, round(raw, 2))
    return {
        "predicted_emissions": emissions,
        "year": year,
        "renewable_percent": renewable,
        "energy_consumption": energy,
    }


@app.get("/simulate")
def simulate(solar: float, wind: float, coal: float):
    """
    Simulate policy scenario emissions.
    Params:
      solar  — solar share %
      wind   — wind share %
      coal   — coal share %
    Returns:
      simulated_emissions — Mt CO₂
      solar, wind, coal
    """
    # Formula: coal raises emissions, solar+wind reduce them
    # Baseline 700 Mt, coal adds up to +300, renewables reduce up to -300
    base = 700
    renewable_reduction = (solar * 3.0) + (wind * 2.5)
    coal_penalty = coal * 3.5
    emissions = base - renewable_reduction + coal_penalty
    # Clamp between 0 and 2000
    emissions = max(0.0, min(2000.0, round(emissions, 2)))
    return {
        "simulated_emissions": emissions,
        "solar": solar,
        "wind": wind,
        "coal": coal,
    }


@app.get("/insights")
def insights(renewable: float):
    """
    Return policy suggestions based on current renewable %.
    Param:
      renewable — average renewable % across states
    Returns:
      suggestions — list of recommendation strings
      renewable_percent
    """
    suggestions = []

    if renewable < 20:
        suggestions = [
            "Critical: Renewable share below 20% — immediate large-scale solar and wind investment required.",
            "Prioritise retiring coal plants older than 25 years to reduce baseline emissions.",
            "Introduce carbon tax mechanisms to incentivise industry transition away from fossil fuels.",
            "Launch state-level rooftop solar subsidy programmes to accelerate distributed generation.",
            "Establish dedicated green energy corridors to reduce transmission losses from remote sites.",
        ]
    elif renewable < 40:
        suggestions = [
            "Renewable share at {:.0f}% — target 50% by 2030 with accelerated wind and solar auctions.".format(renewable),
            "Invest in battery storage infrastructure to handle intermittency of solar and wind power.",
            "Expand green hydrogen pilot projects to decarbonise hard-to-abate industrial sectors.",
            "Strengthen grid interconnections between surplus and deficit states for efficient balancing.",
            "Introduce net-metering policies in all states to encourage prosumer participation.",
        ]
    elif renewable < 60:
        suggestions = [
            "Good progress at {:.0f}% renewable — focus on storage and grid modernisation to go further.".format(renewable),
            "Deploy smart meters across urban centres to enable demand-response and reduce peak load.",
            "Explore offshore wind potential along India's 7,500 km coastline for additional capacity.",
            "Scale up pumped hydro storage to complement solar generation during evening peak hours.",
            "Incentivise EV adoption to absorb surplus solar generation and reduce transport emissions.",
        ]
    else:
        suggestions = [
            "Excellent: {:.0f}% renewable — India is on track for its 2047 net-zero vision.".format(renewable),
            "Focus on electrifying remaining fossil-fuel-dependent industries (steel, cement, chemicals).",
            "Export surplus renewable energy to neighbouring countries via cross-border power agreements.",
            "Invest in carbon capture research to handle residual industrial emissions at net-zero target.",
            "Document and share India's energy transition model as a blueprint for developing nations.",
        ]

    return {
        "suggestions": suggestions,
        "renewable_percent": round(renewable, 1),
    }
