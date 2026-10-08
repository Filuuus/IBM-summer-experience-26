import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Field {
  key: string;
  label: string;
  type: string;
  visible: boolean;
  required: boolean;
  advanced: boolean;
  readonly?: boolean;
  catalog?: 'municipios' | 'hibridos';
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
}
export interface Config {
  id: number;
  fields: Field[];
  version: number;
  publicado_en: string | null;
}
export interface CatalogItem {
  id: number;
  nombre: string;
  estado__nombre?: string;
  marca?: string | null;
}
export interface Catalogs { municipios: CatalogItem[]; hibridos: CatalogItem[]; }
export type CaptureValues = Record<string, string | number | null>;
export interface CaptureRecord {
  id: number;
  fecha: string;
  investigador_nombre: string;
  municipio_nombre: string;
  parcela: string;
  hibrido_nombre: string;
  ciclo: string;
  datos: CaptureValues;
}
export interface RecordPage { count: number; results: CaptureRecord[]; }

export function captureError(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) return 'No se pudo completar la operación.';
  if (error.status === 0) return 'No se pudo conectar con el servidor. Comprueba tu conexión.';
  if (error.status === 401) return 'Tu sesión expiró. Inicia sesión nuevamente.';
  if (error.status === 403) return 'No tienes permiso para esta operación.';
  if (error.status >= 500) return 'El servidor no pudo completar la operación. Intenta nuevamente.';
  const body: unknown = error.error;
  if (typeof body === 'object' && body !== null) {
    return Object.entries(body).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(' ') : String(value)}`).join(' ');
  }
  return 'No se pudo completar la operación.';
}

@Injectable({ providedIn: 'root' })
export class FormConfigService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/captura`;
  getConfig(draft = false): Observable<Config> {
    return this.http.get<Config>(`${this.base}/config/`, { params: draft ? { draft: '1' } : {} });
  }
  updateConfig(config: Config, action: 'save' | 'publish' | 'reset'): Observable<Config> {
    return this.http.put<Config>(`${this.base}/config/`, {
      fields: config.fields.map(({ key, visible }) => ({ key, visible })), action,
    });
  }
  getCatalogs(): Observable<Catalogs> { return this.http.get<Catalogs>(`${this.base}/catalogos/`); }
  saveRecord(data: CaptureValues): Observable<CaptureRecord> {
    return this.http.post<CaptureRecord>(`${this.base}/registros/`, data);
  }
  getRecords(page = 1): Observable<RecordPage> {
    return this.http.get<RecordPage>(`${this.base}/registros/`, { params: { page } });
  }
}
