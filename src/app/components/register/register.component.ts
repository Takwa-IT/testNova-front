// src/app/components/auth/register/register.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { of, EMPTY } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  emailChecking = false;
  emailExists = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      nom: ['', [Validators.required]],
      prenom: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      motDePasse: ['', [Validators.required, Validators.minLength(6)]],
      role: ['CANDIDAT', [Validators.required]]
    });

    // Vérification email en temps réel
    this.registerForm.get('email')?.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap(email => {
        if (this.registerForm.get('email')?.valid && email) {
          this.emailChecking = true;
          this.emailExists = false;
          return this.authService.checkEmail(email).pipe(
            catchError(() => {
              this.emailChecking = false;
              this.emailExists = false;
              return of({ exists: false });
            })
          );
        } else {
          this.emailChecking = false;
          this.emailExists = false;
          return EMPTY;
        }
      })
    ).subscribe({
      next: (response) => {
        this.emailChecking = false;
        this.emailExists = response.exists;
      },
      error: () => {
        this.emailChecking = false;
        this.emailExists = false;
      }
    });
  }

  onSubmit() {
    if (this.registerForm.valid && !this.emailExists) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      this.authService.register(this.registerForm.value).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.successMessage = 'Compte créé ! Vérifiez votre email pour activer votre compte.';
          // Ne pas rediriger automatiquement, laisser l'utilisateur voir le message
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || error.error?.error || 'Erreur lors de la création du compte';
        }
      });
    } else {
      this.errorMessage = 'Veuillez corriger les erreurs dans le formulaire';
    }
  }
  // Dans register.component.ts
  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  navigateToFeed() {
    this.router.navigate(['/feed']);
  }
}