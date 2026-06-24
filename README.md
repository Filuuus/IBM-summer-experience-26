<<<<<<< Updated upstream
# IBM-summer-experience-26
Proyecto desarrollado con Bob

Cambio de prueba
=======
# CropAnalytics - Agricultural Intelligence Platform

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/)
[![Django](https://img.shields.io/badge/django-6.0-green.svg)](https://www.djangoproject.com/)
[![Angular](https://img.shields.io/badge/angular-21-red.svg)](https://angular.io/)
[![PostgreSQL](https://img.shields.io/badge/postgresql-16-blue.svg)](https://www.postgresql.org/)

> **Advanced geospatial intelligence platform for optimizing corn production through machine learning and GeoAI techniques.**

Developed as part of the IBM Summer Experience 2026 program, CropAnalytics transforms agricultural data analysis by integrating historical data, real-time weather information, and machine learning to provide accurate yield predictions and actionable farming recommendations.

---

## 🌟 Key Features

- 🌾 **ML-Powered Predictions**: Yield forecasting using 50+ variables and ensemble models
- 🗺️ **Geospatial Analysis**: Interactive maps with production zone identification
- 📊 **Advanced Analytics**: Multi-variate correlation and trend analysis
- 🎯 **Smart Recommendations**: Data-driven hybrid selection and planting date optimization
- 🌤️ **Weather Integration**: Real-time and historical climate data analysis
- 📈 **Quality Metrics**: Nutritional content and digestibility predictions

---

## 📚 Documentation

Comprehensive documentation is available in the following guides:

| Document | Description |
|----------|-------------|
| **[PROJECT_DOCUMENTATION.md](PROJECT_DOCUMENTATION.md)** | Complete project overview, features, and technology stack |
| **[ARCHITECTURE.md](ARCHITECTURE.md)** | System architecture, design patterns, and component details |
| **[SETUP_GUIDE.md](SETUP_GUIDE.md)** | Step-by-step installation and configuration instructions |
| **[API_REFERENCE.md](API_REFERENCE.md)** | Complete API endpoint documentation with examples |
| **[CONTRIBUTING.md](CONTRIBUTING.md)** | Development guidelines and contribution process |
| **[IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md)** | Detailed 6-month development roadmap |

---

## 🚀 Quick Start

### Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- Python 3.11+
- Node.js 18+
- Git 2.30+

### Installation

```bash
# 1. Clone the repository
git clone <repository-url>
cd IBM-summer-experience-26

# 2. Create environment file
cat > .env << EOF
POSTGRES_DB=crop_analytics
POSTGRES_USER=usuario_maiz
POSTGRES_PASSWORD=password_seguro_dev
PGADMIN_EMAIL=admin@cropanalytics.com
PGADMIN_PASSWORD=admin_password
EOF

# 3. Start infrastructure
docker-compose up -d

# 4. Setup backend
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver

# 5. Setup frontend (in new terminal)
cd frontend
npm install
npm start
```

### Access Points

- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:8000/api/
- **Django Admin**: http://localhost:8000/admin/
- **pgAdmin**: http://localhost:5050

For detailed setup instructions, see [SETUP_GUIDE.md](SETUP_GUIDE.md).

---

## 🏗️ Project Structure

```
IBM-summer-experience-26/
├── backend/                    # Django backend application
│   ├── core/                   # Project configuration
│   ├── manage.py              # Django management script
│   └── requirements.txt       # Python dependencies
│
├── frontend/                   # Angular frontend application
│   ├── src/app/               # Application modules
│   ├── angular.json           # Angular configuration
│   └── package.json           # Node dependencies
│
├── data/                       # CSV data files
│   ├── Ciclos.csv             # Growing cycle records
│   ├── Estados.csv            # State boundaries
│   ├── Hibridos.csv           # Corn hybrid varieties
│   └── ...                    # Additional data files
│
├── docker-compose.yml          # Container orchestration
├── PROJECT_DOCUMENTATION.md    # Main documentation
├── ARCHITECTURE.md             # System architecture
├── SETUP_GUIDE.md              # Installation guide
├── API_REFERENCE.md            # API documentation
├── CONTRIBUTING.md             # Contribution guidelines
└── IMPLEMENTATION_PLAN.md      # Development roadmap
```

---

## 💻 Technology Stack

### Backend
- **Framework**: Django 6.0 with GeoDjango
- **Database**: PostgreSQL 16 + PostGIS 3.4
- **API**: Django REST Framework 3.16
- **ML**: scikit-learn, GeoPandas (planned)

### Frontend
- **Framework**: Angular 21
- **Styling**: Tailwind CSS 4.1
- **Language**: TypeScript 5.9

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Database UI**: pgAdmin 4

For complete technology details, see [PROJECT_DOCUMENTATION.md](PROJECT_DOCUMENTATION.md#technology-stack).

---

## 📊 System Architecture

```
┌─────────────────────────────────────────┐
│     Angular Frontend (Port 4200)        │
│  ┌────────────┐  ┌────────────┐        │
│  │ Dashboard  │  │ Analytics  │        │
│  └────────────┘  └────────────┘        │
└─────────────────────────────────────────┘
                    │
                    │ HTTP/REST
                    ▼
┌─────────────────────────────────────────┐
│   Django Backend API (Port 8000)        │
│  ┌────────────┐  ┌────────────┐        │
│  │ ML Engine  │  │  GeoAI     │        │
│  └────────────┘  └────────────┘        │
└─────────────────────────────────────────┘
                    │
                    │ PostGIS
                    ▼
┌─────────────────────────────────────────┐
│  PostgreSQL + PostGIS (Port 5432)       │
│         Geographic & Agricultural        │
│              Data Storage                │
└─────────────────────────────────────────┘
```

For detailed architecture, see [ARCHITECTURE.md](ARCHITECTURE.md).

---

## 🔬 Core Capabilities

### Machine Learning Pipeline

- **Feature Engineering**: 50+ variables including climate, soil, and agronomic factors
- **Model Architecture**: Ensemble of SVM, Random Forest, and Gradient Boosting
- **Predictions**: Yield forecasting with confidence intervals
- **Target Accuracy**: R² > 0.85, RMSE < 1.5 t/ha

### GeoAI Analysis

- **Spatial Autocorrelation**: Moran's I analysis for pattern detection
- **Hotspot Analysis**: Identify high/low production clusters
- **Spatial Interpolation**: Kriging for unmeasured locations
- **Production Zones**: Cluster similar performing regions

### Data Variables

The system analyzes comprehensive agricultural data:
- **Temporal**: Planting/harvest dates, growing season duration
- **Climate**: Temperature, precipitation, solar radiation, growing degree days
- **Plant Development**: Emergence, flowering, harvest metrics
- **Yield & Quality**: Dry matter, protein, fiber, digestibility

For complete variable list, see [PROJECT_DOCUMENTATION.md](PROJECT_DOCUMENTATION.md#data-variables).

---

## 🛣️ Development Roadmap

### Current Status: Phase 1 - Foundation ✅

- [x] Database schema with PostGIS support
- [x] Docker infrastructure setup
- [x] Basic Django and Angular applications
- [x] Project documentation

### Upcoming Phases

- **Phase 2** (Weeks 5-8): ML infrastructure and feature engineering
- **Phase 3** (Weeks 9-12): REST API development
- **Phase 4** (Weeks 13-16): Frontend enhancement with maps
- **Phase 5** (Weeks 17-20): Model training and validation
- **Phase 6** (Weeks 21-24): Advanced features and deployment

See [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) for the complete 6-month roadmap.

---

## 🤝 Contributing

We welcome contributions! Please see our [CONTRIBUTING.md](CONTRIBUTING.md) guide for:

- Code of conduct
- Development workflow
- Coding standards
- Testing guidelines
- Pull request process

### Quick Contribution Steps

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📖 API Documentation

The API provides RESTful endpoints for:

- Geographic data (states, municipalities, plots)
- Agricultural data (hybrids, growing cycles)
- ML predictions (yield forecasting, quality metrics)
- Recommendations (hybrid selection, planting dates)
- GeoAI analysis (production zones, spatial patterns)

Example API call:

```bash
# Predict yield
curl -X POST http://localhost:8000/api/v1/ciclos/predict_yield/ \
  -H "Content-Type: application/json" \
  -d '{
    "terreno_id": 1,
    "hibrido_id": 2,
    "condiciones_esperadas": {
      "temp_media_ciclo": 22.5,
      "precipitacion_ciclo": 450
    }
  }'
```

For complete API documentation, see [API_REFERENCE.md](API_REFERENCE.md).

---

## 🧪 Testing

```bash
# Backend tests
cd backend
python manage.py test

# Frontend tests
cd frontend
npm test

# Run with coverage
python manage.py test --coverage
npm test -- --coverage
```

---

## 📝 License

[Specify license information]

---

## 👥 Team

**IBM Summer Experience 2026**

Developed with assistance from Bob, an AI-powered development assistant.

---

## 📞 Support

For questions or issues:

1. Check the [documentation](#-documentation)
2. Review [SETUP_GUIDE.md](SETUP_GUIDE.md) for troubleshooting
3. Search [existing issues](https://github.com/ORIGINAL_OWNER/IBM-summer-experience-26/issues)
4. Open a new issue with detailed information

---

## 🙏 Acknowledgments

- IBM Summer Experience Program 2026
- Open-source community
- Contributors and maintainers

---

**Project Status**: Active Development
**Version**: 1.0.0
**Last Updated**: June 2026

---

Made with ❤️ for sustainable agriculture
>>>>>>> Stashed changes
