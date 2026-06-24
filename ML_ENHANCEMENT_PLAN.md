# CropAnalytics ML Enhancement Plan

## Executive Summary

Transform CropAnalytics from a descriptive analytics tool into a **predictive geo-spatial intelligence platform** using machine learning (SVM, Leafmap) to provide region-specific recommendations and discover hidden correlations in agricultural data.

---

## Current State Analysis

### Strengths
✅ Rich dataset with 40+ variables (climate, soil, yield, nutritional)  
✅ PostGIS spatial database infrastructure  
✅ Wisconsin MILK2024 model for baseline calculations  
✅ Multi-year historical data across regions  

### Limitations
❌ No predictive modeling beyond MILK2024 formula  
❌ No spatial correlation analysis  
❌ No consideration of soil quality, topography, or micro-climate  
❌ Limited KPI tracking for decision-making  
❌ No anomaly detection or pattern recognition  

---

## Implementation Roadmap

### Timeline Overview (24 weeks / 6 months)

**Phase 1: Data Foundation & KPI Framework (Weeks 1-3)**
- Enhanced data models (soil, topography, satellite indices)
- KPI calculation framework
- Data collection protocols

**Phase 2: Geo-Spatial Feature Engineering (Weeks 4-6)**
- Spatial feature extraction using PostGIS
- Satellite data integration (Sentinel-2/Landsat)
- Climate zone analysis

**Phase 3: SVM Prediction Model (Weeks 7-10)**
- Feature engineering pipeline
- SVM model training and optimization
- Model evaluation and validation

**Phase 4: Leafmap Integration (Weeks 11-14)**
- Spatial autocorrelation analysis
- Hotspot identification (LISA)
- Geographically Weighted Regression

**Phase 5: API & Frontend Integration (Weeks 15-18)**
- New prediction endpoints
- Spatial analysis APIs
- Interactive dashboards

**Phase 6: Advanced Features (Weeks 19-24)**
- Ensemble models
- Time series forecasting
- Anomaly detection

---

## Phase 1: Data Foundation & KPI Framework

### New Database Models

Add these models to `backend/api/models.py`:

```python
class DatoSuelo(models.Model):
    """Soil characteristics per plot"""
    terreno = models.OneToOneField(Terreno, on_delete=models.CASCADE, related_name='datosuelo')
    ph = models.FloatField(null=True, blank=True)
    materia_organica = models.FloatField(null=True, blank=True)
    nitrogeno = models.FloatField(null=True, blank=True)
    fosforo = models.FloatField(null=True, blank=True)
    potasio = models.FloatField(null=True, blank=True)
    textura = models.CharField(max_length=50, blank=True, null=True)
    capacidad_retencion_agua = models.FloatField(null=True, blank=True)
    drenaje = models.CharField(max_length=20, blank=True, null=True)

class IndiceSatelital(models.Model):
    """Satellite vegetation indices"""
    ciclo = models.ForeignKey(Ciclo, on_delete=models.CASCADE, related_name='indices_satelitales')
    fecha_captura = models.DateField()
    ndvi = models.FloatField(null=True, blank=True)
    evi = models.FloatField(null=True, blank=True)
    ndwi = models.FloatField(null=True, blank=True)

class PrediccionML(models.Model):
    """ML model predictions"""
    terreno = models.ForeignKey(Terreno, on_delete=models.CASCADE, related_name='predicciones')
    hibrido = models.ForeignKey(Hibrido, on_delete=models.CASCADE, related_name='predicciones')
    modelo_version = models.CharField(max_length=50)
    rendimiento_predicho = models.FloatField()
    confianza = models.FloatField()
    factores_principales = models.JSONField()
    fecha_prediccion = models.DateTimeField(auto_now_add=True)
```

### Core KPIs

**Production KPIs:**
- Yield per hectare (actual vs predicted)
- Milk production potential per hectare
- ROI by hybrid and region

**Efficiency KPIs:**
- Water use efficiency (kg DM / mm rainfall)
- Nutrient use efficiency
- Land productivity index

**Quality KPIs:**
- Nutritional value score
- Digestibility rating
- Consistency index

**Risk KPIs:**
- Climate vulnerability score
- Yield stability index
- Prediction confidence level

