# CropAnalytics - Comprehensive Project Structure Analysis

## Executive Summary

**CropAnalytics** is a sophisticated business intelligence platform for crop and milk production optimization, implementing the **Wisconsin MILK2024** scientific model. The system combines geospatial analysis, nutritional science, and economic modeling to provide data-driven recommendations for corn silage production and dairy farming.

---

## 1. Technology Stack

### Backend (Django 6.0.2)
- **Framework**: Django REST Framework with PostGIS spatial database
- **Database**: PostgreSQL 16 with PostGIS 3.4 extension
- **Authentication**: JWT (djangorestframework-simplejwt) + Google OAuth
- **Key Libraries**:
  - `djangorestframework-gis` - Geospatial API support
  - `psycopg2-binary` - PostgreSQL adapter
  - `dj-database-url` - Database configuration
  - `django-cors-headers` - CORS handling
  - `django-allauth` - Social authentication

### Frontend (Angular 21)
- **Framework**: Angular 21 with standalone components
- **UI**: Tailwind CSS 4.1.12
- **Visualization**: 
  - Plotly.js for interactive charts
  - Chart.js with ng2-charts
  - chartjs-plugin-annotation
- **Key Features**:
  - Reactive forms with signals
  - Route guards for role-based access
  - JWT interceptors
  - PDF export (jsPDF + jspdf-autotable)
  - HTML to image conversion

### Infrastructure
- **Containerization**: Docker Compose
- **Services**:
  - PostgreSQL/PostGIS database (port 5432)
  - pgAdmin 4 (port 5050)
- **Development**: Hot-reload for both frontend and backend

---

## 2. Database Schema & Data Model

### Core Entities

#### Geographic Hierarchy
```
Estado (State)
  └── Municipio (Municipality)
        └── Terreno (Field/Plot)
              ├── ubicacion_geo: PointField (PostGIS)
              ├── latitud_gps, longitud_gps
              └── altitud
```

#### Agricultural Data
```
Hibrido (Hybrid)
  ├── marca (Brand)
  └── nombre (Name)

Ciclo (Growth Cycle)
  ├── terreno: FK → Terreno
  ├── hibrido: FK → Hibrido
  ├── year, fecha_siembra, fecha_cosecha
  ├── condicion: ['Riego', 'Temporal']
  ├── laboratorio: OneToOne → ResultadoLaboratorio
  └── clima: OneToOne → DatoClimatico
```

#### Laboratory Results (ResultadoLaboratorio)
**Nutritional Composition Variables** (from provided image):
- **Materia Seca (MS)**: Dry matter percentage
- **Proteína Cruda (PC)**: Crude protein
- **Grasa Cruda (GC)**: Crude fat/ether extract
- **Cenizas (CEN)**: Ash content
- **Fibra Detergente Neutro (FDN)**: Neutral detergent fiber
- **Carbohidratos No Fibrosos (CNF)**: Non-fiber carbohydrates
- **Rendimiento Materia Seca (RMS)**: Dry matter yield (t/ha)
- **Rendimiento Materia Fresca (RMF)**: Fresh matter yield
- **Porcentaje Plantas Emergidas (PEM)**: Emergence percentage
- **Porcentaje Floración Femenina (PFF)**: Female flowering percentage
- **Días Floración Femenina (DFF)**: Days to female flowering
- **Unidades Calor Acumuladas (UCAFF)**: Accumulated heat units
- **Número Plantas Cosechadas (NPC)**: Number of harvested plants
- **Porcentaje Plantas Cosechadas (PPC)**: Harvest percentage
- **Metodología**: ['Química Húmeda', 'NIRS']

#### Climate Data (DatoClimatico)
**Environmental Variables** (from provided image):
- **DCO**: Days from sowing to harvest
- **PP_anual, PP_co**: Annual and cycle precipitation (mm)
- **TM_anual, TM_co**: Mean annual and cycle temperature (°C)
- **TMax_anual, TMax_co**: Maximum temperatures
- **TMin_anual, TMin_co**: Minimum temperatures
- **UCA_CO**: Accumulated heat units during cycle
- **Horas_calor_30**: Hours above 30°C
- **Horas_frio_5**: Hours below 5°C
- **GHI**: Global horizontal irradiance (MJ/m²)
- **SS**: Sunshine hours

#### User Management (UsuarioCustom)
- **Roles**: SADMIN, JEFE (Manager), INVESTIGADOR (Researcher)
- **Providers**: Local, Google OAuth
- **Permissions**: Role-based access control

