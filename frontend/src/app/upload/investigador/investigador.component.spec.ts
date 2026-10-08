import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../auth/services/auth.service';
import { Config } from '../services/form-config.service';
import { InvestigadorComponent } from './investigador.component';

@Component({ selector: 'header-1', template: '' })
class TestHeader {}
@Component({ selector: 'footer-1', template: '' })
class TestFooter {}

const config: Config = { id: 1, version: 1, publicado_en: null, fields: [
  { key: 'fecha', label: 'Fecha', type: 'datetime-local', visible: true, required: true, advanced: false },
  { key: 'investigador', label: 'Investigador', type: 'text', visible: true, required: true, readonly: true, advanced: false },
  { key: 'parcela', label: 'Parcela', type: 'text', visible: true, required: true, advanced: false },
  { key: 'rendimiento', label: 'Rendimiento', type: 'number', visible: true, required: false, min: 0, advanced: false },
  { key: 'ndvi', label: 'NDVI', type: 'number', visible: false, required: false, advanced: true },
] };

describe('InvestigadorComponent', () => {
  let http: HttpTestingController;
  let component: InvestigadorComponent;
  const base = `${environment.apiUrl}/captura`;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvestigadorComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([]),
        { provide: AuthService, useValue: { currentUser: () => ({ name: 'Investigadora' }), hasAnyRole: () => false } }],
    }).overrideComponent(InvestigadorComponent, { set: { imports: [ReactiveFormsModule, DatePipe, TestHeader, TestFooter] } }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(InvestigadorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    http.expectOne(`${base}/config/`).flush(config);
    http.expectOne(`${base}/catalogos/`).flush({ municipios: [], hibridos: [] });
  });
  afterEach(() => http.verify());
  it('builds only published visible fields and binds the session author', () => {
    expect(component.form.controls['ndvi']).toBeUndefined();
    expect(component.form.controls['investigador'].disabled).toBe(true);
    expect(component.form.getRawValue()['investigador']).toBe('Investigadora');
  });
  it('does not send invalid forms', () => {
    component.submit();
    http.expectNone(`${base}/registros/`);
    expect(component.form.controls['parcela'].touched).toBe(true);
    expect(component.error()).toContain('Revisa');
  });
  it('retains entered data on failure and clears only after successful persistence', () => {
    component.form.controls['parcela'].setValue('Lote 1');
    component.submit();
    http.expectOne(`${base}/registros/`).flush({}, { status: 500, statusText: 'Error' });
    expect(component.form.controls['parcela'].value).toBe('Lote 1');
    expect(component.notice()).toBe('');
    component.submit();
    http.expectOne(`${base}/registros/`).flush({ id: 42 });
    expect(component.form.controls['parcela'].value).toBe('');
    expect(component.notice()).toContain('#42');
    expect(component.saving()).toBe(false);
  });
  it('saves before showing graphs and prevents duplicate submissions in flight', () => {
    component.form.controls['parcela'].setValue('Lote 1');
    component.submit(true);
    component.submit(true);
    const request = http.expectOne(`${base}/registros/`);
    expect(request.request.body.version_config).toBe(1);
    expect(request.request.body.fecha).toMatch(/Z$/);
    http.expectNone(`${base}/registros/?page=1`);
    request.flush({ id: 43 });
    http.expectOne(`${base}/registros/?page=1`).flush({ count: 1, results: [{ id: 43, datos: { rendimiento: 0 } }] });
    expect(component.showRecords()).toBe(true);
    expect(component.chartRecords().length).toBe(1);
  });
});
