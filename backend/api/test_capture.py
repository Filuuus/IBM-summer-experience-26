from django.test import TestCase
from rest_framework.test import APIClient
from .capture_schema import default_fields
from .models import RegistroCaptura, UsuarioCustom, Estado, Municipio, Hibrido


class CaptureTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.researcher = UsuarioCustom.objects.create_user(username='researcher', email='researcher@example.test', role='INVESTIGADOR')
        cls.other = UsuarioCustom.objects.create_user(username='other', email='other@example.test', role='INVESTIGADOR')
        cls.boss = UsuarioCustom.objects.create_user(username='boss', email='boss@example.test', role='JEFE')
        cls.admin = UsuarioCustom.objects.create_user(username='admin', email='admin@example.test', role='SADMIN')
        state = Estado.objects.create(nombre='Jalisco')
        cls.municipality = Municipio.objects.create(nombre='Acatic', estado=state)
        cls.hybrid = Hibrido.objects.create(nombre='Maíz de prueba', marca='Prueba')

    def setUp(self):
        self.client = APIClient()
        self.client.force_authenticate(self.researcher)
        self.payload = dict(fecha='2026-10-07T10:30:00-06:00', municipio=self.municipality.pk,
                            parcela='Lote 1', hibrido=self.hybrid.pk, ciclo='Temporal',
                            rendimiento=8.7, humedad=32.5, hojas=14, version_config=1)

    def post(self, **overrides):
        return self.client.post('/api/captura/registros/', dict(self.payload, **overrides), format='json')

    def config(self):
        return self.client.get('/api/captura/config/').json()

    def change_config(self, fields, action='publish'):
        return self.client.put('/api/captura/config/', dict(fields=fields, action=action), format='json')

    def test_real_persistence_and_server_owned_author(self):
        response = self.post(investigador='Otra persona')
        self.assertEqual(response.status_code, 201, response.data)
        record = RegistroCaptura.objects.get(pk=response.data['id'])
        self.assertEqual(record.investigador, self.researcher)
        self.assertEqual(record.investigador_nombre, self.researcher.email)
        self.assertEqual(record.datos['rendimiento'], 8.7)
        self.assertEqual(record.municipio, self.municipality)
        self.assertEqual(record.hibrido, self.hybrid)
        self.assertEqual(record.fecha.isoformat(), '2026-10-07T16:30:00+00:00')

    def test_authentication_required(self):
        self.client.force_authenticate(None)
        for endpoint in ['config', 'catalogos', 'registros']:
            self.assertEqual(self.client.get(f'/api/captura/{endpoint}/').status_code, 401)
        self.assertEqual(self.post().status_code, 401)

    def test_researcher_cannot_read_draft_or_write_config(self):
        self.assertEqual(self.change_config(self.config()['fields']).status_code, 403)
        self.assertEqual(self.client.get('/api/captura/config/?draft=1').status_code, 403)

    def test_save_reset_and_publish_are_distinct(self):
        fields = self.config()['fields']
        self.client.force_authenticate(self.boss)
        for field in fields:
            if field['key'] == 'ndvi':
                field['visible'] = True
        self.assertEqual(self.change_config(fields, 'save').status_code, 200)
        self.assertFalse(next(f for f in self.config()['fields'] if f['key'] == 'ndvi')['visible'])
        self.assertEqual(self.change_config(fields).status_code, 200)
        published = self.config()
        self.assertEqual(published['version'], 2)
        self.assertTrue(next(f for f in published['fields'] if f['key'] == 'ndvi')['visible'])
        self.change_config(fields, 'reset')
        self.assertEqual(self.config(), published)
        draft = self.client.get('/api/captura/config/?draft=1').json()
        self.assertFalse(next(f for f in draft['fields'] if f['key'] == 'ndvi')['visible'])

    def test_required_fields_and_schema_are_protected(self):
        self.client.force_authenticate(self.boss)
        for fields in [default_fields()[:-1], default_fields() + [default_fields()[0]], [dict(f, visible=False) for f in default_fields()]]:
            self.assertEqual(self.change_config(fields).status_code, 400)
        fields = default_fields()
        fields[0]['required'] = False
        fields[0]['label'] = 'Untrusted label'
        response = self.change_config(fields)
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data['fields'][0]['required'])
        self.assertNotEqual(response.data['fields'][0]['label'], 'Untrusted label')

    def test_invalid_records_do_not_write(self):
        for overrides in [dict(humedad=101), dict(ndvi=.8), dict(hojas=1.5), dict(rendimiento=-1),
                          dict(altura='NaN'), dict(tallo=True), dict(temp='Infinity'), dict(municipio=99999),
                          dict(hibrido=99999), dict(ciclo='Otro'), dict(fecha='bad'), dict(parcela=''),
                          dict(version_config=99), dict(etapa='Otra'), dict(unknown='ignored?')]:
            with self.subTest(overrides=overrides):
                self.assertEqual(self.post(**overrides).status_code, 400)
        self.assertEqual(RegistroCaptura.objects.count(), 0)

    def test_zero_and_optional_empty_values(self):
        response = self.post(rendimiento=0, humedad=0, hojas=0, altura='', observaciones='')
        self.assertEqual(response.status_code, 201, response.data)
        self.assertEqual(response.data['datos']['rendimiento'], 0)
        self.assertNotIn('altura', response.data['datos'])

    def test_configuration_change_rejects_old_forms(self):
        self.config()
        self.client.force_authenticate(self.boss)
        self.change_config(default_fields())
        self.client.force_authenticate(self.researcher)
        self.assertEqual(self.post().status_code, 400)
        self.assertEqual(RegistroCaptura.objects.count(), 0)

    def test_catalogs_use_database(self):
        response = self.client.get('/api/captura/catalogos/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['municipios'][0]['id'], self.municipality.pk)
        self.assertEqual(response.data['hibridos'][0]['id'], self.hybrid.pk)

    def test_role_scoped_records_and_pagination(self):
        first = self.post().data['id']
        self.client.force_authenticate(self.other)
        second = self.post().data['id']
        response = self.client.get('/api/captura/registros/').data
        self.assertEqual(response['count'], 1)
        self.assertEqual(response['results'][0]['id'], second)
        for user in [self.boss, self.admin]:
            self.client.force_authenticate(user)
            response = self.client.get('/api/captura/registros/').data
            self.assertEqual(response['count'], 2)
            self.assertEqual({r['id'] for r in response['results']}, {first, second})
        self.assertEqual(self.client.get('/api/captura/registros/?page=2').data['results'], [])
        self.assertEqual(self.client.get('/api/captura/registros/?page=bad').status_code, 400)
