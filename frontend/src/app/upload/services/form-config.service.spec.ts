import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../../environments/environment';
import { Config, FormConfigService } from './form-config.service';

const config: Config = { id: 1, version: 1, publicado_en: null, fields: [
  { key: 'ndvi', label: 'NDVI', type: 'number', visible: false, required: false, advanced: true },
] };

describe('FormConfigService', () => {
  let service: FormConfigService;
  let http: HttpTestingController;
  const base = `${environment.apiUrl}/captura`;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(FormConfigService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  it('loads the published configuration and the separate draft', () => {
    service.getConfig().subscribe(result => expect(result.version).toBe(1));
    http.expectOne(`${base}/config/`).flush(config);
    service.getConfig(true).subscribe();
    const request = http.expectOne(`${base}/config/?draft=1`);
    expect(request.request.method).toBe('GET');
    request.flush(config);
  });
  it('publishes only field visibility and the explicit action', () => {
    service.updateConfig(config, 'publish').subscribe();
    const request = http.expectOne(`${base}/config/`);
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual({ fields: [{ key: 'ndvi', visible: false }], action: 'publish' });
    request.flush(config);
  });
  it('sends a record to the server and propagates validation errors', () => {
    let failed = false;
    service.saveRecord({ parcela: 'Lote', version_config: 1 }).subscribe({ error: () => { failed = true; } });
    const request = http.expectOne(`${base}/registros/`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ parcela: 'Lote', version_config: 1 });
    request.flush({ fecha: ['Requerida'] }, { status: 400, statusText: 'Bad Request' });
    expect(failed).toBe(true);
  });
  it('loads persisted catalogs and paginated records', () => {
    service.getCatalogs().subscribe();
    http.expectOne(`${base}/catalogos/`).flush({ municipios: [], hibridos: [] });
    service.getRecords(2).subscribe(result => expect(result.count).toBe(51));
    http.expectOne(`${base}/registros/?page=2`).flush({ count: 51, results: [] });
  });
});
