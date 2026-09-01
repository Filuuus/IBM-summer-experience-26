# Sentineli — CropAnalytics
> IBM AI Builders Wildcard Challenge · July 2026

AI-powered agricultural decision platform that estimates physical soil moisture from NASA satellite data and recommends the best hybrid corn varieties adjusted to real field conditions.

---

## Problem statement
Small and mid-scale corn producers in Jalisco, México lack affordable access to soil moisture data. Traditional sensors require hardware investment and technical expertise. Without reliable moisture estimates, planting decisions are based on intuition rather than data, leading to suboptimal variety selection and yield losses.

## Solution description
Sentineli provides a zero-hardware soil moisture estimation service. A farmer drops a GPS pin on a map, and the platform:
1. Snaps the pin to the nearest of 11 NASA-monitored reference plots across Jalisco
2. Runs a frozen LSTM model to estimate daily soil moisture for the entire 2024 season
3. Applies a FAO-56 water-productivity adjustment to historical hybrid yield data
4. Returns a ranked list of hybrid corn varieties tailored to the estimated moisture conditions of that specific location, together with MILK2024 economic projections

## AI approach and architecture

### Machine Learning Core — Domain-Adapted LSTM
- **Architecture:** Single-layer LSTM (64 hidden units) with linear output head, 14-day look-back window
- **Inputs:** 4 features — `Precipitation`, `T_Max`, `T_Min`, `SMAP_Soil_Moisture` (NASA SPL3SMP-E v006)
- **Training:** TxSON ground-truth stations (Texas, 2015–2021), 2 330 sequences
- **Performance:** R² = 0.876, RMSE = 0.019 m³/m³
- **Inference:** Frozen weights applied to 2024 Jalisco NASA data (SMAP + Daymet) — zero in-situ hardware required
- **Gap-filling:** `-9999` SMAP fill values handled via forward/backward fill + Hann 7-day smoother; ~63% of days imputed

### Recommendation engine
- FAO-56 yield response factor (Ky = 1.25) applied to historical DB yield averages
- Multi-dimensional composite score: nutritional quality (`leche_ton`), SM-adjusted productivity, NDF digestibility, and yield consistency — weights shift with estimated moisture suitability
- Wisconsin MILK2024 energy-balance model for economic projections

### Hackathon PoC strategy
- Pre-downloaded 2024 NASA data for 11 representative municipality plots in Jalisco (no live API calls → millisecond demo latency)
- SMAP: `SPL3SMP_E_006_Soil_Moisture_Retrieval_Data_AM_soil_moisture`
- Daymet: `DAYMET_004_prcp`, `DAYMET_004_tmax`, `DAYMET_004_tmin`

## Selected challenge theme
**Wildcard — Build Intelligent Systems for the Future of Work**

Sentineli targets agricultural decision-making: AI reduces the expertise barrier for moisture-aware planning, improves hybrid selection decisions, and helps producers achieve better economic outcomes through intelligent automation. It addresses: *How can AI improve decision-making?* and *How can AI help teams achieve outcomes faster?*

## Tech stack
| Layer | Technology |
|---|---|
| Frontend | Angular 21 · Tailwind CSS · Leaflet |
| Backend | Django 5 · Django REST Framework · PostGIS |
| ML | PyTorch · scikit-learn · NumPy |
| Database | PostgreSQL + PostGIS |
| Data | NASA AppEEARS (SMAP SPL3SMP-E v006 · Daymet v4) |

## How IBM Bob was used
IBM Bob was the **primary development tool** for the entire Sentineli ML pipeline and frontend integration:
- Designed and iterated the LSTM architecture based on the `references/production_estimation.py` schema
- Wrote `train_and_freeze.py`, `ml_engine.py`, `soil_moisture_forecast.py`, and `hybrid_recommender.py` from scratch
- Debugged Python 3.13 / scikit-learn compatibility issues with the virtual environment
- Built all three Django REST views (`SoilMoistureAnalysisView`, `PlotListView`, `RecomendacionHumedadView`)
- Scaffolded the full Angular standalone component (`soil-analysis`) with Leaflet map integration
- Calibrated the suitability scoring thresholds to Jalisco semi-arid conditions (recalibrated from TxSON Texas baseline)
- Redesigned the scoring formula from a yield-only ranking to a 4-dimensional normalised composite

## Running locally

### Backend
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

> Place the NASA CSV files in `backend/data/` before running:
> - `CropAnalytics-BOB-SMAP-2024-SPL3SMP-E-006-results.csv`
> - `CropAnalytics-BOB-Weather-2024-DAYMET-004-results.csv`
>
> To re-train the LSTM from scratch: `python train_and_freeze.py` (repo root)

### Frontend
```bash
cd frontend
npm install
ng serve --open
```

### Key URLs
| Route | Description |
|---|---|
| `http://localhost:4200/soil-analysis` | SMAP Soil Analysis & hybrid recommendation |
| `http://localhost:4200/calculator` | Wisconsin MILK 2024 calculator |
| `http://localhost:4200/analytics` | Analytics dashboard |
| `http://localhost:8000/api/soil-moisture/plots/` | 11 reference plots (JSON) |
