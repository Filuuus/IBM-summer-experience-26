# Geospatial and Confidence Enhancements - IBM Hackathon 2026

## Overview
This document describes the major enhancements implemented for the IBM Hackathon 2026, including confidence factor analysis and geospatial estimation capabilities for the Sentineli agricultural intelligence platform.

## Branch Information
- **Branch Name**: `feature/geospatial-confidence-enhancements`
- **Created**: June 24, 2026
- **Purpose**: IBM Hackathon 2026 implementation

## Changes Summary

### 1. About Us Page Update
**File**: `frontend/src/app/about/components/about/About.html`

**Changes**:
- Removed previous contributor names and GitHub links
- Updated content to focus on technology and methodology
- Added section highlighting Wisconsin MILK2024 technology
- Changed disclaimer to reflect IBM Hackathon 2026 participation
- Maintained professional presentation suitable for hackathon demonstration

**Rationale**: Previous contributors were notified and approved the changes for hackathon participation with a new team.

---

### 2. Confidence Factor System
**File**: `backend/api/utils/milk_calculator.py`

**New Features**:

#### `calcular_factor_confianza()` Function
Calculates a confidence score (0-100%) for MILK2024 estimations based on:

1. **Data Completeness** (up to -40% penalty)
   - Checks for missing critical nutritional data (MS, CP, NDF, Starch)
   - Each missing critical field: -10%

2. **Nutritional Value Ranges** (up to -30% penalty)
   - Dry Matter (MS): Optimal 30-40%, Acceptable 28-45%
   - Crude Protein (CP): Optimal 7-10%, Acceptable 6-12%
   - Neutral Detergent Fiber (NDF): Optimal 35-50%, Acceptable 30-55%
   - Starch: Optimal 25-35%, Acceptable 20-40%

3. **Default Value Usage** (up to -15% penalty)
   - Tracks when fallback values are used (NDFD, uNDF240, Starch digestibility)
   - Each fallback: -5%

4. **Energy Coherence** (up to -10% penalty)
   - Validates NEL (Net Energy for Lactation) is within expected range (1.3-1.8 Mcal/kg)

**Confidence Levels**:
- **Excellent** (85-100%): Complete data, optimal ranges, highly reliable
- **Good** (70-84%): Sufficient data, acceptable ranges, reliable with minor considerations
- **Moderate** (50-69%): Partial data or suboptimal values, requires validation
- **Low** (<50%): Insufficient data, significant issues, preliminary estimates only

**Output Structure**:
```json
{
  "confianza": {
    "factor_confianza": 72.0,
    "nivel_confianza": "Buena",
    "color_indicador": "blue",
    "penalizaciones": ["MS fuera de rango óptimo..."],
    "advertencias": ["NEL alta..."],
    "justificacion": "Confianza Buena (72.0%): Datos suficientes..."
  }
}
```

---

### 3. Geospatial Estimation System
**File**: `backend/api/utils/geospatial_estimator.py`

**New Module** providing location-based yield adjustments.

#### Key Functions:

##### `calcular_distancia_haversine()`
- Calculates distance between two geographic points
- Uses Haversine formula for accuracy
- Returns distance in kilometers

##### `clasificar_zona_climatica()`
Classifies climate zones based on latitude and altitude:

**Latitude Zones** (Mexico: 14°N - 32°N):
- **Tropical** (<18°): Factor 0.92 (excessive heat)
- **Subtropical** (18-24°): Factor 1.00 (optimal)
- **Temperate** (24-28°): Factor 1.05 (moderate temperatures)
- **Temperate-Cold** (>28°): Factor 0.95 (lower temperatures)

**Altitude Zones**:
- **Lowlands** (<500m): Factor 0.95 (excessive heat)
- **Mid-lands** (500-1500m): Factor 1.05 (optimal for corn)
- **Highlands** (1500-2500m): Factor 1.00 (good zone)
- **Very High** (>2500m): Factor 0.90 (cold limits growth)

