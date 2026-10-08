import { Component, ChangeDetectionStrategy, ElementRef, inject, signal, viewChild } from "@angular/core";
import { NgOptimizedImage } from "@angular/common";
import { A11yModule } from "@angular/cdk/a11y";
import { Router, RouterLink, RouterLinkActive } from "@angular/router";

import { ThemePreference, ThemeService } from "../../services/theme.service";
import { AuthService } from "../../../auth/services/auth.service";

@Component({
  selector: "header-1",

  imports: [NgOptimizedImage, RouterLink, RouterLinkActive, A11yModule],
  styleUrl: "./Header.css",
  templateUrl: "./Header.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "[style.display]": "'contents'",
    "(document:click)": "onDocumentClick()",
    "(document:keydown.escape)": "onEscape()",
  },
})
export class Header {
  readonly isThemeMenuOpen = signal(false);
  readonly isUploadMenuOpen = signal(false);
  readonly isLogoutDialogOpen = signal(false);
  readonly logoutDialogState = signal<"idle" | "confirming" | "canceling">("idle");

  private readonly router = inject(Router);
  readonly themeService = inject(ThemeService);
  readonly authService = inject(AuthService);
  readonly isMobileMenuOpen = signal(false);
  private readonly mobileToggle = viewChild<ElementRef<HTMLButtonElement>>("mobileToggle");

  closeMenus(): void {
    this.isMobileMenuOpen.set(false);
    this.isThemeMenuOpen.set(false);
    this.isUploadMenuOpen.set(false);
  }

  toggleMobileMenu(): void {
    const next = !this.isMobileMenuOpen();
    this.closeMenus();
    this.isMobileMenuOpen.set(next);
  }

  onEscape(): void {
    if (this.isLogoutDialogOpen()) {
      this.onCancelLogout();
      return;
    }
    if (this.isMobileMenuOpen()) this.mobileToggle()?.nativeElement.focus();
    this.closeMenus();
  }

  onHomeClick() {
    this.closeMenus();
    this.router.navigate(["/"]);
  }

  onDashboardClick() {
    this.closeMenus();
    this.router.navigate(["/dashboard"]);
  }

  onAnalyticsClick() {
    this.closeMenus();
    this.router.navigate(["/analytics"]);
  }

  onLoginClick() {
    this.closeMenus();
    this.router.navigate(["/auth/login"]);
  }

  onUsersClick() {
    this.closeMenus();
    this.router.navigate(["/users-management"]);
  }

  onAboutClick() {
    this.closeMenus();
    this.router.navigate(["/about"]);
  }

  onSoilAnalysisClick() {
    this.closeMenus();
    this.router.navigate(["/soil-analysis"]);
  }

  onLogoutClick() {
    this.closeMenus();
    this.logoutDialogState.set("idle");
    this.isLogoutDialogOpen.set(true);
  }

  onCancelLogout() {
    if (this.logoutDialogState() !== "idle") {
      return;
    }
    this.logoutDialogState.set("canceling");
    window.setTimeout(() => {
      this.isLogoutDialogOpen.set(false);
      this.logoutDialogState.set("idle");
    }, 180);
  }

  onConfirmLogout() {
    if (this.logoutDialogState() !== "idle") {
      return;
    }
    this.logoutDialogState.set("confirming");
    window.setTimeout(() => {
      this.isLogoutDialogOpen.set(false);
      this.logoutDialogState.set("idle");
      this.authService.logout();
    }, 260);
  }

  onJefeClick() {
    this.closeMenus();
    this.router.navigate(["/captura/jefe"]);
    this.isUploadMenuOpen.set(false);
  }

  onInvestigadorClick() {
    this.closeMenus();
    this.router.navigate(["/captura/investigador"]);
    this.isUploadMenuOpen.set(false);
  }

  onUploadDataClick() {
    this.onInvestigadorClick();
  }

  setTheme(preference: ThemePreference): void {
    this.themeService.setPreference(preference);
    this.isThemeMenuOpen.set(false);
  }

  toggleThemeMenu(): void {
    this.isThemeMenuOpen.update((current) => !current);
    this.isUploadMenuOpen.set(false);
  }

  toggleUploadMenu(): void {
    this.isUploadMenuOpen.update((current) => !current);
    this.isThemeMenuOpen.set(false);
  }

  onDocumentClick(): void {
    this.closeMenus();
  }
}
