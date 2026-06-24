# 🌽 Crop Analytics Platform - Setup Guide

Complete guide to set up and run the Crop Analytics Platform locally on Windows.

## 📋 Table of Contents
- [Prerequisites](#prerequisites)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [Verification](#verification)
- [Troubleshooting](#troubleshooting)

---

## 🔧 Prerequisites

Before starting, ensure you have the following installed:

### Required Software
- **Docker Desktop for Windows** (latest version)
  - Download: https://www.docker.com/products/docker-desktop
  - Ensure Docker daemon is running before proceeding
  
- **Python 3.10 or higher**
  - Download: https://www.python.org/downloads/
  - Verify installation: `python --version`
  
- **Node.js v20 or higher**
  - Download: https://nodejs.org/
  - Verify installation: `node --version`
  
- **Angular CLI** (will be installed via npm)
  - Version: 21.1.3 (included in project dependencies)

### Optional but Recommended
- **Git** for version control
- **Visual Studio Code** or your preferred IDE
- **Postman** or similar tool for API testing

---

## ⚙️ Environment Configuration

### 1. Create Backend Environment File

Navigate to the backend directory and create a `.env` file:

```powershell
cd IBM-summer-experience-26\backend
New-Item -Path ".env" -ItemType File
```

### 2. Configure Environment Variables

Open the `.env` file and add the following configuration:

```env
# Database Configuration (PostgreSQL/PostGIS)
POSTGRES_DB=crop_analytics
POSTGRES_USER=usuario_maiz
POSTGRES_PASSWORD=password_seguro_dev

# Django Configuration (Optional - defaults will be used if not set)
DJANGO_SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=localhost,127.0.0.1

# pgAdmin Configuration (Optional)
PGADMIN_EMAIL=admin@cropanalytics.com
PGADMIN_PASSWORD=admin123
```

**Note:** For development purposes, you can use the default values shown above. For production, ensure you use secure passwords and a proper Django secret key.

---

## 🗄️ Database Setup

### 1. Start Docker Services

Ensure Docker Desktop is running, then start the database containers:

```powershell
# Navigate to project root
cd IBM-summer-experience-26

# Start PostgreSQL and pgAdmin containers
docker compose up -d
```

**Expected Output:**
```
✔ Container crop_analytics_db       Started
✔ Container crop_analytics_pgadmin  Started
```

### 2. Verify Database is Running

```powershell
docker ps
```

You should see two containers running:
- `crop_analytics_db` (PostgreSQL with PostGIS)
- `crop_analytics_pgadmin` (pgAdmin web interface)

### 3. Access pgAdmin (Optional)

- URL: http://localhost:5050
- Email: `admin@cropanalytics.com` (or your configured email)
- Password: `admin123` (or your configured password)

---

## 🐍 Backend Setup (Django)

### 1. Navigate to Backend Directory

```powershell
cd IBM-summer-experience-26\backend
```

### 2. Create Virtual Environment

```powershell
python -m venv venv
```

### 3. Activate Virtual Environment

**PowerShell:**
```powershell
.\venv\Scripts\Activate.ps1
```

**If you get an execution policy error, run:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**Command Prompt (cmd):**
```cmd
venv\Scripts\activate.bat
```

**Git Bash:**
```bash
source venv/Scripts/activate
```

### 4. Install Python Dependencies

```powershell
pip install -r requirements.txt
```

**Installed packages include:**
- Django 6.0.2
- Django REST Framework
- PostGIS support
- JWT authentication
- CORS headers
- And more...

### 5. Run Database Migrations

```powershell
# Create migrations for the API app
python manage.py makemigrations api

# Create any additional migrations
python manage.py makemigrations

# Apply all migrations to the database
python manage.py migrate
```

### 6. Load Initial Data

**Important:** This step populates the database with initial datasets required for the analytics page to display values.

```powershell
python manage.py cargar_datos
```

### 7. Create Superuser (Optional)

To access the Django admin panel:

```powershell
python manage.py createsuperuser
```

Follow the prompts to create an admin account.

### 8. Start Backend Server

```powershell
python manage.py runserver
```

**Backend will be accessible at:** http://localhost:8000

**API Endpoints:**
- Admin Panel: http://localhost:8000/admin/
- API Root: http://localhost:8000/api/
- API Documentation: Check your API routes in `backend/api/urls.py`

---

## 🅰️ Frontend Setup (Angular)

### 1. Open New Terminal

Keep the backend server running and open a **new terminal window**.

### 2. Navigate to Frontend Directory

```powershell
cd IBM-summer-experience-26\frontend
```

### 3. Install Node Dependencies

```powershell
npm install
```

**This will install:**
- Angular 21.1.0
- Angular CLI 21.1.3
- Plotly.js for data visualization
- Chart.js for charts
- TailwindCSS for styling
- And all other dependencies

**Note:** This may take a few minutes depending on your internet connection.

### 4. Start Angular Development Server

```powershell
npm start
```

**Alternative command:**
```powershell
ng serve
```

**Frontend will be accessible at:** http://localhost:4200

The Angular CLI will automatically open your default browser. If not, manually navigate to http://localhost:4200.

---

## ✅ Verification

### Check All Services are Running

1. **Database (PostgreSQL)**
   - Container: `crop_analytics_db` should be running
   - Port: 5432
   - Verify: `docker ps`

2. **Backend (Django)**
   - URL: http://localhost:8000
   - Test: Open in browser, should see Django REST Framework interface
   - API Health: http://localhost:8000/api/

3. **Frontend (Angular)**
   - URL: http://localhost:4200
   - Test: Open in browser, should see the application homepage
   - Check console for any errors (F12)

### Test the Complete Stack

1. Open http://localhost:4200 in your browser
2. Navigate through the application
3. Check that the analytics page displays data (thanks to `cargar_datos`)
4. Test authentication features if applicable

---

## 🔍 Troubleshooting

### Docker Issues

**Problem:** Docker daemon not running
```
Error: Cannot connect to the Docker daemon
```
**Solution:** 
- Open Docker Desktop
- Wait for it to fully start (whale icon in system tray should be steady)
- Retry `docker compose up -d`

**Problem:** Port 5432 already in use
```
Error: Bind for 0.0.0.0:5432 failed: port is already allocated
```
**Solution:**
- Stop any local PostgreSQL service
- Or modify `docker-compose.yml` to use a different port (e.g., `5433:5432`)

---

### Backend Issues

**Problem:** Virtual environment activation fails
```
cannot be loaded because running scripts is disabled
```
**Solution:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**Problem:** Module not found errors
```
ModuleNotFoundError: No module named 'django'
```
**Solution:**
- Ensure virtual environment is activated (you should see `(venv)` in your prompt)
- Reinstall dependencies: `pip install -r requirements.txt`

**Problem:** Database connection errors
```
django.db.utils.OperationalError: could not connect to server
```
**Solution:**
- Verify Docker containers are running: `docker ps`
- Check `.env` file has correct database credentials
- Restart Docker containers: `docker compose restart`

**Problem:** Migration errors
```
No changes detected in app 'api'
```
**Solution:**
- Ensure you're in the `backend` directory
- Check that models.py has been modified
- Try: `python manage.py makemigrations api --empty` to create an empty migration

---

### Frontend Issues

**Problem:** npm install fails
```
npm ERR! code ERESOLVE
```
**Solution:**
```powershell
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json

# Reinstall
npm install
```

**Problem:** Port 4200 already in use
```
Port 4200 is already in use
```
**Solution:**
```powershell
# Use a different port
ng serve --port 4201
```

**Problem:** Angular CLI not found
```
'ng' is not recognized as an internal or external command
```
**Solution:**
```powershell
# Install Angular CLI globally
npm install -g @angular/cli@21.1.3

# Or use npx
npx ng serve
```

**Problem:** TypeScript errors
```
error TS2307: Cannot find module
```
**Solution:**
- Ensure all dependencies are installed: `npm install`
- Check Node.js version: `node --version` (should be v20+)
- Clear Angular cache: `ng cache clean`

---

### General Issues

**Problem:** CORS errors in browser console
```
Access to XMLHttpRequest has been blocked by CORS policy
```
**Solution:**
- Verify `django-cors-headers` is installed in backend
- Check `CORS_ALLOWED_ORIGINS` in `backend/core/settings.py`
- Ensure backend is running on http://localhost:8000

**Problem:** Authentication issues
```
401 Unauthorized
```
**Solution:**
- Check JWT token configuration in backend
- Verify authentication endpoints are working
- Clear browser cookies and local storage
- Test API endpoints with Postman first

---

## 📁 Project Structure Overview

```
IBM-summer-experience-26/
├── backend/                 # Django REST API
│   ├── api/                # Main API application
│   │   ├── models.py       # Database models
│   │   ├── views.py        # API endpoints
│   │   ├── serializers.py  # Data serialization
│   │   └── management/     # Custom management commands
│   ├── core/               # Django project settings
│   ├── manage.py           # Django management script
│   └── requirements.txt    # Python dependencies
│
├── frontend/               # Angular application
│   ├── src/
│   │   ├── app/           # Application components
│   │   ├── assets/        # Static assets
│   │   └── environments/  # Environment configs
│   ├── angular.json       # Angular configuration
│   └── package.json       # Node dependencies
│
├── docker-compose.yml     # Docker services configuration
└── SETUP.md              # This file
```

---

## 🚀 Quick Start (For Experienced Developers)

```powershell
# 1. Start database
docker compose up -d

# 2. Backend setup
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py migrate
python manage.py cargar_datos
python manage.py runserver

# 3. Frontend setup (new terminal)
cd frontend
npm install
npm start
```

---

## 📚 Additional Resources

- **Django Documentation:** https://docs.djangoproject.com/
- **Django REST Framework:** https://www.django-rest-framework.org/
- **Angular Documentation:** https://angular.dev/
- **Docker Documentation:** https://docs.docker.com/
- **PostGIS Documentation:** https://postgis.net/documentation/

---

## 🆘 Need Help?

If you encounter issues not covered in this guide:

1. Check the error message carefully
2. Search for the error in the project's issue tracker
3. Consult the official documentation for the relevant technology
4. Ask for help from the development team

---

## 📝 Notes

- **Development Mode:** This setup is for local development only
- **Security:** Default credentials are for development; use secure values in production
- **Performance:** First-time setup may take longer due to downloads and installations
- **Updates:** Keep dependencies updated regularly for security and features

---

**Happy Coding! 🌽**