##### `estimar_ajuste_regional()`
Estimates regional adjustments using reference zones:

**Reference Production Zones**:
- Sinaloa: 1.10 (highest productivity)
- Jalisco: 1.05
- Michoacán: 1.03
- Guanajuato: 1.02
- Estado de México: 1.00 (baseline)

**Distance Adjustment**:
- Factor reduces 1% per 100km from reference zone
- Minimum factor: 0.85

**Geospatial Confidence**:
- **High** (<100km): 95% confidence
- **Medium-High** (100-300km): 85% confidence
- **Medium** (300-500km): 75% confidence
- **Low** (>500km): 60% confidence

**Recommendations Generated**:
- Heat-tolerant hybrids for tropical zones
- Short-cycle hybrids for cold zones
- Frost monitoring for high altitudes
- Efficient irrigation for lowlands
- Local data validation for distant zones

##### `aplicar_ajuste_geoespacial()`
Applies geospatial adjustments to base yield estimates:

**Output Structure**:
```json
{
  "rendimiento_base": 20.0,
  "rendimiento_ajustado": 20.5,
  "diferencia_ton_ha": 0.5,
  "porcentaje_ajuste": 2.5,
  "factor_aplicado": 1.025,
  "detalles_geoespaciales": {
    "zona_referencia_cercana": "Jalisco",
    "distancia_zona_referencia_km": 0.0,
    "clasificacion_climatica": {...},
    "confianza_geoespacial": "Alta",
    "recomendaciones": [...]
  }
}
```

---

### 4. New API Endpoint
**File**: `backend/api/views.py`

#### `CalcularProductorGeoView`
New endpoint: `/api/calcular-productor-geo/`

**Purpose**: Enhanced calculator with geospatial adjustments

**Request Parameters**:
```json
{
  "hibrido_id": 1,           // Required: Hybrid ID or name
  "yield_dm": 20.0,          // Required: Base yield (ton/ha)
  "terreno_id": 5,           // Optional: Existing field ID
  // OR provide coordinates:
  "latitud": 20.5,           // Optional: Latitude
  "longitud": -103.5,        // Optional: Longitude
  "altitud": 1500            // Optional: Altitude (m)
}
```

**Response Structure**:
```json
{
  "hibrido": {...},
  "ubicacion": {...},
  "valores_bromatologicos_promedio": {...},
  "estimacion_base": {
    // MILK2024 results without geospatial adjustment
    "nel": 1.87,
    "leche_ha": 14045.81,
    "confianza": {...}
  },
  "ajuste_geoespacial": {
    // Geospatial adjustment details
    "rendimiento_ajustado": 20.5,
    "factor_aplicado": 1.025,
    "detalles_geoespaciales": {...}
  },
  "estimacion_ajustada": {
    // MILK2024 results with geospatial adjustment
    "nel": 1.87,
    "leche_ha": 14396.95,
    "confianza": {...}
  }
}
```

**Features**:
- Accepts either `terreno_id` (existing field) or custom coordinates
- Provides both base and geospatially-adjusted estimates
- Includes confidence factors for both nutritional and geospatial data
- Returns actionable recommendations based on location

---

### 5. URL Configuration
**File**: `backend/api/urls.py`

**Added Route**:
```python
path('calcular-productor-geo/', CalcularProductorGeoView.as_view(), name='calcular-productor-geo')
```

---

## Technical Implementation Details

### Wisconsin MILK2024 Model
The confidence system validates against the scientific standards of the Wisconsin MILK2024 model:

**Key Equations** (from original implementation):
1. **Fatty Acids (FA)**: `FA = max(0, EE - 1.0)`
2. **Residual Organic Matter (ROM)**: `ROM = 100 - (Ash + NDF + Starch + FA + CP)`
3. **Total Digestible Nutrients (TDN)**: `TDN = dCP + dROM + (dFA × 2.25) + dStarch + dNDF`
4. **Net Energy for Lactation (NEL)**: `NEL = (0.703 × DE) - 0.19`
5. **Milk Production**: `Milk/ton = (NEL × 311.4) + 120.0`