---

## 3. Core Features & Modules

### A. MILK2024 Calculator (`backend/api/utils/milk_calculator.py`)

**Wisconsin MILK2024 Model Implementation**:
- Calculates milk production potential from corn silage nutritional composition
- **Inputs**: MS, CP, EE, Ash, NDF, Starch, NDFD, uNDF240, Starch_d
- **Process**:
  1. Calculate digestible fractions (FA, ROM, CP, Starch, NDF)
  2. Compute TDN (Total Digestible Nutrients)
  3. Calculate DE (Digestible Energy) and NEL (Net Energy Lactation)
  4. Estimate milk production per ton and per hectare

**Confidence Scoring System** (`calcular_factor_confianza`):
- **Base Score**: 100%
- **Penalties**:
  - Missing critical data: -10% per field
  - MS out of range (28-45%): -8%
  - CP out of range (6-12%): -7%
  - NDF out of range (30-55%): -7%
  - Starch out of range (25-40%): -6%
  - Energy coherence issues: -5%
- **Confidence Levels**:
  - Excelente: 85-100%
  - Buena: 70-84%
  - Moderada: 50-69%
  - Baja: <50%

### B. Economic Analysis (`calcular_valor_ensilaje`)

**Three Producer Scenarios**:

1. **Scenario 1: Sell Ensilaje**
   - Income from silage sales
   - Production and transport costs
   - Net profit and ROI

2. **Scenario 2: Own Production for Dairy**
   - Milk value from own silage
   - Total production costs
   - Implicit silage value

3. **Scenario 3: Buy Ensilaje**
   - Purchase costs
   - Recommended maximum price
   - Profitability analysis

**Automatic Recommendation**: System selects most profitable option

### C. Location-Based Recommendations (`backend/api/utils/location_recommender.py`)

**Geospatial Weighting System**:
- **Local Performance (40%)**: Historical data from same municipality
- **Regional Performance (30%)**: Data from same state
- **Climate Similarity (20%)**: Based on latitude/altitude classification
- **Altitude Compatibility (10%)**: Elevation-based adjustment

**Confidence Adjustment**:
- **+15%**: Abundant local data (≥10 samples)
- **+10%**: Good local data (5-9 samples)
- **+5%**: Some local data (3-4 samples)
- **0%**: Limited data (1-2 samples)
- **-5%**: No local data, regional only
- **-10%**: No regional data

**Regional Relevance Levels**:
- **Muy Alta**: 90-100% (Excellent local history)
- **Alta**: 75-89% (Strong regional presence)
- **Media-Alta**: 60-74% (Good regional data)
- **Media**: 45-59% (Moderate evidence)
- **Media-Baja**: 30-44% (Limited data)
- **Baja**: <30% (Insufficient data)

### D. Geospatial Estimator (`backend/api/utils/geospatial_estimator.py`)

**Functions**:
- `calcular_distancia_haversine()`: Calculate geographic distance
- `clasificar_zona_climatica()`: Climate zone classification
- `estimar_ajuste_regional()`: Regional yield adjustments

**Climate Zones** (Mexico-specific):
- **Tropical** (<18°N): Factor 0.92
- **Subtropical** (18-24°N): Factor 1.00 (optimal)
- **Templada** (24-28°N): Factor 1.05
- **Templada-Fría** (>28°N): Factor 0.95

**Altitude Zones**:
- **Tierras bajas** (<500m): Factor 0.95
- **Tierras medias** (500-1500m): Factor 1.05 (optimal for corn)
- **Tierras altas** (1500-2500m): Factor 1.00
- **Tierras muy altas** (>2500m): Factor 0.90

---

## 4. Frontend Architecture

### Route Structure
```
/ (Home)
├── /auth (Authentication)
│   ├── /login
│   └── /register
├── /dashboard (Calculator - Public)
├── /dashboard-jefe (Manager Dashboard)
├── /dashboard-investigador (Researcher Dashboard)
├── /analytics (Data Analysis)
├── /calculator (MILK2024 Calculator)
├── /captura
│   ├── /jefe (Manager Data Entry)
│   └── /investigador (Researcher Data Entry)
├── /users-management (User Administration)
└── /about
```

### Key Components

