// src/app/components/auth/login/login.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  rememberMe = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      motDePasse: ['', [Validators.required, Validators.minLength(6)]]
    });

    // Charger les données sauvegardées si "Remember Me" était coché
    this.loadSavedCredentials();
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      // Sauvegarder les credentials si "Remember Me" est coché
      if (this.rememberMe) {
        this.saveCredentials();
      } else {
        this.clearSavedCredentials();
      }

      console.log('[LoginComponent] Form values:', this.loginForm.value);

      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          console.log('[LoginComponent] ✅ Login success, navigating to /feed');
          this.isLoading = false;
          this.router.navigate(['/feed']);
        },
        error: (error) => {
          console.error('[LoginComponent] ❌ Login error:', error);
          console.error('[LoginComponent] Error status:', error.status);
          console.error('[LoginComponent] Error body:', error.error);
          this.isLoading = false;
          this.errorMessage = error.error?.message || error.error?.error || 'Erreur de connexion';
        }
      });
    }
  }

  toggleRememberMe() {
    this.rememberMe = !this.rememberMe;
  }


  private saveCredentials() {
    const credentials = {
      email: this.loginForm.get('email')?.value,
      rememberMe: true
    };
    localStorage.setItem('testnova_credentials', JSON.stringify(credentials));
  }

  private loadSavedCredentials() {
    const saved = localStorage.getItem('testnova_credentials');
    if (saved) {
      try {
        const credentials = JSON.parse(saved);
        if (credentials.rememberMe && credentials.email) {
          this.loginForm.patchValue({ email: credentials.email });
          this.rememberMe = true;
        }
      } catch (e) {
        console.error('Error loading saved credentials:', e);
      }
    }
  }

  private clearSavedCredentials() {
    localStorage.removeItem('testnova_credentials');
  }

  // Navigation vers la page "Mot de passe oublié"
  onForgotPassword() {
    this.router.navigate(['/forgot-password']);
  }

  // Dans login.component.ts
  navigateToRegister() {
    this.router.navigate(['/register']);
  }

  navigateToFeed() {
    this.router.navigate(['/feed']);
  }
}