The confidence system ensures these calculations are based on quality input data.

### Geospatial Algorithm
The geospatial system uses a multi-factor approach:

1. **Distance-based weighting** from known high-production zones
2. **Climate classification** using latitude and altitude
3. **Combined factor calculation**: `(Regional Factor + Climate Factor) / 2`
4. **Confidence scoring** based on proximity to reference data

This provides scientifically-grounded location adjustments while maintaining transparency about estimation reliability.

---

## Usage Examples

### Example 1: Using Existing Field
```bash
curl -X POST http://localhost:8000/api/calcular-productor-geo/ \
  -H "Content-Type: application/json" \
  -d '{
    "hibrido_id": 1,
    "yield_dm": 20,
    "terreno_id": 5
  }'
```

### Example 2: Using Custom Coordinates
```bash
curl -X POST http://localhost:8000/api/calcular-productor-geo/ \
  -H "Content-Type: application/json" \
  -d '{
    "hibrido_id": "806",
    "yield_dm": 20,
    "latitud": 20.5,
    "longitud": -103.5,
    "altitud": 1500
  }'
```

### Example 3: Minimal Request (No Altitude)
```bash
curl -X POST http://localhost:8000/api/calcular-productor-geo/ \
  -H "Content-Type: application/json" \
  -d '{
    "hibrido_id": 1,
    "yield_dm": 18.5,
    "latitud": 19.5,
    "longitud": -99.5
  }'
```

---

## Testing Results

### Test Case: Jalisco Location
**Input**:
- Hybrid: NOVASEM 806
- Base Yield: 20 ton/ha
- Location: Jalisco (20.5°N, -103.5°W, 1500m)

**Results**:
- **Confidence Factor**: 72% (Good)
  - Penalization: MS out of optimal range (-8%)
  - Penalization: Default values used (-15%)
  - Warning: High NEL value
  
- **Geospatial Adjustment**: +2.5%
  - Zone: Subtropical - Highlands
  - Reference: Jalisco (0 km distance)
  - Geospatial Confidence: High (95%)
  
- **Production Estimates**:
  - Base: 14,045.81 kg milk/ha
  - Adjusted: 14,396.95 kg milk/ha
  - Improvement: +351.14 kg milk/ha

---

## Benefits for Farmers

1. **Transparency**: Clear confidence scores explain estimation reliability
2. **Location-Aware**: Adjustments based on actual geographic conditions
3. **Actionable Insights**: Specific recommendations for each location
4. **Scientific Basis**: Grounded in Wisconsin MILK2024 and regional data
5. **Risk Assessment**: Understand uncertainty in predictions

---

## Future Enhancements

Potential improvements for future versions:

1. **Weather Integration**: Real-time climate data from APIs
2. **Soil Data**: Incorporate soil type and quality metrics
3. **Historical Validation**: Compare predictions with actual yields
4. **Machine Learning**: Train models on accumulated data
5. **Precision Agriculture**: Field-level variation mapping
6. **Seasonal Adjustments**: Account for planting date effects

---

## IBM Hackathon 2026 Notes

This implementation demonstrates:
- **Scientific Rigor**: Evidence-based agricultural modeling
- **Practical Application**: Real-world farmer decision support
- **Scalability**: Modular design for easy expansion
- **User-Centric**: Clear communication of uncertainty
- **Innovation**: Novel combination of nutritional and geospatial analysis

The system provides farmers with the confidence to make informed decisions about hybrid selection and expected yields based on their specific location and conditions.

---

## Contributors

Developed for IBM Hackathon 2026 by the current team. Previous contributors to the base platform were notified and approved this adaptation.

## License

This enhancement maintains the original project's intellectual property status while being adapted for hackathon demonstration purposes.