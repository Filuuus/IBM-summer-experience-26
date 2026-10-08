import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { Header } from '../../shared/components/header/Header';
import { Footer } from '../../shared/components/footer/Footer';
import { Config, FormConfigService, captureError } from '../services/form-config.service';

@Component({
  selector: 'app-jefe',
  imports: [ReactiveFormsModule, Header, Footer],
  templateUrl: './jefe.component.html',
  styleUrls: ['../styles_upload.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JefeComponent implements OnInit {
  private readonly service = inject(FormConfigService);
  private readonly router = inject(Router);
  readonly config = signal<Config | null>(null);
  readonly loading = signal(true);
  readonly busy = signal(false);
  readonly error = signal('');
  readonly notice = signal('');
  readonly dirty = signal(false);
  readonly search = new FormControl('', { nonNullable: true });
  private readonly query = toSignal(this.search.valueChanges, { initialValue: '' });
  readonly filter = signal('Todos');
  readonly filters = ['Todos', 'Obligatorios', 'Opcionales', 'Avanzados'];
  readonly visible = computed(() => this.config()?.fields.filter(f => f.visible) ?? []);
  readonly filtered = computed(() => this.config()?.fields.filter(field => {
    const matches = field.label.toLocaleLowerCase().includes(this.query().toLocaleLowerCase());
    return matches && (this.filter() === 'Todos' || this.filter() === 'Obligatorios' && field.required || this.filter() === 'Opcionales' && !field.required || this.filter() === 'Avanzados' && field.advanced);
  }) ?? []);

  ngOnInit(): void { this.load(); }
  load(): void {
    this.loading.set(true);
    this.error.set('');
    this.service.getConfig(true).subscribe({
      next: config => { this.config.set(config); this.loading.set(false); this.dirty.set(false); },
      error: error => { this.error.set(captureError(error)); this.loading.set(false); },
    });
  }
  toggle(key: string): void {
    this.config.update(config => config ? { ...config, fields: config.fields.map(field => field.key === key && !field.required ? { ...field, visible: !field.visible } : field) } : null);
    this.dirty.set(true);
    this.notice.set('');
  }
  save(action: 'save' | 'publish' | 'reset'): void {
    const config = this.config();
    if (!config || this.busy()) return;
    this.busy.set(true);
    this.error.set('');
    this.notice.set('');
    this.service.updateConfig(config, action).subscribe({
      next: result => {
        this.config.set(result);
        this.dirty.set(false);
        this.busy.set(false);
        this.notice.set(action === 'publish' ? `Cambios publicados. Versión ${result.version}.` : action === 'reset' ? 'Borrador restablecido. Publícalo para aplicarlo al equipo.' : 'Borrador guardado. Publícalo para aplicarlo al equipo.');
      },
      error: error => { this.error.set(captureError(error)); this.busy.set(false); },
    });
  }
  switchToInvestigador(): void { this.router.navigate(['/captura/investigador']); }
}
