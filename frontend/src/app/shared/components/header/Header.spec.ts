import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { Header } from './Header';
import { AuthService } from '../../../auth/services/auth.service';
import { ThemeService } from '../../services/theme.service';

describe('Header navigation', () => {
  const authenticated = signal(true);
  const manager = signal(true);
  beforeEach(async () => {
    authenticated.set(true);
    manager.set(true);
    await TestBed.configureTestingModule({
      imports: [Header],
      providers: [provideRouter([]),
        { provide: AuthService, useValue: { isAuthenticated: authenticated, hasAnyRole: () => manager(), logout: vi.fn() } },
        { provide: ThemeService, useValue: { resolvedTheme: signal('light'), getPreferenceLabel: () => 'Sistema', isActive: () => false, setPreference: vi.fn() } },
      ],
    }).compileComponents();
  });
  it('opens mobile navigation and closes it with Escape while restoring focus', () => {
    const fixture = TestBed.createComponent(Header);
    fixture.detectChanges();
    const toggle: HTMLButtonElement = fixture.nativeElement.querySelector('.mobile-toggle');
    toggle.click();
    fixture.detectChanges();
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(fixture.nativeElement.querySelector('nav').classList.contains('is-open')).toBe(true);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
  });
  it('preserves role visibility and closes navigation when following a link', () => {
    const fixture = TestBed.createComponent(Header);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[href="/users-management"]')).not.toBeNull();
    fixture.componentInstance.toggleMobileMenu();
    fixture.detectChanges();
    vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    fixture.nativeElement.querySelector('[href="/about"]').click();
    expect(fixture.componentInstance.isMobileMenuOpen()).toBe(false);
    authenticated.set(false);
    manager.set(false);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[href="/users-management"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('.upload-group')).toBeNull();
    expect(fixture.nativeElement.querySelector('.session-login').textContent).toContain('Iniciar sesión');
  });
  it('closes other dropdowns and dismisses navigation on outside clicks', () => {
    const fixture = TestBed.createComponent(Header);
    fixture.detectChanges();
    fixture.componentInstance.toggleMobileMenu();
    fixture.componentInstance.toggleUploadMenu();
    fixture.componentInstance.toggleThemeMenu();
    expect(fixture.componentInstance.isUploadMenuOpen()).toBe(false);
    document.body.click();
    expect(fixture.componentInstance.isMobileMenuOpen()).toBe(false);
    expect(fixture.componentInstance.isThemeMenuOpen()).toBe(false);
  });
});
