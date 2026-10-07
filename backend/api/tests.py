from datetime import date

from django.test import TestCase
from rest_framework.test import APIRequestFactory

from .models import Ciclo, Estado, Hibrido, Municipio, ResultadoLaboratorio, Terreno
from .utils.location_recommender import cargar_historial_regional, calcular_relevancia_regional
from .views import OptimizarSemillaView


class OptimizarSemillaTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.estado = Estado.objects.create(nombre='Jalisco')
        cls.municipio = Municipio.objects.create(estado=cls.estado, nombre='Tepatitlán de Morelos')
        cls.vecino = Municipio.objects.create(estado=cls.estado, nombre='Arandas')
        cls.local = Terreno.objects.create(municipio=cls.municipio, latitud_gps=20.8, longitud_gps=-102.7, altitud=1800)
        cls.regional = Terreno.objects.create(municipio=cls.vecino, latitud_gps=20.7, longitud_gps=-102.3, altitud=1900)
        cls.hibrido = cls.agregar_hibrido('Inicial')

    @classmethod
    def agregar_hibrido(cls, nombre):
        hibrido = Hibrido.objects.create(nombre=nombre)
        for terreno in (cls.local, cls.regional):
            ciclo = Ciclo.objects.create(
                hibrido=hibrido, terreno=terreno, year=2024, condicion='Riego',
                fecha_siembra=date(2024, 5, 15), fecha_cosecha=date(2024, 9, 15),
            )
            ResultadoLaboratorio.objects.create(ciclo=ciclo, rms=24, ms=35, pc=8.5, gc=3.2, cen=4, fdn=42)
        return hibrido

    def consultar(self, **ubicacion):
        request = APIRequestFactory().post('/optimizar-semilla/', {'regimen_hidrico': 'Riego', **ubicacion}, format='json')
        return OptimizarSemillaView.as_view()(request)

    def test_historial_se_carga_en_una_consulta_y_calculo_no_consulta_bd(self):
        with self.assertNumQueries(1):
            historial = cargar_historial_regional([self.hibrido.pk])
        with self.assertNumQueries(0):
            relevancia = calcular_relevancia_regional(
                self.hibrido.pk, self.estado.pk, self.municipio.pk,
                20.8, -102.7, 1800, historial=historial[self.hibrido.pk],
            )
        self.assertEqual(relevancia['muestras_locales'], 1)
        self.assertEqual(relevancia['muestras_regionales'], 1)
        self.assertEqual(relevancia['desglose_scores'], {'local': 55.0, 'regional': 63.2, 'climatico': 100.0, 'altitud': 100.0})
        self.assertEqual(relevancia['score'], 71.0)

    def test_consultas_no_crecen_con_numero_de_hibridos(self):
        ubicacion = {'estado_id': self.estado.pk, 'municipio_id': self.municipio.pk}
        with self.assertNumQueries(4):
            respuesta = self.consultar(**ubicacion)
        self.assertEqual(respuesta.status_code, 200)
        for indice in range(10):
            self.agregar_hibrido(f'Híbrido {indice}')
        with self.assertNumQueries(4):
            respuesta = self.consultar(**ubicacion)
        self.assertEqual(respuesta.status_code, 200)
        self.assertEqual(len(respuesta.data), 11)
        self.assertTrue(all('relevancia_regional' in h for h in respuesta.data))

    def test_sin_ubicacion(self):
        with self.assertNumQueries(2):
            respuesta = self.consultar()
        self.assertEqual(respuesta.status_code, 200)
        self.assertNotIn('relevancia_regional', respuesta.data[0])

    def test_solo_estado(self):
        with self.assertNumQueries(3):
            respuesta = self.consultar(estado_id=self.estado.pk)
        self.assertEqual(respuesta.status_code, 200)
        self.assertEqual(respuesta.data[0]['relevancia_regional']['muestras_regionales'], 2)

    def test_municipio_sin_historial(self):
        municipio = Municipio.objects.create(estado=self.estado, nombre='Sin muestras')
        respuesta = self.consultar(estado_id=self.estado.pk, municipio_id=municipio.pk)
        self.assertEqual(respuesta.status_code, 200)
        self.assertEqual(respuesta.data[0]['relevancia_regional']['muestras_locales'], 0)

    def test_identificadores_invalidos(self):
        for valor in ('invalido', -1, 0, {}):
            with self.assertNumQueries(0):
                respuesta = self.consultar(municipio_id=valor)
            self.assertEqual(respuesta.status_code, 400)
