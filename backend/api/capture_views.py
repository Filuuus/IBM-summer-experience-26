import math

from django.db import transaction
from django.utils import timezone
from rest_framework import serializers, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .capture_schema import FIELDS, default_fields
from .models import ConfiguracionCaptura, RegistroCaptura, Municipio, Hibrido
from .permissions import IsInvestigadorOrHigher, IsJefeOrSadmin


def configuration():
    return ConfiguracionCaptura.objects.get_or_create(
        clave='investigador', defaults={'borrador': default_fields(), 'publicados': default_fields()})[0]


def config_payload(config, draft=False):
    return dict(id=config.pk, fields=config.borrador if draft else config.publicados,
                version=config.version, publicado_en=config.publicado_en)


class FieldVisibilitySerializer(serializers.Serializer):
    key = serializers.ChoiceField(choices=[f['key'] for f in FIELDS])
    visible = serializers.BooleanField()


class ConfigurationUpdateSerializer(serializers.Serializer):
    fields = FieldVisibilitySerializer(many=True)
    action = serializers.ChoiceField(choices=['save', 'publish', 'reset'])

    def validate_fields(self, value):
        keys = [f['key'] for f in value]
        if len(keys) != len(FIELDS) or set(keys) != {f['key'] for f in FIELDS}:
            raise serializers.ValidationError('Envía todos los campos una sola vez.')
        visibility = {f['key']: f['visible'] for f in value}
        if any(f['required'] and not visibility[f['key']] for f in FIELDS):
            raise serializers.ValidationError('Los campos obligatorios deben permanecer visibles.')
        return [dict(f, visible=visibility[f['key']]) for f in default_fields()]


class CaptureConfigView(APIView):
    permission_classes = [IsInvestigadorOrHigher]

    def get(self, request):
        draft = request.query_params.get('draft') == '1'
        if draft and not request.user.is_jefe_or_higher:
            return Response(status=status.HTTP_403_FORBIDDEN)
        return Response(config_payload(configuration(), draft))

    def put(self, request):
        if not IsJefeOrSadmin().has_permission(request, self):
            return Response(status=status.HTTP_403_FORBIDDEN)
        serializer = ConfigurationUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        config = configuration()
        with transaction.atomic():
            config = ConfiguracionCaptura.objects.select_for_update().get(pk=config.pk)
            action = serializer.validated_data['action']
            config.borrador = default_fields() if action == 'reset' else serializer.validated_data['fields']
            config.actualizado_por = request.user
            if action == 'publish':
                config.publicados = config.borrador
                config.version += 1
                config.publicado_en = timezone.now()
            config.save()
        return Response(config_payload(config, True))


class CaptureCatalogView(APIView):
    permission_classes = [IsInvestigadorOrHigher]

    def get(self, request):
        return Response({
            'municipios': list(Municipio.objects.order_by('estado__nombre', 'nombre').values(
                'id', 'nombre', 'estado__nombre')),
            'hibridos': list(Hibrido.objects.order_by('nombre').values('id', 'nombre', 'marca')),
        })


class CaptureRecordSerializer(serializers.ModelSerializer):
    municipio_nombre = serializers.CharField(source='municipio.nombre', read_only=True)
    hibrido_nombre = serializers.CharField(source='hibrido.nombre', read_only=True)

    class Meta:
        model = RegistroCaptura
        fields = ['id', 'fecha', 'investigador_nombre', 'municipio', 'municipio_nombre',
                  'parcela', 'hibrido', 'hibrido_nombre', 'ciclo', 'datos', 'version_config', 'creado_en']
        read_only_fields = fields


class CaptureInputSerializer(serializers.Serializer):
    fecha = serializers.DateTimeField()
    municipio = serializers.PrimaryKeyRelatedField(queryset=Municipio.objects.all())
    parcela = serializers.CharField(max_length=150)
    hibrido = serializers.PrimaryKeyRelatedField(queryset=Hibrido.objects.all())
    ciclo = serializers.ChoiceField(choices=['Temporal', 'Riego'])
    version_config = serializers.IntegerField(min_value=1)

    def validate(self, attrs):
        config = self.context['config']
        if attrs['version_config'] != config.version:
            raise serializers.ValidationError({'version_config': 'La configuración cambió. Recarga el formulario.'})
        allowed = {f['key'] for f in config.publicados if f['visible']}
        unknown = set(self.initial_data) - allowed - {'version_config'}
        if unknown:
            raise serializers.ValidationError({key: 'Campo oculto o desconocido.' for key in sorted(unknown)})
        extra = {}
        errors = {}
        for field in config.publicados:
            key = field['key']
            if not field['visible'] or key in self.fields or key == 'investigador':
                continue
            value = self.initial_data.get(key)
            if value is None or value == '':
                continue
            try:
                if field['type'] == 'number':
                    if isinstance(value, bool):
                        raise ValueError()
                    value = float(value)
                    if not math.isfinite(value) or value < field.get('min', -math.inf) or value > field.get('max', math.inf):
                        raise ValueError()
                    if key == 'hojas' and not value.is_integer():
                        raise ValueError()
                elif field['type'] == 'select':
                    if value not in field['options']:
                        raise ValueError()
                elif not isinstance(value, str) or len(value) > 5000:
                    raise ValueError()
                extra[key] = value
            except (ValueError, TypeError, OverflowError):
                errors[key] = 'Valor inválido o fuera de rango.'
        if errors:
            raise serializers.ValidationError(errors)
        attrs['datos'] = extra
        return attrs


class CaptureRecordsView(APIView):
    permission_classes = [IsInvestigadorOrHigher]

    def get(self, request):
        records = RegistroCaptura.objects.select_related('municipio', 'hibrido')
        if not request.user.is_jefe_or_higher:
            records = records.filter(investigador=request.user)
        # Bounded pages; newest records first.
        try:
            page = max(1, int(request.query_params.get('page', 1)))
        except ValueError:
            return Response({'detail': 'Página inválida.'}, status=400)
        offset = (page - 1) * 50
        return Response({'count': records.count(), 'results': CaptureRecordSerializer(records[offset:offset + 50], many=True).data})

    def post(self, request):
        with transaction.atomic():
            config = configuration()
            config = ConfiguracionCaptura.objects.select_for_update().get(pk=config.pk)
            serializer = CaptureInputSerializer(data=request.data, context={'config': config})
            serializer.is_valid(raise_exception=True)
            record = RegistroCaptura.objects.create(
                **serializer.validated_data, investigador=request.user,
                investigador_nombre=request.user.get_full_name() or request.user.email)
        return Response(CaptureRecordSerializer(record).data, status=status.HTTP_201_CREATED)
