"""Server-owned field definitions shared by configuration and capture validation."""
from copy import deepcopy


def field(key, label, kind='number', required=False, advanced=False, **kwargs):
    return dict(key=key, label=label, type=kind, required=required,
                visible=key != 'ndvi', advanced=advanced, **kwargs)


FIELDS = [
    field('fecha', 'Fecha y hora del muestreo', 'datetime-local', True),
    field('investigador', 'Investigador', 'text', True, readonly=True),
    field('municipio', 'Municipio', 'select', True, catalog='municipios'),
    field('parcela', 'Parcela', 'text', True),
    field('hibrido', 'Híbrido', 'select', True, catalog='hibridos'),
    field('ciclo', 'Ciclo', 'select', True, options=['Temporal', 'Riego']),
    field('etapa', 'Etapa fenológica', 'select', options=[
        'Emergencia', 'Vegetativo', 'Floración', 'Llenado de grano', 'Madurez']),
    field('altura', 'Altura de planta (cm)', min=0),
    field('tallo', 'Diámetro de tallo (cm)', min=0),
    field('hojas', 'Número de hojas', min=0, step=1),
    field('ndvi', 'NDVI', advanced=True, min=-1, max=1),
    field('humedad', 'Humedad del suelo (%)', advanced=True, min=0, max=100),
    field('temp', 'Temperatura ambiente (°C)', advanced=True, min=-100, max=70),
    field('lluvia', 'Precipitación (mm)', advanced=True, min=0),
    field('rendimiento', 'Rendimiento estimado (t/ha)', min=0),
    field('observaciones', 'Observaciones', 'textarea'),
]


def default_fields():
    return deepcopy(FIELDS)