---

## Phase 2: Geo-Spatial Feature Engineering

### Spatial Features

Create `backend/api/utils/spatial_features.py`:

```python
from django.contrib.gis.db.models.functions import Distance
from django.contrib.gis.measure import D

class SpatialFeatureExtractor:
    
    @staticmethod
    def calculate_neighbor_influence(terreno, radius_km=50):
        """Get average yield of nearby plots"""
        nearby = Terreno.objects.filter(
            ubicacion_geo__distance_lte=(terreno.ubicacion_geo, D(km=radius_km))
        ).exclude(id=terreno.id)
        
        return Ciclo.objects.filter(
            terreno__in=nearby,
            laboratorio__rms__isnull=False
        ).aggregate(Avg('laboratorio__rms'))['laboratorio__rms__avg']
    
    @staticmethod
    def calculate_elevation_gradient(terreno, radius_km=10):
        """Elevation difference from neighbors"""
        nearby = Terreno.objects.filter(
            ubicacion_geo__distance_lte=(terreno.ubicacion_geo, D(km=radius_km)),
            altitud__isnull=False
        )
        elevations = nearby.aggregate(max_alt=Max('altitud'), min_alt=Min('altitud'))
        return elevations['max_alt'] - elevations['min_alt'] if elevations['max_alt'] else 0
```

---

## Phase 3: SVM Prediction Model

### Feature Engineering

Create `backend/ml/feature_engineering.py`:

```python
class FeatureEngineer:
    
    def create_feature_vector(self, ciclo):
        """Create comprehensive feature vector (47 features)"""
        features = {}
        
        # Climate features (15)
        # Spatial features (10)
        # Soil features (8)
        # Hybrid characteristics (5)
        # Temporal features (6)
        # Management features (3)
        
        return features
```

### SVM Model

Create `backend/ml/models/svm_predictor.py`:

```python
from sklearn.svm import SVR
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline

class SVMYieldPredictor:
    
    def train(self, X, y, optimize=True):
        """Train SVM with hyperparameter optimization"""
        if optimize:
            param_grid = {
                'svr__kernel': ['rbf', 'poly'],
                'svr__C': [0.1, 1, 10, 100],
                'svr__gamma': ['scale', 'auto'],
                'svr__epsilon': [0.01, 0.1, 0.5]
            }
            self.model = GridSearchCV(pipeline, param_grid, cv=5)
        
        self.model.fit(X, y)
        return self
    
    def predict(self, X, return_confidence=True):
        """Predict with confidence intervals"""
        predictions = self.model.predict(X)
        if return_confidence:
            confidence = self._estimate_confidence(X, predictions)
            return predictions, confidence
        return predictions
```

---

## Phase 4: Leafmap Integration

### Spatial Analysis

Create `backend/ml/leafmap/spatial_analysis.py`:

```python
from pysal.lib import weights
from pysal.explore import esda

class SpatialAnalyzer:
    
    def calculate_morans_i(self, terrenos_gdf, variable='yield'):
        """Calculate spatial autocorrelation"""
        w = weights.KNN.from_dataframe(terrenos_gdf, k=8)
        w.transform = 'r'
        moran = esda.Moran(terrenos_gdf[variable], w)
        
        return {
            'I': moran.I,
            'p_value': moran.p_sim,
            'interpretation': 'Clustered' if moran.I > 0 and moran.p_sim < 0.05 else 'Random'
        }
    
    def identify_hotspots(self, terrenos_gdf, variable='yield'):
        """Identify high/low yield clusters (LISA)"""
        w = weights.KNN.from_dataframe(terrenos_gdf, k=8)
        lisa = esda.Moran_Local(terrenos_gdf[variable], w)
        
        terrenos_gdf['cluster_type'] = 'Not Significant'
        terrenos_gdf.loc[lisa.q == 1, 'cluster_type'] = 'High-High'
        terrenos_gdf.loc[lisa.q == 3, 'cluster_type'] = 'Low-Low'
        
        return terrenos_gdf
```

---

## Phase 5: API & Frontend Integration

### New Backend Endpoints

Add to `backend/api/views.py`:

```python
class PredictionView(APIView):
    """ML-based yield prediction"""
    
    def post(self, request):
        model = SVMYieldPredictor.load('backend/ml/models/svm_yield_predictor_latest.pkl')
        features = self.extract_features(request.data)
        prediction, confidence = model.predict([features], return_confidence=True)
        
        return Response({
            'rendimiento_predicho': round(prediction[0], 2),
            'confianza': round(confidence[0], 2),
            'modelo_version': 'SVM_v1.0'
        })

class RecommendationView(APIView):
    """AI-powered hybrid recommendations"""
    
    def post(self, request):
        lat = request.data.get('latitud')
        lon = request.data.get('longitud')
        regimen = request.data.get('regimen_hidrico')
        
        # Predict for all hybrids at this location
        recommendations = []
        for hibrido in Hibrido.objects.all():
            features = self.create_scenario_features(lat, lon, hibrido, regimen)
            yield_pred, confidence = model.predict([features])
            
            recommendations.append({
                'hibrido': hibrido.nombre,
                'rendimiento_esperado': round(yield_pred[0], 2),
                'confianza': round(confidence[0], 2)
            })
        
        recommendations.sort(key=lambda x: x['rendimiento_esperado'], reverse=True)
        return Response({'recomendaciones': recommendations[:10]})
```

### Frontend Components

Create `frontend/src/app/ml-analytics/ml-analytics.component.ts`:

```typescript
@Component({
  selector: 'app-ml-analytics',
  templateUrl: './ml-analytics.component.html'
})
export class MLAnalyticsComponent {
  
  predictionForm = this.fb.group({
    latitud: [null, Validators.required],
    longitud: [null, Validators.required],
    regimen_hidrico: ['Riego']
  });
  
  getPredictions() {
    this.apiService.getMLPredictions(this.predictionForm.value)
      .subscribe(data => {
        this.predictions = data.recomendaciones;
        this.renderPredictionMap(data);
      });
  }
  
  loadSpatialAnalysis() {
    this.apiService.getSpatialAnalysis()
      .subscribe(data => {
        this.renderHotspotMap(data.hotspots);
      });
  }
}
```

---

## Phase 6: Advanced Features

### Ensemble Models

```python
class EnsemblePredictor:
    def __init__(self):
        self.models = {
            'svm': SVMYieldPredictor(),
            'rf': RandomForestPredictor(),
            'xgb': XGBoostPredictor()
        }
    
    def predict(self, X):
        predictions = {name: model.predict(X) for name, model in self.models.items()}
        return np.mean(list(predictions.values()), axis=0)
```

### Time Series Forecasting

```python
from statsmodels.tsa.statespace.sarimax import SARIMAX

class YieldForecaster:
    def forecast_next_season(self, terreno, hibrido, climate_forecast):
        historical = self.get_historical_yields(terreno, hibrido)
        model = SARIMAX(historical['yield'], order=(1,1,1), seasonal_order=(1,1,1,12))
        results = model.fit()
        return results.forecast(steps=1, exog=climate_forecast)
```

### Anomaly Detection

```python
from sklearn.ensemble import IsolationForest

class AnomalyDetector:
    def detect_anomalies(self, ciclos_data):
        X = self.extract_features(ciclos_data)
        clf = IsolationForest(contamination=0.1)
        predictions = clf.fit_predict(X)
        return ciclos_data[predictions == -1]
```

---

## Technology Stack

### Python Dependencies

Add to `requirements.txt`:

```txt
# Machine Learning
scikit-learn==1.3.0
xgboost==2.0.0
lightgbm==4.0.0
tensorflow==2.13.0

# Spatial Analysis
pysal==23.7
geopandas==0.13.2
pykrige==1.7.0
mgwr==2.2.1

# Satellite Data
rasterio==1.3.8
sentinelhub==3.9.0

# Time Series
statsmodels==0.14.0

# Model Explainability
shap==0.42.0

# Utilities
joblib==1.3.0
pandas==2.0.0
numpy==1.24.0
```

### Frontend Dependencies

Add to `package.json`:

```json
{
  "leaflet": "^1.9.4",
  "leaflet-heat": "^0.2.0",
  "@turf/turf": "^6.5.0",
  "d3": "^7.8.5"
}
```

