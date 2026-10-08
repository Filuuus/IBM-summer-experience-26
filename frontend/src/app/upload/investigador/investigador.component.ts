import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { Header } from '../../shared/components/header/Header';
import { Footer } from '../../shared/components/footer/Footer';
import { CatalogItem, Catalogs, CaptureRecord, CaptureValues, Config, Field, FormConfigService, captureError } from '../services/form-config.service';
import { AuthService } from '../../auth/services/auth.service';

@Component({
  selector: 'app-investigador',
  imports: [ReactiveFormsModule, DatePipe, Header, Footer],
  templateUrl: './investigador.component.html',
  styleUrls: ['../styles_upload.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvestigadorComponent implements OnInit {
  private readonly service = inject(FormConfigService);
  private readonly router = inject(Router);
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly authService = inject(AuthService);
  readonly config = signal<Config | null>(null);
  readonly fields = computed(() => this.config()?.fields.filter(f => f.visible) ?? []);
  readonly catalogs = signal<Catalogs>({ municipios: [], hibridos: [] });
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal('');
  readonly notice = signal('');
  readonly showRecords = signal(false);
  readonly recordsLoading = signal(false);
  readonly records = signal<CaptureRecord[]>([]);
  readonly total = signal(0);
  readonly page = signal(1);
  readonly chartRecords = computed(() => this.records().filter(record => typeof record.datos['rendimiento'] === 'number'));
  readonly maxYield = computed(() => Math.max(1, ...this.chartRecords().map(record => Number(record.datos['rendimiento']))));
  form = new FormGroup<Record<string, FormControl<string | number | null>>>({});

  ngOnInit(): void { this.load(); }
  load(preserve = false): void {
    const previous = preserve ? this.form.getRawValue() : {};
    this.loading.set(true);
    this.error.set('');
    forkJoin({ config: this.service.getConfig(), catalogs: this.service.getCatalogs() }).subscribe({
      next: ({ config, catalogs }) => {
        this.config.set(config);
        this.catalogs.set(catalogs);
        const controls: Record<string, FormControl<string | number | null>> = {};
        for (const field of config.fields.filter(f => f.visible)) {
          const validators: ValidatorFn[] = field.required ? [Validators.required] : [];
          if (field.min !== undefined) validators.push(Validators.min(field.min));
          if (field.max !== undefined) validators.push(Validators.max(field.max));
          if (field.key === 'hojas') validators.push(control => control.value === '' || control.value === null || Number.isInteger(Number(control.value)) ? null : { integer: true });
          if (field.type === 'text') validators.push(Validators.maxLength(150));
          if (field.type === 'textarea') validators.push(Validators.maxLength(5000));
          controls[field.key] = new FormControl<string | number | null>({ value: previous[field.key] ?? this.initialValue(field), disabled: !!field.readonly }, validators);
        }
        this.form = new FormGroup(controls);
        this.loading.set(false);
      },
      error: error => { this.error.set(captureError(error)); this.loading.set(false); },
    });
  }
  private initialValue(field: Field): string {
    if (field.key === 'investigador') return this.authService.currentUser()?.name || this.authService.currentUser()?.email || '';
    if (field.key === 'fecha') {
      const now = new Date();
      return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    }
    return '';
  }
  options(field: Field): CatalogItem[] { return field.catalog ? this.catalogs()[field.catalog] : []; }
  invalid(key: string): boolean {
    const control = this.form.controls[key];
    return !!control && control.invalid && control.touched;
  }
  clear(): void {
    this.form.reset(Object.fromEntries(this.fields().map(field => [field.key, this.initialValue(field)])));
    this.notice.set('');
    this.error.set('');
  }
  submit(graphs = false): void {
    if (this.saving() || !this.config()) return;
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.error.set('Revisa los campos señalados antes de guardar.');
      const field = this.fields().find(field => this.form.controls[field.key].invalid);
      if (field) this.element.nativeElement.querySelector<HTMLElement>('#' + field.key)?.focus();
      return;
    }
    this.saving.set(true);
    this.error.set('');
    this.notice.set('');
    const payload: CaptureValues = { ...this.form.getRawValue(), version_config: this.config()!.version };
    payload['fecha'] = new Date(String(payload['fecha'])).toISOString();
    this.service.saveRecord(payload).subscribe({
      next: record => {
        this.saving.set(false);
        this.clear();
        this.notice.set(`Registro #${record.id} guardado en la base de datos.`);
        if (graphs || this.showRecords()) { this.showRecords.set(true); this.loadRecords(1); }
      },
      error: error => { this.error.set(captureError(error)); this.saving.set(false); },
    });
  }
  viewRecords(): void { this.showRecords.set(true); this.loadRecords(1); }
  loadRecords(page: number): void {
    this.recordsLoading.set(true);
    this.service.getRecords(page).subscribe({
      next: result => { this.records.set(result.results); this.total.set(result.count); this.page.set(page); this.recordsLoading.set(false); },
      error: error => { this.error.set(captureError(error)); this.recordsLoading.set(false); },
    });
  }
  yieldWidth(record: CaptureRecord): number { return 100 * Number(record.datos['rendimiento']) / this.maxYield(); }
  switchToJefe(): void { this.router.navigate(['/captura/jefe']); }
}