#### Calculator Component (`frontend/src/app/calculator/`)
**Features**:
- Hybrid optimization with location filtering
- MILK2024 milk production estimation
- Confidence level display with color-coded badges
- Economic scenario comparison (3 tabs)
- Location selector (Estado/Municipio dropdowns)
- Regional relevance scoring
- Comparison mode (2 hybrids side-by-side)
- Detailed view with complete metrics

**Form Fields**:
- `regimen_hidrico`: ['Riego', 'Temporal']
- `estado_id`, `municipio_id`: Location selection
- `hectareas`: Farm size
- `precio_leche`: Milk price (MXN/L)
- `precio_ensilaje`: Silage price (MXN/ton)
- `costo_produccion`: Production cost (MXN/ha)
- `costo_transporte`: Transport cost (MXN/ton)

#### Analytics Component (`frontend/src/app/analytics/`)
**Advanced Data Exploration**:
- Multi-level filtering (Location, Year, Brand, Condition)
- Hierarchical accordion view (Brand → Hybrid → Cycles)
- Search functionality
- Bulk selection and comparison
- Statistical aggregation
- Interactive charts (Plotly.js)
- PDF export capability

**Computed Signals**:
- `filteredCiclos`: Reactive filtering
- `groupedHierarchy`: Brand/Hybrid grouping
- `hibridosSeleccionados`: Selected hybrids with averages
- `estadoMunicipioOptions`: Location filter options

#### Upload Components
- **Jefe Component**: Manager data entry with full permissions
- **Investigador Component**: Researcher data entry with restrictions

#### User Management
- User CRUD operations
- Role assignment (JEFE/INVESTIGADOR)
- Account activation/deactivation
- Search and filtering

---

## 5. API Endpoints

### Authentication
```
POST /api/register/          - User registration
POST /api/login/             - Local login
POST /api/google-login/      - Google OAuth
POST /api/logout/            - Logout
GET  /api/me/                - Current user info
```

### Geographic Data
```
GET  /api/estados/           - List all states
GET  /api/municipios/        - List municipalities
     ?estado_id={id}         - Filter by state
GET  /api/terrenos/          - List fields (GeoJSON)
```

### Agricultural Data
```
GET  /api/ciclos/            - List growth cycles
     ?hibrido={id}           - Filter by hybrid
     ?terreno={id}           - Filter by field
     ?year={year}            - Filter by year
```

### Calculator & Optimization
```
POST /api/calcular-productor/  - Calculate milk production
     Body: {
       regimen_hidrico, hectareas,
       precio_leche, precio_ensilaje,
       costo_produccion, costo_transporte,
       laboratorio_data: {ms, cp, gc, cen, fdn, cnf, rms}
     }
     Returns: {
       milk_production, confidence, economic_scenarios
     }

POST /api/optimizar-semilla/   - Optimize hybrid selection
     Body: {
       regimen_hidrico, hectareas,
       estado_id, municipio_id,  // Optional location
       precio_leche, precio_ensilaje,
       costo_produccion, costo_transporte
     }
     Returns: [
       {
         hibrido, ranking_score,
         milk_production, confidence,
         relevancia_regional,  // If location provided
         economic_scenarios
       }
     ]
```

### User Administration
```
GET    /api/users/          - List users (JEFE/SADMIN)
PATCH  /api/users/{id}/     - Update user
DELETE /api/users/{id}/     - Delete user
POST   /api/users/{id}/update-role/  - Change role
POST   /api/users/{id}/toggle-active/ - Activate/deactivate
```

---

## 6. Data Flow & Processing Pipeline

### Hybrid Optimization Flow
```
1. User Input
   ├── Location (Estado/Municipio) [Optional]
   ├── Irrigation regime
   ├── Economic parameters
   └── Farm size

2. Backend Processing
   ├── Query all hybrids
   ├── For each hybrid:
   │   ├── Get historical cycles
   │   ├── Calculate average nutritional values
   │   ├── Run MILK2024 model
   │   ├── Calculate confidence score
   │   ├── If location provided:
   │   │   ├── Calculate regional relevance
   │   │   └── Adjust confidence by location
   │   └── Run economic analysis (3 scenarios)
   ├── Rank hybrids by combined score:
   │   └── (Production Potential × 0.7) + (Regional Relevance × 0.3)
   └── Return top recommendations

3. Frontend Display
   ├── Comparison view (top 2 hybrids)
   ├── Detailed view (selected hybrid)
   ├── Confidence badges
   ├── Regional relevance indicators
   └── Economic scenario tabs
```

