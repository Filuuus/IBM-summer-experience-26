# Confidence Metrics & Ensilaje Pricing Features

## Overview

This document describes the new features added to CropAnalytics to increase farmer confidence and provide comprehensive economic analysis for different production scenarios.

---

## 1. Confidence Metrics for MILK2024 Estimations

### Purpose
Provide transparency and reliability indicators for all milk production predictions, helping farmers understand the quality and trustworthiness of the estimates.

### Implementation

#### Backend (`backend/api/utils/milk_calculator.py`)

**Function: `calcular_factor_confianza()`**

Calculates a confidence score (0-100%) based on:

1. **Data Completeness** (-10% per missing critical field)
   - Critical fields: MS, CP, NDF, Starch
   
2. **Nutritional Value Ranges** (penalties for out-of-range values)
   - MS (Dry Matter): Optimal 30-40%, Acceptable 28-45%
   - CP (Crude Protein): Optimal 7-10%, Acceptable 6-12%
   - NDF (Fiber): Optimal 35-50%, Acceptable 30-55%
   - Starch: Optimal 25-35%, Acceptable 20-40%

3. **Use of Default Values** (-5% per fallback value)
   - NDFD, uNDF240, Starch Digestibility

4. **Energy Coherence** (NEL validation)
   - Low NEL (<1.3 Mcal/kg): -5%
   - High NEL (>1.8 Mcal/kg): -5%

**Confidence Levels:**
- **Excelente** (85-100%): Complete data, optimal ranges
- **Buena** (70-84%): Sufficient data, acceptable ranges
- **Moderada** (50-69%): Partial data or suboptimal values
- **Baja** (<50%): Insufficient or significantly out-of-range data

**Response Structure:**
```json
{
  "confianza": {
    "factor_confianza": 87.5,
    "nivel_confianza": "Excelente",
    "color_indicador": "green",
    "penalizaciones": [
      "Valores por defecto utilizados: NDFD, uNDF240 (-10%)"
    ],
    "advertencias": [
      "MS en rango aceptable pero no óptimo: 32.5%"
    ],
    "justificacion": "Confianza Excelente (87.5%): Datos completos y dentro de rangos óptimos..."
  }
}
```

---

## 2. Ensilaje Economic Analysis

### Purpose
Provide comprehensive economic analysis for three different producer scenarios, helping farmers make informed decisions about whether to sell, use, or buy ensilaje.

### Implementation

#### Backend (`backend/api/utils/milk_calculator.py`)

**Function: `calcular_valor_ensilaje()`**

Analyzes three production scenarios:

### Scenario 1: Producer Who SELLS Ensilaje

**Target:** Farmers who grow corn and sell it as silage

**Calculations:**
- Gross income from silage sales
- Production costs
- Net profit per hectare
- Profit margin
- ROI

**Response Fields:**
```json
{
  "escenario_venta": {
    "descripcion": "Productor que vende ensilaje",
    "rendimiento_ms_ha": 20.5,
    "precio_venta_ton_ms": 2800,
    "ingreso_bruto_ha": 57400,
    "costo_produccion_ha": 36900,
    "utilidad_neta_ha": 20500,
    "margen_utilidad": 35.7,
    "roi": 55.6
  }
}
```

### Scenario 2: Producer Who USES Own Ensilaje (Dairy Production)

**Target:** Farmers who grow corn and feed it to their own dairy cows

**Calculations:**
- Milk production potential (from MILK2024)
- Income from milk sales
- Ensilaje production costs
- Additional dairy operation costs (~3.5 MXN/liter)
- Net profit per hectare
- Implicit value of ensilaje based on milk produced
- ROI

**Response Fields:**
```json
{
  "escenario_uso_propio": {
    "descripcion": "Productor que usa ensilaje para sus vacas",
    "rendimiento_ms_ha": 20.5,
    "produccion_leche_ha": 5467.5,
    "produccion_leche_ton_ms": 266.7,
    "precio_leche_litro": 10.50,
    "ingreso_leche_ha": 57408.75,
    "costo_ensilaje_ha": 36900,
    "costo_adicional_lecheria_ha": 19136.25,
    "costo_total_ha": 56036.25,
    "utilidad_neta_ha": 1372.50,
    "margen_utilidad": 2.4,
    "valor_implicito_ensilaje_ton": 2800.35,
    "roi": 2.4
  }
}
```

### Scenario 3: Producer Who BUYS Ensilaje

**Target:** Dairy farmers without land who purchase silage

**Calculations:**
- Ensilaje purchase cost (including transport)
- Milk production from purchased ensilaje
- Income from milk sales
- Additional dairy costs
- Net profit
- **Maximum recommended purchase price** (to maintain 20% margin)
- ROI