---

## Team Structure

**Required Roles:**
1. **ML Engineer** (1 FTE): Model development, training pipelines
2. **Backend Developer** (1 FTE): Django APIs, database optimization
3. **Frontend Developer** (1 FTE): Angular components, visualization
4. **Data Scientist** (1 FTE): Feature engineering, spatial analysis
5. **DevOps Engineer** (0.5 FTE): Model deployment, monitoring

---

## Success Metrics

### Model Performance
- RMSE < 2.0 t/ha for yield predictions
- R² > 0.75 on test set
- Prediction confidence > 70% for 80% of cases

### Business Impact
- 15% improvement in hybrid selection accuracy
- 20% reduction in yield variability
- 10% increase in average milk production per hectare

### User Adoption
- 80% of farmers use ML recommendations
- 90% satisfaction rate with predictions
- 50% reduction in consultation time

---

## Risk Mitigation

### Technical Risks

**Risk: Insufficient training data**
- Mitigation: Transfer learning, synthetic data augmentation, continuous data collection

**Risk: Model overfitting**
- Mitigation: Cross-validation, regularization, ensemble methods, monitoring

**Risk: Spatial data quality**
- Mitigation: Data validation pipelines, outlier detection, multiple sources

### Operational Risks

**Risk: Model drift over time**
- Mitigation: Automated retraining, performance monitoring, A/B testing

**Risk: Computational costs**
- Mitigation: Model optimization, caching, batch predictions, cloud auto-scaling

---

## Next Steps

### Week 1 Actions

1. **Set up ML environment**
   ```bash
   pip install -r requirements_ml.txt
   ```

2. **Create database migrations**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

3. **Collect baseline data**
   - Soil samples from existing plots
   - Satellite imagery for NDVI
   - Topographic data

4. **Implement KPI calculator**
   - Create `backend/api/utils/kpi_calculator.py`
   - Add KPI endpoints

5. **Start feature engineering**
   - Create `backend/ml/feature_engineering.py`
   - Extract spatial features

### Development Workflow

1. **Branch strategy**: `feature/ml-integration`, `feature/leafmap`, `feature/kpi-dashboard`
2. **Code reviews**: All ML code requires peer review
3. **Testing**: Unit tests for feature engineering, integration tests for APIs
4. **Documentation**: Document all models, features, and APIs
5. **Monitoring**: Set up MLflow for experiment tracking

---

## Training the First Model

### Step-by-Step Guide

1. **Prepare environment**
   ```bash
   cd backend
   mkdir -p ml/models ml/leafmap
   ```

2. **Create training script**
   ```python
   # backend/ml/train_model.py
   from ml.training_pipeline import ModelTrainingPipeline
   
   pipeline = ModelTrainingPipeline()
   results = pipeline.train_and_evaluate(test_size=0.2, optimize=True)
   print(f"Test RMSE: {results['test_metrics']['rmse']:.2f} t/ha")
   ```

3. **Run training**
   ```bash
   python manage.py shell < ml/train_model.py
   ```

4. **Evaluate results**
   - Check RMSE, R², MAE
   - Review feature importance
   - Validate predictions on holdout set

5. **Deploy model**
   - Save to `ml/models/svm_yield_predictor_latest.pkl`
   - Update API endpoints
   - Test prediction endpoint

---

## Conclusion

This enhancement plan transforms CropAnalytics into a cutting-edge **predictive agricultural intelligence platform** that:

✅ Uses **machine learning** to predict yields with high accuracy  
✅ Leverages **geo-spatial analysis** to understand regional patterns  
✅ Provides **location-specific recommendations** for optimal hybrid selection  
✅ Tracks **comprehensive KPIs** for data-driven decision making  
✅ Discovers **hidden correlations** in multi-dimensional agricultural data  
✅ Delivers **actionable insights** to improve farmer profitability  

The phased approach ensures manageable development while delivering value incrementally.

**Ready to begin? Start with Phase 1: Data Foundation & KPI Framework!**

---

## Contact & Support

For questions or support during implementation:
- Technical Lead: [Your Name]
- ML Engineer: [Team Member]
- Project Manager: [Team Member]

Last Updated: 2026-06-17