### Data Loading Pipeline
```
CSV Files → Django Management Command → Database
  ├── Estados.csv → Estado model
  ├── Municipios.csv → Municipio model
  ├── Terrenos.csv → Terreno model (with PostGIS Point)
  ├── Hibridos.csv → Hibrido model
  ├── Ciclos.csv → Ciclo model
  ├── Laboratorio.csv → ResultadoLaboratorio model
  └── OpenMeteo.csv → DatoClimatico model
```

---

## 7. Security & Permissions

### Role-Based Access Control

| Feature | SADMIN | JEFE | INVESTIGADOR | Public |
|---------|--------|------|--------------|--------|
| View Calculator | ✓ | ✓ | ✓ | ✓ |
| View Analytics | ✓ | ✓ | ✓ | ✗ |
| Upload Data (Jefe) | ✓ | ✓ | ✗ | ✗ |
| Upload Data (Investigador) | ✓ | ✓ | ✓ | ✗ |
| User Management | ✓ | ✓ | ✗ | ✗ |
| System Configuration | ✓ | ✗ | ✗ | ✗ |

### Authentication Flow
1. **Local**: Email/password with JWT tokens
2. **Google OAuth**: Social login with automatic account creation
3. **Token Refresh**: Automatic token renewal
4. **Route Guards**: Frontend protection with role checking
5. **JWT Interceptor**: Automatic token injection in API calls

---

## 8. Key Algorithms & Calculations

### Wisconsin MILK2024 Model
```python
# Digestible Fractions
d_fa = (ee - 1.0) * 0.73
d_rom = (100 - ash - ndf - starch - fa - cp) * 0.91
d_cp = cp * 0.70
d_starch = starch * (starch_d / 100)
d_ndf = ndf * (ndfd / 100) + remaining_fiber * 0.10

# Energy Calculation
tdn = d_cp + d_rom + (d_fa * 2.25) + d_starch + d_ndf
de = (tdn / 100) * 4.409  # Mcal/kg
nel = (0.703 * de) - 0.19  # Mcal/kg

# Milk Production
milk_per_ton = (nel * 311.4) + 120.0  # liters/ton DM
milk_per_ha = milk_per_ton * rms  # liters/ha
```

### Regional Relevance Score
```python
score = (
    local_performance * 0.40 +
    regional_performance * 0.30 +
    climate_similarity * 0.20 +
    altitude_compatibility * 0.10
)

confidence_adjustment = f(local_samples, regional_samples)
adjusted_confidence = base_confidence + confidence_adjustment
```

### Economic ROI
```python
# Scenario 1: Sell Silage
roi = ((income - costs) / costs) * 100

# Scenario 2: Own Production
implicit_value = milk_value / silage_tons

# Scenario 3: Buy Silage
max_price = (milk_value - other_costs) / silage_tons
```

---

## 9. Data Sources & Variables

### Laboratory Analysis Variables (from image)
The system tracks **40+ variables** across multiple categories:

**Phenological Data**:
- Año, Ubicación, Metros sobre nivel del mar
- Riego/Temporal, Marca, Híbrido
- Fecha Inicio Siembra, Fecha Cosecha
- Días de Siembra a Cosecha (DCO)

**Climate Variables**:
- Precipitation (annual, cycle)
- Temperature (mean, max, min - annual and cycle)
- Heat units, cold hours, hot hours
- Solar radiation (GHI), sunshine hours

**Plant Development**:
- Emergence percentage (PEM)
- Flowering metrics (PFF, DFF, UCAFF)
- Harvest metrics (NPC, PPC)

**Nutritional Composition**:
- Dry matter (MS), Moisture (MS%)
- Crude protein (PC), Fat (GC), Ash (CEN)
- Fiber fractions (FDN, CNF)
- Yields (RMF, RMS, RCEN, RGC, RPC, RFDN, RCNF)

**Digestibility**:
- In situ digestibility (24h, 30h, 48h)
- Stem health (ST 0-3 scale)

---

## 10. Recent Enhancements

### Phase 1: Confidence & Pricing (Completed)
- ✅ MILK2024 confidence scoring system
- ✅ Three-scenario economic analysis
- ✅ Frontend confidence badges
- ✅ Economic comparison tabs

### Phase 2: Location-Based Recommendations (Completed)
- ✅ Estado/Municipio selector
- ✅ Geospatial weighting algorithm
- ✅ Regional relevance scoring
- ✅ Location-adjusted confidence
- ✅ Distance-based performance weighting
- ✅ Frontend relevance indicators

