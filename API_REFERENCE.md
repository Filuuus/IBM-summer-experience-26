# CropAnalytics API Reference

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Base URL](#base-url)
4. [Response Format](#response-format)
5. [Error Handling](#error-handling)
6. [Geographic Endpoints](#geographic-endpoints)
7. [Agricultural Endpoints](#agricultural-endpoints)
8. [Prediction Endpoints](#prediction-endpoints)
9. [Recommendation Endpoints](#recommendation-endpoints)
10. [Leafmap Endpoints](#leafmap-endpoints)
11. [Weather Endpoints](#weather-endpoints)
12. [Rate Limiting](#rate-limiting)

---

## Overview

The CropAnalytics API is a RESTful API built with Django REST Framework that provides access to agricultural data, machine learning predictions, and geospatial analysis capabilities.

### API Version

Current Version: **v1**

### Content Type

All requests and responses use JSON format:
```
Content-Type: application/json
```

---

## Authentication

### Current Status

**Development**: No authentication required  
**Production** (Planned): JWT token-based authentication

### Future Authentication Flow

```http
POST /api/v1/auth/login/
Content-Type: application/json

{
  "username": "user@example.com",
  "password": "secure_password"
}
```

**Response**:
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "username": "user@example.com",
    "role": "farmer"
  }
}
```

**Using Token**:
```http
GET /api/v1/ciclos/
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
```

---

## Base URL

### Development
```
http://localhost:8000/api/v1/
```

### Production (Planned)
```
https://api.cropanalytics.com/v1/
```

---

## Response Format

### Success Response

```json
{
  "status": "success",
  "data": {
    // Response data
  },
  "meta": {
    "timestamp": "2026-06-17T19:00:00Z",
    "version": "1.0"
  }
}
```

### Paginated Response

```json
{
  "status": "success",
  "data": {
    "count": 150,
    "next": "http://localhost:8000/api/v1/ciclos/?page=2",
    "previous": null,
    "results": [
      // Array of objects
    ]
  },
  "meta": {
    "page": 1,
    "page_size": 20,
    "total_pages": 8
  }
}
```

---

## Error Handling

### Error Response Format

```json
{
  "status": "error",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field_name": ["Error message"]
    }
  },
  "meta": {
    "timestamp": "2026-06-17T19:00:00Z"
  }
}
```

### HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 204 | No Content | Request successful, no content to return |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Authentication required |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 422 | Unprocessable Entity | Validation error |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

### Common Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Input validation failed |
| `NOT_FOUND` | Resource not found |
| `UNAUTHORIZED` | Authentication required |
| `FORBIDDEN` | Insufficient permissions |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `INTERNAL_ERROR` | Server error |
| `ML_PREDICTION_FAILED` | ML model prediction error |
| `SPATIAL_ANALYSIS_FAILED` | Leafmap operation error |

---

## Geographic Endpoints

### Estados (States)

#### List All States

```http
GET /api/v1/estados/
```

**Query Parameters**:
- `page` (integer): Page number (default: 1)
- `page_size` (integer): Items per page (default: 20, max: 100)
- `search` (string): Search by name or code

**Response**:
```json
{
  "status": "success",
  "data": {
    "count": 32,
    "results": [
      {
        "id": 1,
        "nombre": "Jalisco",
        "codigo": "JAL",
        "geometry": {
          "type": "MultiPolygon",
          "coordinates": [[[...]]]
        },
        "municipios_count": 125,
        "area_km2": 78599.0
      }
    ]
  }
}
```

#### Get State Details

```http
GET /api/v1/estados/{id}/
```

**Response**:
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "nombre": "Jalisco",
    "codigo": "JAL",
    "geometry": {
      "type": "MultiPolygon",
      "coordinates": [[[...]]]
    },
    "municipios": [
      {
        "id": 1,
        "nombre": "Guadalajara"
      }
    ],
    "statistics": {
      "total_terrenos": 45,
      "total_ciclos": 320,
      "avg_yield": 16.5
    }
  }
}
```

#### Get Municipalities in State

```http
GET /api/v1/estados/{id}/municipios/
```

**Response**:
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "nombre": "Guadalajara",
      "geometry": {
        "type": "MultiPolygon",
        "coordinates": [[[...]]]
      },
      "terrenos_count": 12
    }
  ]
}
```

### Municipios (Municipalities)

#### List All Municipalities

```http
GET /api/v1/municipios/
```

**Query Parameters**:
- `estado` (integer): Filter by state ID
- `search` (string): Search by name

**Response**: Similar to estados list

#### Get Municipality Details

```http
GET /api/v1/municipios/{id}/
```

### Terrenos (Land Plots)

#### List All Plots

```http
GET /api/v1/terrenos/
```

**Query Parameters**:
- `municipio` (integer): Filter by municipality
- `min_area` (float): Minimum area in hectares
- `max_area` (float): Maximum area in hectares
- `tipo_riego` (string): Filter by irrigation type

**Response**:
```json
{
  "status": "success",
  "data": {
    "results": [
      {
        "id": 1,
        "nombre": "Parcela Norte",
        "municipio": {
          "id": 1,
          "nombre": "Guadalajara"
        },
        "ubicacion": {
          "type": "Point",
          "coordinates": [-103.3494, 20.6597]
        },
        "elevacion": 1566.0,
        "area_hectareas": 25.5,
        "tipo_riego": "Por goteo",
        "ciclos_count": 8
      }
    ]
  }
}
```

#### Create New Plot

```http
POST /api/v1/terrenos/
Content-Type: application/json

{
  "nombre": "Parcela Sur",
  "municipio_id": 1,
  "ubicacion": {
    "type": "Point",
    "coordinates": [-103.3494, 20.6597]
  },
  "elevacion": 1550.0,
  "area_hectareas": 30.0,
  "tipo_riego": "Por aspersión"
}
```

**Response**: 201 Created with created object

#### Get Plot Details

```http
GET /api/v1/terrenos/{id}/
```

#### Get Cycles for Plot

```http
GET /api/v1/terrenos/{id}/ciclos/
```

---

## Agricultural Endpoints

### Hibridos (Corn Hybrids)

#### List All Hybrids

```http
GET /api/v1/hibridos/
```

**Query Parameters**:
- `marca` (string): Filter by brand
- `search` (string): Search by name

**Response**:
```json
{
  "status": "success",
  "data": {
    "results": [
      {
        "id": 1,
        "marca": "Pioneer",
        "nombre": "P1234",
        "caracteristicas": {
          "ciclo_dias": 120,
          "altura_planta": 2.5,
          "resistencia_sequia": "Alta",
          "potencial_rendimiento": "Alto"
        },
        "ciclos_count": 45,
        "avg_yield": 17.2
      }
    ]
  }
}
```

#### Get Hybrid Details

```http
GET /api/v1/hibridos/{id}/
```

**Response**:
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "marca": "Pioneer",
    "nombre": "P1234",
    "caracteristicas": {
      "ciclo_dias": 120,
      "altura_planta": 2.5,
      "resistencia_sequia": "Alta"
    },
    "performance_stats": {
      "avg_yield": 17.2,
      "min_yield": 12.5,
      "max_yield": 22.1,
      "std_dev": 2.3
    },
    "best_regions": [
      {
        "estado": "Jalisco",
        "avg_yield": 18.5
      }
    ]
  }
}
```

### Ciclos (Growing Cycles)

#### List All Cycles

```http
GET /api/v1/ciclos/
```

**Query Parameters**:
- `terreno` (integer): Filter by plot ID
- `hibrido` (integer): Filter by hybrid ID
- `año` (integer): Filter by year
- `min_yield` (float): Minimum yield
- `max_yield` (float): Maximum yield
- `ordering` (string): Sort field (e.g., `-rendimiento_materia_seca`)

**Response**:
```json
{
  "status": "success",
  "data": {
    "results": [
      {
        "id": 1,
        "terreno": {
          "id": 1,
          "nombre": "Parcela Norte"
        },
        "hibrido": {
          "id": 1,
          "marca": "Pioneer",
          "nombre": "P1234"
        },
        "año": 2025,
        "fecha_siembra": "2025-04-15",
        "fecha_cosecha": "2025-09-10",
        "dias_siembra_cosecha": 148,
        "rendimiento_materia_seca": 16.8,
        "contenido_materia_seca": 35.2,
        "proteina_cruda": 8.5,
        "digestibilidad_24h": 72.3,
        "prediccion_ml_rendimiento": 17.2,
        "confianza_prediccion": 0.89
      }
    ]
  }
}
```

#### Create New Cycle

```http
POST /api/v1/ciclos/
Content-Type: application/json

{
  "terreno_id": 1,
  "hibrido_id": 1,
  "año": 2026,
  "fecha_siembra": "2026-04-20",
  "fecha_cosecha": "2026-09-15",
  "semillas_por_hectarea": 75000,
  "tipo_riego": "Por goteo"
}
```

#### Get Cycle Details

```http
GET /api/v1/ciclos/{id}/
```

**Response**: Full cycle data with all 50+ variables

#### Update Cycle

```http
PATCH /api/v1/ciclos/{id}/
Content-Type: application/json

{
  "rendimiento_materia_seca": 17.5,
  "contenido_materia_seca": 36.0
}
```

---

## Prediction Endpoints

### Predict Yield

```http
POST /api/v1/ciclos/predict_yield/
Content-Type: application/json

{
  "terreno_id": 1,
  "hibrido_id": 2,
  "fecha_siembra": "2026-04-15",
  "condiciones_esperadas": {
    "temp_media_ciclo": 22.5,
    "temp_max_ciclo": 32.0,
    "temp_min_ciclo": 12.0,
    "precipitacion_ciclo": 450,
    "radiacion_solar": 18.5,
    "dias_siembra_cosecha": 145
  }
}
```

**Response**:
```json
{
  "status": "success",
  "data": {
    "prediction": {
      "rendimiento_materia_seca": 18.5,
      "confidence_interval": {
        "lower": 17.2,
        "upper": 19.8
      },
      "confidence_score": 0.92,
      "prediction_date": "2026-06-17T19:00:00Z"
    },
    "quality_predictions": {
      "proteina_cruda": 8.7,
      "fibra_detergente": 42.3,
      "digestibilidad_24h": 73.5,
      "contenido_materia_seca": 35.8
    },
    "feature_importance": [
      {
        "feature": "temp_media_ciclo",
        "importance": 0.25,
        "value": 22.5
      },
      {
        "feature": "precipitacion_ciclo",
        "importance": 0.22,
        "value": 450
      },
      {
        "feature": "radiacion_solar",
        "importance": 0.18,
        "value": 18.5
      }
    ],
    "similar_cycles": [
      {
        "id": 45,
        "similarity_score": 0.95,
        "actual_yield": 18.2,
        "año": 2025
      },
      {
        "id": 78,
        "similarity_score": 0.91,
        "actual_yield": 18.8,
        "año": 2024
      }
    ],
    "risk_factors": [
      {
        "factor": "heat_stress",
        "level": "low",
        "description": "Temperature within optimal range"
      }
    ]
  }
}
```

### Batch Predictions

```http
POST /api/v1/ciclos/batch_predict/
Content-Type: application/json

{
  "predictions": [
    {
      "terreno_id": 1,
      "hibrido_id": 2,
      "condiciones_esperadas": {...}
    },
    {
      "terreno_id": 2,
      "hibrido_id": 3,
      "condiciones_esperadas": {...}
    }
  ]
}
```

### Get Feature Importance

```http
GET /api/v1/ml/feature_importance/
```

**Response**:
```json
{
  "status": "success",
  "data": {
    "global_importance": [
      {
        "feature": "temp_media_ciclo",
        "importance": 0.25,
        "description": "Average temperature during growing season"
      },
      {
        "feature": "precipitacion_ciclo",
        "importance": 0.22,
        "description": "Total precipitation during growing season"
      }
    ],
    "model_version": "1.0.0",
    "training_date": "2026-06-01T00:00:00Z"
  }
}
```

---

## Recommendation Endpoints

### Recommend Hybrid

```http
POST /api/v1/recommendations/recommend_hybrid/
Content-Type: application/json

{
  "terreno_id": 1,
  "fecha_siembra_objetivo": "2026-05-01",
  "objetivos": ["max_rendimiento", "alta_proteina"],
  "restricciones": {
    "presupuesto_max": 5000,
    "disponibilidad_riego": "limitada"
  }
}
```

**Response**:
```json
{
  "status": "success",
  "data": {
    "recommendations": [
      {
        "rank": 1,
        "hibrido": {
          "id": 2,
          "marca": "Pioneer",
          "nombre": "P1234"
        },
        "predicted_yield": 18.5,
        "predicted_protein": 8.9,
        "confidence": 0.91,
        "score": 95.2,
        "reasoning": [
          "Excellent performance in similar conditions",
          "High protein content matches objectives",
          "Drought resistant - suitable for limited irrigation"
        ],
        "estimated_cost": 4200,
        "risk_level": "low"
      },
      {
        "rank": 2,
        "hibrido": {
          "id": 5,
          "marca": "Dekalb",
          "nombre": "DK5678"
        },
        "predicted_yield": 18.2,
        "predicted_protein": 8.7,
        "confidence": 0.88,
        "score": 92.5,
        "reasoning": [
          "Consistent performance in region",
          "Good protein content"
        ],
        "estimated_cost": 3800,
        "risk_level": "low"
      }
    ],
    "analysis": {
      "total_evaluated": 15,
      "top_factor": "temperature_suitability",
      "recommendation_date": "2026-06-17T19:00:00Z"
    }
  }
}
```

### Optimize Planting Date

```http
POST /api/v1/recommendations/optimize_planting_date/
Content-Type: application/json

{
  "terreno_id": 1,
  "hibrido_id": 2,
  "fecha_inicio": "2026-04-01",
  "fecha_fin": "2026-06-30"
}
```

**Response**:
```json
{
  "status": "success",
  "data": {
    "optimal_window": {
      "start_date": "2026-04-15",
      "end_date": "2026-04-30",
      "predicted_yield": 18.7,
      "confidence": 0.93
    },
    "alternative_windows": [
      {
        "start_date": "2026-05-01",
        "end_date": "2026-05-15",
        "predicted_yield": 17.9,
        "confidence": 0.89
      }
    ],
    "factors": {
      "temperature_optimal": true,
      "precipitation_forecast": "favorable",
      "frost_risk": "none",
      "heat_stress_risk": "low"
    },
    "weather_forecast": {
      "avg_temp": 22.0,
      "total_precip": 480,
      "confidence": "medium"
    }
  }
}
```

### Find Similar Conditions

```http
GET /api/v1/recommendations/similar_conditions/?ciclo_id=1&limit=10
```

**Response**:
```json
{
  "status": "success",
  "data": {
    "reference_cycle": {
      "id": 1,
      "año": 2025,
      "rendimiento_materia_seca": 16.8
    },
    "similar_cycles": [
      {
        "id": 45,
        "similarity_score": 0.95,
        "año": 2024,
        "terreno": "Parcela Este",
        "rendimiento_materia_seca": 17.2,
        "key_similarities": [
          "Temperature profile",
          "Precipitation pattern",
          "Soil type"
        ]
      }
    ],
    "similarity_metrics": {
      "method": "cosine_similarity",
      "features_used": 25
    }
  }
}
```

---

## Leafmap Endpoints

### Get Production Zones

```http
GET /api/v1/geo/production_zones/?hibrido_id=1&variable=rendimiento_materia_seca
```

**Response**:
```json
{
  "status": "success",
  "data": {
    "type": "FeatureCollection",
    "features": [
      {
        "type": "Feature",
        "geometry": {
          "type": "Polygon",
          "coordinates": [[[...]]]
        },
        "properties": {
          "zone_id": 1,
          "zone_name": "High Production Zone",
          "avg_yield": 19.5,
          "cycle_count": 45,
          "characteristics": {
            "elevation_range": [1500, 1700],
            "temp_range": [20, 24],
            "optimal_for": ["P1234", "DK5678"]
          }
        }
      }
    ],
    "analysis": {
      "total_zones": 5,
      "clustering_method": "kmeans",
      "n_clusters": 5
    }
  }
}
```

### Spatial Interpolation

```http
POST /api/v1/geo/interpolate/
Content-Type: application/json

{
  "variable": "rendimiento_materia_seca",
  "bounds": {
    "min_lat": 20.0,
    "max_lat": 21.0,
    "min_lon": -104.0,
    "max_lon": -103.0
  },
  "resolution": 0.01,
  "method": "kriging"
}
```

**Response**:
```json
{
  "status": "success",
  "data": {
    "type": "FeatureCollection",
    "features": [
      {
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": [-103.5, 20.5]
        },
        "properties": {
          "interpolated_value": 17.8,
          "variance": 1.2
        }
      }
    ],
    "metadata": {
      "method": "ordinary_kriging",
      "variogram_model": "spherical",
      "points_used": 150
    }
  }
}
```

### Hotspot Analysis

```http
GET /api/v1/geo/hotspots/?variable=rendimiento_materia_seca&confidence=0.95
```

**Response**:
```json
{
  "status": "success",
  "data": {
    "type": "FeatureCollection",
    "features": [
      {
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": [-103.3494, 20.6597]
        },
        "properties": {
          "hotspot_type": "high",
          "z_score": 2.58,
          "p_value": 0.01,
          "significance": "99%",
          "avg_value": 19.2
        }
      }
    ],
    "statistics": {
      "hot_spots": 12,
      "cold_spots": 8,
      "method": "getis_ord_gi_star"
    }
  }
}
```

### Spatial Autocorrelation

```http
GET /api/v1/geo/spatial_autocorrelation/?variable=rendimiento_materia_seca
```

**Response**:
```json
{
  "status": "success",
  "data": {
    "morans_i": {
      "I": 0.65,
      "p_value": 0.001,
      "z_score": 3.45,
      "interpretation": "Strong positive spatial autocorrelation"
    },
    "local_indicators": [
      {
        "location_id": 1,
        "local_i": 0.72,
        "cluster_type": "HH",
        "significance": 0.01
      }
    ]
  }
}
```

---

## Weather Endpoints

### Get Historical Weather

```http
GET /api/v1/weather/historical/?terreno_id=1&start_date=2025-01-01&end_date=2025-12-31
```

**Response**:
```json
{
  "status": "success",
  "data": {
    "terreno": {
      "id": 1,
      "nombre": "Parcela Norte"
    },
    "records": [
      {
        "fecha": "2025-01-01",
        "temperatura_max": 25.5,
        "temperatura_min": 12.3,
        "temperatura_media": 18.9,
        "precipitacion": 0.0,
        "radiacion_solar": 15.2,
        "humedad": 65,
        "velocidad_viento": 12.5
      }
    ],
    "summary": {
      "total_days": 365,
      "avg_temp": 21.5,
      "total_precip": 850.5,
      "avg_radiation": 17.8
    }
  }
}
```

### Get Weather Forecast

```http
GET /api/v1/weather/forecast/?lat=20.6597&lon=-103.3494&days=14
```

**Response**:
```json
{
  "status": "success",
  "data": {
    "location": {
      "lat": 20.6597,
      "lon": -103.3494
    },
    "forecast": [
      {
        "date": "2026-06-18",
        "temp_max": 28.0,
        "temp_min": 16.0,
        "precipitation_prob": 20,
        "precipitation_mm": 2.5,
        "conditions": "Partly cloudy"
      }
    ],
    "source": "OpenMeteo",
    "generated_at": "2026-06-17T19:00:00Z"
  }
}
```

---

## Rate Limiting

### Current Limits (Development)

No rate limiting in development mode.

### Planned Limits (Production)

| Endpoint Type | Requests per Minute | Requests per Hour |
|---------------|---------------------|-------------------|
| Read (GET) | 100 | 5000 |
| Write (POST/PUT/PATCH) | 30 | 1000 |
| ML Predictions | 20 | 500 |
| Leafmap Analysis | 10 | 200 |

### Rate Limit Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1687024800
```

### Rate Limit Exceeded Response

```json
{
  "status": "error",
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Please try again later.",
    "retry_after": 60
  }
}
```

---

## Pagination

### Query Parameters

- `page` (integer): Page number (default: 1)
- `page_size` (integer): Items per page (default: 20, max: 100)

### Example

```http
GET /api/v1/ciclos/?page=2&page_size=50
```

### Response Headers

```http
Link: <http://localhost:8000/api/v1/ciclos/?page=3>; rel="next",
      <http://localhost:8000/api/v1/ciclos/?page=1>; rel="prev"
```

---

## Filtering and Sorting

### Filtering

Use query parameters matching field names:

```http
GET /api/v1/ciclos/?año=2025&hibrido_id=1&min_yield=15.0
```

### Sorting

Use `ordering` parameter:

```http
GET /api/v1/ciclos/?ordering=-rendimiento_materia_seca
```

Multiple fields:
```http
GET /api/v1/ciclos/?ordering=-año,rendimiento_materia_seca
```

### Search

Use `search` parameter:

```http
GET /api/v1/hibridos/?search=Pioneer
```

---

## Webhooks (Planned)

### Register Webhook

```http
POST /api/v1/webhooks/
Content-Type: application/json

{
  "url": "https://your-app.com/webhook",
  "events": ["prediction.completed", "cycle.created"],
  "secret": "your_webhook_secret"
}
```

### Webhook Events

- `prediction.completed`: ML prediction finished
- `cycle.created`: New growing cycle created
- `cycle.updated`: Cycle data updated
- `analysis.completed`: Leafmap analysis finished

---

## SDK Examples

### Python

```python
import requests

BASE_URL = "http://localhost:8000/api/v1"

# Get all cycles
response = requests.get(f"{BASE_URL}/ciclos/")
cycles = response.json()

# Predict yield
prediction_data = {
    "terreno_id": 1,
    "hibrido_id": 2,
    "fecha_siembra": "2026-04-15",
    "condiciones_esperadas": {
        "temp_media_ciclo": 22.5,
        "precipitacion_ciclo": 450
    }
}
response = requests.post(
    f"{BASE_URL}/ciclos/predict_yield/",
    json=prediction_data
)
prediction = response.json()
```

### JavaScript/TypeScript

```typescript
const BASE_URL = 'http://localhost:8000/api/v1';

// Get all cycles
const cycles = await fetch(`${BASE_URL}/ciclos/`)
  .then(r => r.json());

// Predict yield
const predictionData = {
  terreno_id: 1,
  hibrido_id: 2,
  fecha_siembra: '2026-04-15',
  condiciones_esperadas: {
    temp_media_ciclo: 22.5,
    precipitacion_ciclo: 450
  }
};

const prediction = await fetch(`${BASE_URL}/ciclos/predict_yield/`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(predictionData)
}).then(r => r.json());
```

---

## Changelog

### Version 1.0 (Current)

- Initial API release
- Basic CRUD operations
- ML prediction endpoints (planned)
- Leafmap analysis endpoints (planned)
- Weather integration (planned)

---

## Support

For API support:

1. Check this documentation
2. Review [ARCHITECTURE.md](ARCHITECTURE.md) for system design
3. See [SETUP_GUIDE.md](SETUP_GUIDE.md) for configuration
4. Contact development team

---

**API Version**: 1.0  
**Last Updated**: June 2026  
**Status**: Active Development