**Response Fields:**
```json
{
  "escenario_compra": {
    "descripcion": "Productor que compra ensilaje",
    "necesidad_ms_ha": 20.5,
    "precio_compra_ton_ms": 2800,
    "costo_transporte_ton": 150,
    "costo_ensilaje_ha": 60475,
    "produccion_leche_ha": 5467.5,
    "ingreso_leche_ha": 57408.75,
    "costo_adicional_lecheria_ha": 19136.25,
    "costo_total_ha": 79611.25,
    "utilidad_neta_ha": -22202.50,
    "margen_utilidad": -38.7,
    "precio_maximo_recomendado_ton": 2234.15,
    "roi": -27.9
  }
}
```

### Comparative Analysis & Recommendation

**Automatic recommendation** based on highest net profit:

```json
{
  "recomendacion": {
    "mejor_opcion": "venta",
    "utilidad_maxima_ha": 20500,
    "diferencia_vs_venta": -19127.50,
    "factor_decision": "venta_directa",
    "justificacion": "Vender el ensilaje es más rentable con un margen de 35.7%..."
  }
}
```

---

## 3. API Integration

### Endpoints Updated

#### POST `/api/calcular-productor/`

**New Optional Parameters:**
```json
{
  "hibrido_id": 1,
  "yield_dm": 20.5,
  "precio_leche": 10.50,
  "precio_ensilaje": 2800,
  "costo_produccion": 1800,
  "costo_transporte": 150
}
```

**Response includes:**
- Original MILK2024 metrics
- **Confidence analysis** (`confianza`)
- **Economic analysis** (`analisis_economico`)

#### POST `/api/optimizar-semilla/`

**New Optional Parameters:**
```json
{
  "regimen_hidrico": "Riego",
  "precio_leche": 10.50,
  "precio_ensilaje": 2800,
  "costo_produccion": 1800,
  "costo_transporte": 150
}
```

**Each hybrid in ranking includes:**
- MILK2024 metrics with confidence
- Complete economic analysis for all 3 scenarios

---

## 4. Frontend Integration

### Calculator Component Updates

#### New Form Fields (`calculator.component.ts`)

```typescript
form: FormGroup = this.fb.group({
  regimen_hidrico: ['Riego', [Validators.required]],
  hectareas: [1, [Validators.required, Validators.min(0.01)]],
  precio_leche: [10.50, [Validators.required, Validators.min(0.01)]],
  precio_ensilaje: [2800, [Validators.required, Validators.min(0)]],
  costo_produccion: [1800, [Validators.required, Validators.min(0)]],
  costo_transporte: [150, [Validators.required, Validators.min(0)]]
});
```

### Display Components Needed

#### 1. Confidence Badge Component

Display confidence level with color coding:

```html
<div class="confidence-badge" [ngClass]="getConfidenceClass(hibrido.confianza)">
  <span class="confidence-icon">{{ getConfidenceIcon(hibrido.confianza.nivel_confianza) }}</span>
  <span class="confidence-text">{{ hibrido.confianza.nivel_confianza }}</span>
  <span class="confidence-score">{{ hibrido.confianza.factor_confianza }}%</span>
</div>
```

**Color Classes:**
- `green`: Excelente (85-100%)
- `blue`: Buena (70-84%)
- `yellow`: Moderada (50-69%)
- `red`: Baja (<50%)

#### 2. Economic Scenarios Comparison

Tabbed or accordion view showing all three scenarios:

```html
<div class="economic-analysis">
  <div class="scenario-tabs">
    <button (click)="selectedScenario = 'venta'">Vender Ensilaje</button>
    <button (click)="selectedScenario = 'uso_propio'">Usar en Lechería</button>
    <button (click)="selectedScenario = 'compra'">Comprar Ensilaje</button>
  </div>
  
  <div class="scenario-content" *ngIf="selectedScenario === 'venta'">
    <h3>Escenario: Venta de Ensilaje</h3>
    <div class="metric">
      <span>Ingreso Bruto:</span>
      <span>${{ hibrido.analisis_economico.escenario_venta.ingreso_bruto_ha | number:'1.2-2' }} MXN/ha</span>
    </div>
    <div class="metric">
      <span>Utilidad Neta:</span>
      <span class="profit">${{ hibrido.analisis_economico.escenario_venta.utilidad_neta_ha | number:'1.2-2' }} MXN/ha</span>
    </div>
    <div class="metric">
      <span>ROI:</span>
      <span>{{ hibrido.analisis_economico.escenario_venta.roi }}%</span>
    </div>
  </div>
  
  <!-- Similar for uso_propio and compra scenarios -->
</div>
```

