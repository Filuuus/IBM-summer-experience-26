import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { environment } from '../../../environments/environment';
import { Config } from '../services/form-config.service';
import { JefeComponent } from './jefe.component';

@Component({ selector: 'header-1', template: '' })
class TestHeader {}
@Component({ selector: 'footer-1', template: '' })
class TestFooter {}

const config: Config = { id: 1, version: 1, publicado_en: null, fields: [
  { key: 'parcela', label: 'Parcela', type: 'text', visible: true, required: true, advanced: false },
  { key: 'ndvi', label: 'NDVI', type: 'number', visible: false, required: false, advanced: true },
] };

describe('JefeComponent', () => {
  let http: HttpTestingController;
  let component: JefeComponent;
  const url = `${environment.apiUrl}/captura/config/`;
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [JefeComponent], providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])] })
      .overrideComponent(JefeComponent, { set: { imports: [ReactiveFormsModule, TestHeader, TestFooter] } }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(JefeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    http.expectOne(`${url}?draft=1`).flush(config);
  });
  afterEach(() => http.verify());
  it('protects required fields and edits optional visibility without publishing', () => {
    component.toggle('parcela');
    expect(component.visible().length).toBe(1);
    component.toggle('ndvi');
    expect(component.visible().length).toBe(2);
    http.expectNone(url);
  });
  it('filters fields by search and category', () => {
    component.search.setValue('ndvi');
    expect(component.filtered().map(f => f.key)).toEqual(['ndvi']);
    component.filter.set('Obligatorios');
    expect(component.filtered()).toEqual([]);
  });
  it('sends distinct save and publication actions and reports only successful publication', () => {
    component.save('save');
    let request = http.expectOne(url);
    expect(request.request.body.action).toBe('save');
    request.flush(config);
    expect(component.notice()).toContain('Borrador guardado');
    component.save('publish');
    request = http.expectOne(url);
    expect(request.request.body.action).toBe('publish');
    request.flush({ ...config, version: 2 });
    expect(component.notice()).toContain('Versión 2');
  });
});
