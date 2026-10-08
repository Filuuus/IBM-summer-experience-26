import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SoilAnalysisComponent } from './soil-analysis.component';
import { ApiService } from '../services/api.service';
import { Header } from '../shared/components/header/Header';
import { Footer } from '../shared/components/footer/Footer';

describe('Soil analysis submit button', () => {
  it('keeps a single label and icon across repeated loading transitions', async () => {
    await TestBed.configureTestingModule({
      imports: [SoilAnalysisComponent],
      providers: [{ provide: ApiService, useValue: {} }],
    }).overrideComponent(SoilAnalysisComponent, {
      remove: { imports: [Header, Footer] },
      add: { schemas: [NO_ERRORS_SCHEMA] },
    }).compileComponents();
    vi.spyOn(SoilAnalysisComponent.prototype, 'ngOnInit').mockImplementation(() => {});
    vi.spyOn(SoilAnalysisComponent.prototype, 'ngAfterViewInit').mockImplementation(() => {});
    const fixture = TestBed.createComponent(SoilAnalysisComponent);
    // Avoid unrelated header/footer dependencies while retaining the real button template.
    fixture.detectChanges();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button[type="submit"]');
    for (const loading of [false, true, false, true, false]) {
      fixture.componentInstance.loading = loading;
      fixture.changeDetectorRef.detectChanges();
      expect(button.textContent?.trim()).toBe(loading ? 'Analizando...' : 'Analizar Parcela');
      expect(button.querySelectorAll('svg').length).toBe(1);
      expect(button.disabled).toBe(loading);
      expect(button.getAttribute('aria-busy')).toBe(String(loading));
    }
    fixture.destroy();
    vi.restoreAllMocks();
  });
});