### Documentation Created
- `ML_ENHANCEMENT_PLAN.md` - 24-week ML roadmap
- `CONFIDENCE_AND_PRICING_FEATURES.md` - Confidence system guide
- `GEOSPATIAL_CONFIDENCE_ENHANCEMENTS.md` - Geospatial features
- `LOCATION_BASED_RECOMMENDATIONS_IMPLEMENTATION.md` - Location system

---

## 11. Future Enhancement Roadmap

### Planned ML Integration (24-week plan)

**Phase 1: Foundation (Weeks 1-4)**
- Data quality assessment
- KPI framework definition
- Feature engineering pipeline
- Baseline model establishment

**Phase 2: Geo-Spatial Features (Weeks 5-8)**
- Spatial autocorrelation analysis
- Climate zone clustering
- Soil type integration
- Elevation-based features

**Phase 3: SVM Prediction Models (Weeks 9-12)**
- Yield prediction (RMS)
- Quality prediction (MS, CP, NDF)
- Multi-output regression
- Hyperparameter optimization

**Phase 4: GeoAI Integration (Weeks 13-16)**
- Satellite imagery integration
- NDVI time series analysis
- Weather forecast integration
- Real-time monitoring

**Phase 5: Advanced Features (Weeks 17-20)**
- Ensemble models (SVM + Random Forest + XGBoost)
- Time series forecasting
- Anomaly detection
- Risk assessment

**Phase 6: Production & Optimization (Weeks 21-24)**
- Model deployment
- A/B testing framework
- Performance monitoring
- Continuous learning pipeline

---

## 12. Technical Debt & Considerations

### Current Limitations
1. **Data Dependency**: Requires complete laboratory analysis
2. **Static Models**: No real-time learning yet
3. **Limited Validation**: Confidence based on data completeness, not prediction accuracy
4. **Manual Data Entry**: No automated data ingestion
5. **Single Crop Focus**: Currently corn silage only

### Scalability Considerations
1. **Database**: PostGIS handles spatial queries efficiently
2. **API**: REST architecture allows horizontal scaling
3. **Frontend**: Angular signals provide reactive performance
4. **Caching**: No caching layer implemented yet
5. **Background Jobs**: No async task queue (Celery recommended)

### Security Considerations
1. **JWT Tokens**: Short-lived access tokens
2. **CORS**: Configured for specific origins
3. **SQL Injection**: Protected by Django ORM
4. **XSS**: Angular sanitization
5. **CSRF**: Django CSRF protection

---

## 13. Development Workflow

### Backend Development
```bash
cd backend
source venv/bin/activate
python manage.py runserver
```

### Frontend Development
```bash
cd frontend
npm start  # Runs on http://localhost:4200
```

### Database Management
```bash
# Start containers
docker-compose up -d

# Load data
python manage.py cargar_datos

# Migrations
python manage.py makemigrations
python manage.py migrate
```

### Testing
- Backend: Django test framework
- Frontend: Vitest (configured but not implemented)

---

## 14. Project Strengths

1. **Scientific Foundation**: Based on peer-reviewed Wisconsin MILK2024 model
2. **Geospatial Intelligence**: PostGIS integration for location-based insights
3. **Economic Analysis**: Multi-scenario profitability assessment
4. **User Experience**: Intuitive Angular interface with reactive updates
5. **Scalable Architecture**: Modular design with clear separation of concerns
6. **Role-Based Security**: Comprehensive permission system
7. **Data Richness**: 40+ variables tracked per growth cycle
8. **Confidence Transparency**: Clear indication of prediction reliability
9. **Location Awareness**: Regional performance weighting
10. **Export Capabilities**: PDF generation for reports

---

## 15. Conclusion

CropAnalytics represents a sophisticated agricultural decision support system that combines:
- **Scientific rigor** (Wisconsin MILK2024 model)
- **Geospatial intelligence** (PostGIS, location-based recommendations)
- **Economic analysis** (multi-scenario profitability)
- **User-friendly interface** (Angular 21 with modern UX)
- **Extensibility** (clear architecture for ML enhancements)

The system is production-ready for corn silage analysis and provides a solid foundation for future enhancements including machine learning, satellite imagery integration, and multi-crop support.

**Current Status**: ✅ Fully operational with location-based recommendations
**Next Steps**: ML integration following the 24-week enhancement plan