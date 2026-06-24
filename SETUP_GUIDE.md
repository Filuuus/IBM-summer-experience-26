# CropAnalytics Setup Guide

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Detailed Installation](#detailed-installation)
4. [Database Setup](#database-setup)
5. [Backend Configuration](#backend-configuration)
6. [Frontend Configuration](#frontend-configuration)
7. [Data Loading](#data-loading)
8. [Verification](#verification)
9. [Troubleshooting](#troubleshooting)
10. [Development Workflow](#development-workflow)

---

## Prerequisites

### Required Software

| Software | Minimum Version | Purpose |
|----------|----------------|---------|
| **Docker** | 20.10+ | Container runtime |
| **Docker Compose** | 2.0+ | Multi-container orchestration |
| **Python** | 3.11+ | Backend development |
| **Node.js** | 18+ | Frontend development |
| **npm** | 9+ | Package management |
| **Git** | 2.30+ | Version control |

### System Requirements

- **OS**: Windows 10/11, macOS 11+, or Linux (Ubuntu 20.04+)
- **RAM**: 8GB minimum, 16GB recommended
- **Disk Space**: 10GB free space
- **Network**: Internet connection for package downloads

### Optional Tools

- **VS Code**: Recommended IDE with extensions:
  - Python
  - Angular Language Service
  - Docker
  - PostgreSQL
- **Postman**: API testing
- **pgAdmin**: Database management (included in Docker setup)

---

## Quick Start

For experienced developers who want to get started immediately:

```bash
# 1. Clone repository
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

**Access Points**:
- Frontend: http://localhost:4200
- Backend API: http://localhost:8000/api/
- Django Admin: http://localhost:8000/admin/
- pgAdmin: http://localhost:5050

---

## Detailed Installation

### Step 1: Install Docker

#### Windows

1. Download [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop)
2. Run the installer
3. Enable WSL 2 backend when prompted
4. Restart your computer
5. Verify installation:
   ```powershell
   docker --version
   docker-compose --version
   ```

#### macOS

1. Download [Docker Desktop for Mac](https://www.docker.com/products/docker-desktop)
2. Drag Docker.app to Applications folder
3. Launch Docker Desktop
4. Verify installation:
   ```bash
   docker --version
   docker-compose --version
   ```

#### Linux (Ubuntu/Debian)

```bash
# Update package index
sudo apt-get update

# Install dependencies
sudo apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Add Docker's official GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Set up stable repository
echo \
  "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Verify installation
docker --version
docker compose version
```

### Step 2: Install Python

#### Windows

1. Download [Python 3.11+](https://www.python.org/downloads/)
2. Run installer
3. **Important**: Check "Add Python to PATH"
4. Verify installation:
   ```powershell
   python --version
   pip --version
   ```

#### macOS

```bash
# Using Homebrew
brew install python@3.11

# Verify installation
python3 --version
pip3 --version
```

#### Linux

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y python3.11 python3.11-venv python3-pip

# Verify installation
python3.11 --version
pip3 --version
```

### Step 3: Install Node.js and npm

#### Windows

1. Download [Node.js LTS](https://nodejs.org/)
2. Run installer
3. Verify installation:
   ```powershell
   node --version
   npm --version
   ```

#### macOS

```bash
# Using Homebrew
brew install node@18

# Verify installation
node --version
npm --version
```

#### Linux

```bash
# Using NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### Step 4: Clone Repository

```bash
# Clone the repository
git clone <repository-url>
cd IBM-summer-experience-26

# Verify project structure
ls -la
```

Expected output:
```
backend/
frontend/
data/
docker-compose.yml
README.md
IMPLEMENTATION_PLAN.md
```

---

## Database Setup

### Step 1: Create Environment File

Create a `.env` file in the project root:

```bash
# Linux/macOS
cat > .env << 'EOF'
POSTGRES_DB=crop_analytics
POSTGRES_USER=usuario_maiz
POSTGRES_PASSWORD=password_seguro_dev
PGADMIN_EMAIL=admin@cropanalytics.com
PGADMIN_PASSWORD=admin_password
EOF

# Windows (PowerShell)
@"
POSTGRES_DB=crop_analytics
POSTGRES_USER=usuario_maiz
POSTGRES_PASSWORD=password_seguro_dev
PGADMIN_EMAIL=admin@cropanalytics.com
PGADMIN_PASSWORD=admin_password
"@ | Out-File -FilePath .env -Encoding utf8
```

**Security Note**: For production, use strong passwords and never commit `.env` to version control.

### Step 2: Start Database Containers

```bash
# Start PostgreSQL and pgAdmin
docker-compose up -d

# Verify containers are running
docker-compose ps
```

Expected output:
```
NAME                    STATUS              PORTS
crop_analytics_db       Up 10 seconds       0.0.0.0:5432->5432/tcp
crop_analytics_pgadmin  Up 10 seconds       0.0.0.0:5050->80/tcp
```

### Step 3: Verify Database Connection

```bash
# Connect to PostgreSQL container
docker exec -it crop_analytics_db psql -U usuario_maiz -d crop_analytics

# Inside PostgreSQL shell
\l                    # List databases
\c crop_analytics     # Connect to database
\dx                   # List extensions (should see PostGIS)
\q                    # Quit
```

### Step 4: Access pgAdmin (Optional)

1. Open browser: http://localhost:5050
2. Login with credentials from `.env`:
   - Email: `admin@cropanalytics.com`
   - Password: `admin_password`
3. Add server:
   - Name: `CropAnalytics`
   - Host: `db` (Docker service name)
   - Port: `5432`
   - Database: `crop_analytics`
   - Username: `usuario_maiz`
   - Password: `password_seguro_dev`

---

## Backend Configuration

### Step 1: Create Virtual Environment

```bash
cd backend

# Linux/macOS
python3 -m venv venv
source venv/bin/activate

# Windows
python -m venv venv
venv\Scripts\activate
```

Your prompt should now show `(venv)`.

### Step 2: Install Dependencies

```bash
# Upgrade pip
pip install --upgrade pip

# Install requirements
pip install -r requirements.txt

# Verify installation
pip list
```

Expected packages:
- Django 6.0.2
- djangorestframework 3.16.1
- psycopg2-binary 2.9.11
- django-cors-headers 4.9.0

### Step 3: Configure Django Settings

The `backend/core/settings.py` is already configured. Verify database settings:

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.contrib.gis.db.backends.postgis',
        'NAME': 'crop_analytics',
        'USER': 'usuario_maiz',
        'PASSWORD': 'password_seguro_dev',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

### Step 4: Run Migrations

```bash
# Create database tables
python manage.py migrate

# Expected output:
# Operations to perform:
#   Apply all migrations: admin, auth, contenttypes, sessions
# Running migrations:
#   Applying contenttypes.0001_initial... OK
#   Applying auth.0001_initial... OK
#   ...
```

### Step 5: Create Superuser

```bash
python manage.py createsuperuser

# Follow prompts:
# Username: admin
# Email: admin@example.com
# Password: (enter secure password)
# Password (again): (confirm password)
```

### Step 6: Start Development Server

```bash
python manage.py runserver

# Expected output:
# Watching for file changes with StatReloader
# Performing system checks...
# System check identified no issues (0 silenced).
# Django version 6.0.2, using settings 'core.settings'
# Starting development server at http://127.0.0.1:8000/
# Quit the server with CONTROL-C.
```

### Step 7: Verify Backend

Open browser: http://localhost:8000/admin/

Login with superuser credentials.

---

## Frontend Configuration

### Step 1: Install Dependencies

Open a **new terminal** (keep backend running):

```bash
cd frontend

# Install packages
npm install

# This may take several minutes
```

### Step 2: Verify Configuration

Check `frontend/package.json` for correct dependencies:

```json
{
  "dependencies": {
    "@angular/common": "^21.1.0",
    "@angular/core": "^21.1.0",
    "@angular/router": "^21.1.0"
  }
}
```

### Step 3: Start Development Server

```bash
npm start

# Expected output:
# > frontend@0.0.0 start
# > ng serve
# 
# Initial chunk files | Names         |  Raw size
# polyfills.js        | polyfills     | 90.20 kB  |
# main.js             | main          | 23.12 kB  |
# styles.css          | styles        |  5.36 kB  |
# 
# Application bundle generation complete. [1.234 seconds]
# Watch mode enabled. Watching for file changes...
# ➜  Local:   http://localhost:4200/
```

### Step 4: Verify Frontend

Open browser: http://localhost:4200/

You should see the CropAnalytics home page.

---

## Data Loading

### Step 1: Prepare CSV Files

Place the 7 CSV files in the `data/` directory:

```
data/
├── Ciclos.csv
├── Estados.csv
├── Hibridos.csv
├── Laboratorio.csv
├── Municipios.csv
├── OpenMeteo.csv
└── Terrenos.csv
```

**Note**: These files are not included in the repository for security reasons.

### Step 2: Create Data Loading Script (Future)

```bash
# This command will be available after implementing the data loader
python manage.py cargar_datos

# Expected output:
# Loading Estados.csv... 32 records loaded
# Loading Municipios.csv... 2,469 records loaded
# Loading Terrenos.csv... 150 records loaded
# Loading Hibridos.csv... 45 records loaded
# Loading Ciclos.csv... 1,200 records loaded
# Loading OpenMeteo.csv... 50,000 records loaded
# Loading Laboratorio.csv... 800 records loaded
# Data loading complete!
```

### Step 3: Create Spatial Indexes (Future)

```bash
python manage.py crear_indices_espaciales

# Expected output:
# Creating spatial index on terreno.ubicacion... OK
# Creating spatial index on estado.geometry... OK
# Creating spatial index on municipio.geometry... OK
# Spatial indexes created successfully!
```

---

## Verification

### Backend Verification Checklist

- [ ] Docker containers running: `docker-compose ps`
- [ ] Database accessible: `docker exec -it crop_analytics_db psql -U usuario_maiz -d crop_analytics`
- [ ] Virtual environment activated: `(venv)` in prompt
- [ ] Dependencies installed: `pip list`
- [ ] Migrations applied: `python manage.py showmigrations`
- [ ] Superuser created: Login to http://localhost:8000/admin/
- [ ] Development server running: http://localhost:8000/

### Frontend Verification Checklist

- [ ] Dependencies installed: `npm list`
- [ ] Development server running: http://localhost:4200/
- [ ] Home page loads correctly
- [ ] No console errors in browser DevTools
- [ ] Routing works: Navigate to /dashboard and /analytics

### Integration Verification

Test API connectivity from frontend:

```bash
# In browser console (http://localhost:4200/)
fetch('http://localhost:8000/api/')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

Expected: API response without CORS errors.

---

## Troubleshooting

### Docker Issues

**Problem**: `docker-compose up` fails with "port already in use"

**Solution**:
```bash
# Check what's using port 5432
# Linux/macOS
sudo lsof -i :5432

# Windows
netstat -ano | findstr :5432

# Stop conflicting service or change port in docker-compose.yml
```

**Problem**: PostGIS extension not available

**Solution**:
```bash
# Recreate database container
docker-compose down -v
docker-compose up -d

# Verify PostGIS
docker exec -it crop_analytics_db psql -U usuario_maiz -d crop_analytics -c "SELECT PostGIS_version();"
```

### Backend Issues

**Problem**: `ModuleNotFoundError: No module named 'django'`

**Solution**:
```bash
# Ensure virtual environment is activated
source venv/bin/activate  # Linux/macOS
venv\Scripts\activate     # Windows

# Reinstall dependencies
pip install -r requirements.txt
```

**Problem**: Database connection refused

**Solution**:
```bash
# Check if database container is running
docker-compose ps

# Check database logs
docker-compose logs db

# Verify connection settings in settings.py match .env
```

**Problem**: `django.db.utils.OperationalError: FATAL: password authentication failed`

**Solution**:
```bash
# Reset database
docker-compose down -v
docker-compose up -d

# Wait 10 seconds for database to initialize
sleep 10

# Run migrations again
python manage.py migrate
```

### Frontend Issues

**Problem**: `npm install` fails with permission errors

**Solution**:
```bash
# Linux/macOS - fix npm permissions
sudo chown -R $USER:$USER ~/.npm
sudo chown -R $USER:$USER node_modules

# Windows - run as administrator or use:
npm install --no-optional
```

**Problem**: `ng serve` fails with "Port 4200 is already in use"

**Solution**:
```bash
# Use different port
ng serve --port 4201

# Or kill process using port 4200
# Linux/macOS
lsof -ti:4200 | xargs kill -9

# Windows
netstat -ano | findstr :4200
taskkill /PID <PID> /F
```

**Problem**: CORS errors when calling API

**Solution**:

Verify `backend/core/settings.py`:
```python
CORS_ALLOWED_ORIGINS = [
    'http://localhost:4200',
    'http://127.0.0.1:4200',
]
```

Restart Django server after changes.

### Common Errors

**Error**: `ImportError: cannot import name 'GEOSGeometry' from 'django.contrib.gis.geos'`

**Solution**: Install GDAL/GEOS libraries:
```bash
# Ubuntu/Debian
sudo apt-get install gdal-bin libgdal-dev libgeos-dev

# macOS
brew install gdal geos

# Windows - use OSGeo4W installer
```

**Error**: `npm ERR! code ELIFECYCLE`

**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

---

## Development Workflow

### Daily Development

```bash
# 1. Start Docker services (if not running)
docker-compose up -d

# 2. Activate backend virtual environment
cd backend
source venv/bin/activate  # Linux/macOS
venv\Scripts\activate     # Windows

# 3. Start Django server
python manage.py runserver

# 4. In new terminal, start Angular
cd frontend
npm start
```

### Making Changes

**Backend Changes**:
```bash
# After modifying models
python manage.py makemigrations
python manage.py migrate

# After adding dependencies
pip install <package>
pip freeze > requirements.txt
```

**Frontend Changes**:
```bash
# After adding dependencies
npm install <package>

# Build for production
npm run build
```

### Testing

```bash
# Backend tests (when implemented)
python manage.py test

# Frontend tests (when implemented)
npm test
```

### Stopping Services

```bash
# Stop Django (Ctrl+C in terminal)

# Stop Angular (Ctrl+C in terminal)

# Stop Docker containers
docker-compose down

# Stop and remove volumes (WARNING: deletes data)
docker-compose down -v
```

---

## Next Steps

After successful setup:

1. **Explore the codebase**: Review [ARCHITECTURE.md](ARCHITECTURE.md)
2. **Understand the API**: Read [API_REFERENCE.md](API_REFERENCE.md)
3. **Start developing**: Follow [CONTRIBUTING.md](CONTRIBUTING.md)
4. **Review the roadmap**: Check [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md)

---

## Additional Resources

### Documentation
- [Django Documentation](https://docs.djangoproject.com/)
- [GeoDjango Documentation](https://docs.djangoproject.com/en/stable/ref/contrib/gis/)
- [Angular Documentation](https://angular.io/docs)
- [PostGIS Documentation](https://postgis.net/documentation/)

### Tutorials
- [Django REST Framework Tutorial](https://www.django-rest-framework.org/tutorial/quickstart/)
- [Angular Getting Started](https://angular.io/start)
- [Docker Compose Tutorial](https://docs.docker.com/compose/gettingstarted/)

### Community
- [Django Forum](https://forum.djangoproject.com/)
- [Angular Discord](https://discord.gg/angular)
- [Stack Overflow](https://stackoverflow.com/)

---

## Support

If you encounter issues not covered in this guide:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) for detailed specifications
3. Consult project documentation
4. Contact the development team

---

**Document Version**: 1.0  
**Last Updated**: June 2026  
**Tested On**: Windows 11, macOS 13, Ubuntu 22.04