#### 3. Recommendation Banner

Highlight the best economic option:

```html
<div class="recommendation-banner" *ngIf="hibrido.analisis_economico.recomendacion">
  <div class="recommendation-icon">💡</div>
  <div class="recommendation-content">
    <h4>Recomendación</h4>
    <p>{{ hibrido.analisis_economico.recomendacion.justificacion }}</p>
    <div class="recommendation-stats">
      <span>Mejor opción: <strong>{{ getScenarioName(hibrido.analisis_economico.recomendacion.mejor_opcion) }}</strong></span>
      <span>Utilidad máxima: <strong>${{ hibrido.analisis_economico.recomendacion.utilidad_maxima_ha | number:'1.2-2' }} MXN/ha</strong></span>
    </div>
  </div>
</div>
```

---

## 5. Usage Examples

### Example 1: High Confidence, Sell Scenario Best

```json
{
  "hibrido": {
    "id": 15,
    "nombre": "P2089YHR",
    "marca": "Pioneer"
  },
  "leche_ha": 5467.5,
  "confianza": {
    "factor_confianza": 92.0,
    "nivel_confianza": "Excelente",
    "color_indicador": "green",
    "justificacion": "Datos completos y dentro de rangos óptimos..."
  },
  "analisis_economico": {
    "escenario_venta": {
      "utilidad_neta_ha": 20500,
      "roi": 55.6
    },
    "escenario_uso_propio": {
      "utilidad_neta_ha": 1372.50,
      "roi": 2.4
    },
    "recomendacion": {
      "mejor_opcion": "venta",
      "justificacion": "Vender el ensilaje es más rentable con un margen de 35.7%..."
    }
  }
}
```

**Interpretation:** High-quality data, selling silage is 15x more profitable than dairy production.

### Example 2: Moderate Confidence, Dairy Production Best

```json
{
  "confianza": {
    "factor_confianza": 68.0,
    "nivel_confianza": "Moderada",
    "penalizaciones": [
      "Datos críticos faltantes: starch (-10%)",
      "NDF fuera de rango esperado: 56.2% (-7%)"
    ]
  },
  "analisis_economico": {
    "escenario_uso_propio": {
      "utilidad_neta_ha": 25000,
      "valor_implicito_ensilaje_ton": 3200
    },
    "escenario_venta": {
      "utilidad_neta_ha": 18000
    },
    "recomendacion": {
      "mejor_opcion": "uso_propio",
      "diferencia_vs_venta": 7000,
      "justificacion": "La producción lechera propia genera $7,000 MXN más por hectárea..."
    }
  }
}
```

**Interpretation:** Moderate confidence due to missing data, but dairy production still more profitable.

---

## 6. Benefits for Farmers

### Increased Trust
- **Transparency**: Clear confidence scores show data quality
- **Justification**: Detailed explanations of penalties and warnings
- **Validation**: Farmers can verify if their data is within expected ranges

### Better Decision Making
- **Scenario Comparison**: See all options side-by-side
- **ROI Analysis**: Understand profitability of each path
- **Recommendations**: AI-powered suggestions based on economics

### Financial Planning
- **Accurate Projections**: Know expected income for each scenario
- **Cost Awareness**: Understand all costs involved
- **Price Sensitivity**: See maximum recommended purchase prices

### Risk Management
- **Confidence Levels**: Identify when to seek additional validation
- **Data Quality**: Know which measurements need improvement
- **Market Insights**: Compare selling vs. using ensilaje

---

## 7. Future Enhancements

### Phase 1 (Current)
✅ Confidence metrics for MILK2024
✅ Three-scenario economic analysis
✅ Automatic recommendations

### Phase 2 (Planned)
- [ ] Historical price trends integration
- [ ] Regional market price comparisons
- [ ] Seasonal pricing adjustments
- [ ] Contract farming scenarios

### Phase 3 (Planned)
- [ ] Risk analysis (price volatility)
- [ ] Break-even analysis
- [ ] Multi-year projections
- [ ] Insurance recommendations

---

## 8. Technical Notes

### Performance
- All calculations done server-side
- Minimal frontend processing
- Cached results for repeated queries

### Accuracy
- Based on Wisconsin MILK2024 model
- Validated against historical data
- Conservative estimates for safety

### Extensibility
- Modular design allows easy addition of new scenarios
- Configurable price parameters
- Pluggable confidence calculation rules

---

## Contact & Support

For questions about these features:
- Technical: See `backend/api/utils/milk_calculator.py`
- Business Logic: Review this document
- Frontend Integration: Check `frontend/src/app/calculator/`

Last Updated: 2026-06-24