# Solución al Problema de la Calculadora

## Problema Identificado

El error "Ocurrió un error al procesar la optimización de semillas" aparece porque:

1. **No hay datos en la base de datos**: La calculadora necesita ciclos agrícolas con resultados de laboratorio para funcionar.
2. **Manejo de errores mejorado**: He actualizado el código para dar mensajes más claros cuando faltan datos.

## Cambios Realizados

### 1. Backend - `views.py` (OptimizarSemillaView)

He mejorado la vista para:
- Verificar si existen ciclos con el régimen hídrico solicitado
- Filtrar solo ciclos que tengan resultados de laboratorio (`laboratorio__isnull=False`)
- Agregar validación con `count_ciclos__gt=0` para asegurar que hay datos
- Proporcionar mensajes de error más descriptivos

### 2. Mensajes de Error Mejorados

Ahora el sistema mostrará mensajes específicos:
- "No se encontraron ciclos con régimen hídrico 'Riego/Temporal'"
- "No se encontraron híbridos con resultados de laboratorio bajo el régimen hídrico..."

## Solución: Cargar Datos en la Base de Datos

### Opción 1: Usando Docker (Recomendado)

```bash
# 1. Asegúrate de que los contenedores estén corriendo
cd IBM-summer-experience-26
docker-compose up -d

# 2. Ejecuta las migraciones
docker-compose exec backend python manage.py migrate

# 3. Carga los datos desde los CSVs
docker-compose exec backend python manage.py cargar_datos

# 4. Verifica que los datos se cargaron
docker-compose exec backend python manage.py shell -c "from api.models import Ciclo, ResultadoLaboratorio; print(f'Ciclos: {Ciclo.objects.count()}'); print(f'Laboratorios: {ResultadoLaboratorio.objects.count()}')"
```

### Opción 2: Sin Docker (Entorno Virtual)

```bash
# 1. Activa el entorno virtual
cd IBM-summer-experience-26/backend
# En Windows PowerShell:
.\venv\Scripts\Activate.ps1
# En Windows CMD:
.\venv\Scripts\activate.bat
# En Linux/Mac:
source venv/bin/activate

# 2. Ejecuta las migraciones
python manage.py migrate

# 3. Carga los datos desde los CSVs
python manage.py cargar_datos

# 4. Verifica que los datos se cargaron
python manage.py shell -c "from api.models import Ciclo, ResultadoLaboratorio; print(f'Ciclos: {Ciclo.objects.count()}'); print(f'Laboratorios: {ResultadoLaboratorio.objects.count()}')"

# 5. Inicia el servidor
python manage.py runserver
```

## Verificación de Datos

Los archivos CSV deben estar en `IBM-summer-experience-26/backend/data/`:
- Estados.csv
- Municipios.csv
- Hibridos.csv
- Terrenos.csv
- Ciclos.csv
- Laboratorio.csv
- OpenMeteo.csv

## Prueba de la Calculadora

Una vez cargados los datos:

1. Abre el frontend: `http://localhost:4200/calculator`
2. Selecciona un régimen hídrico (Riego o Temporal)
3. Ingresa hectáreas (ej: 1)
4. Ingresa precio de leche (ej: 10.50)
5. Haz clic en "Calcular"

Deberías ver:
- Un ranking de híbridos ordenados por producción de leche
- Detalles del híbrido seleccionado
- Proyecciones financieras
- Prescripciones agronómicas

## Solución de Problemas

### Error: "No se encontraron ciclos..."
- Verifica que los archivos CSV existen en `backend/data/`
- Ejecuta `python manage.py cargar_datos` nuevamente
- Revisa los logs del comando para ver si hubo errores

### Error: "No se encontraron híbridos con resultados de laboratorio..."
- Verifica que el archivo `Laboratorio.csv` tiene datos
- Asegúrate de que los `id_ciclo` en Laboratorio.csv coinciden con los IDs en Ciclos.csv
- Verifica que hay ciclos con el régimen hídrico que estás buscando

### El backend no responde
- Verifica que el servidor está corriendo: `docker-compose ps` o revisa el proceso de Python
- Revisa los logs: `docker-compose logs backend` o la consola donde ejecutaste `runserver`
- Verifica la URL del API en `frontend/src/environments/environment.ts`

## Contacto

Si el problema persiste después de cargar los datos, revisa:
1. Los logs del backend para errores específicos
2. La consola del navegador (F12) para errores de red
3. Que el frontend esté apuntando a la URL correcta del backend