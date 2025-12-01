import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../models/auth.model';

@Component({
  selector: 'app-profile-info',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './profile-info.component.html',
  styleUrl: './profile-info.component.css'
})
export class ProfileInfoComponent implements OnInit {
  user: User | null = null;
  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  
  isEditing = false;
  isChangingPassword = false;
  loading = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    this.initForms();
  }

  initForms(): void {
    this.profileForm = this.fb.group({
      nom: [this.user?.nom || '', [Validators.required, Validators.minLength(2)]],
      prenom: [this.user?.prenom || '', [Validators.required, Validators.minLength(2)]],
      email: [this.user?.email || '', [Validators.required, Validators.email]],
      telephone: [this.user?.telephone || ''],
      ville: [this.user?.ville || ''],
      posteRecherche: [this.user?.posteRecherche || '']
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    });
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    this.successMessage = '';
    this.errorMessage = '';
    
    if (!this.isEditing) {
      // Reset form to original values
      this.profileForm.patchValue({
        nom: this.user?.nom,
        prenom: this.user?.prenom,
        email: this.user?.email
      });
    }
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.errorMessage = 'Veuillez corriger les erreurs du formulaire.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const updatedData = this.profileForm.value;

    this.authService.updateUserProfile(updatedData).subscribe({
      next: () => {
        this.successMessage = 'Profil mis à jour avec succès !';
        this.isEditing = false;
        this.loading = false;
        // Refresh user data
        this.user = this.authService.getCurrentUser();
      },
      error: (err) => {
        console.error('Erreur mise à jour profil:', err);
        this.errorMessage = 'Erreur lors de la mise à jour du profil.';
        this.loading = false;
      }
    });
  }

  togglePasswordChange(): void {
    this.isChangingPassword = !this.isChangingPassword;
    this.passwordForm.reset();
    this.successMessage = '';
    this.errorMessage = '';
  }

  changePassword(): void {
    if (this.passwordForm.invalid) {
      this.errorMessage = 'Veuillez remplir tous les champs.';
      return;
    }

    const { currentPassword, newPassword, confirmPassword } = this.passwordForm.value;

    if (newPassword !== confirmPassword) {
      this.errorMessage = 'Les mots de passe ne correspondent pas.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.changePassword(currentPassword, newPassword).subscribe({
      next: () => {
        this.successMessage = 'Mot de passe modifié avec succès !';
        this.isChangingPassword = false;
        this.loading = false;
        this.passwordForm.reset();
      },
      error: (err) => {
        console.error('Erreur changement mot de passe:', err);
        this.errorMessage = err.error?.error || 'Erreur lors du changement de mot de passe.';
        this.loading = false;
      }
    });
  }

  getRoleLabel(): string {
    if (!this.user?.roles) return 'Utilisateur';
    if (this.user.roles.includes('ROLE_HR')) return 'Recruteur';
    if (this.user.roles.includes('ROLE_CANDIDAT')) return 'Candidat';
    return 'Utilisateur';
  }

  getInitials(): string {
    if (!this.user) return '?';
    const first = this.user.prenom?.charAt(0) || '';
    const last = this.user.nom?.charAt(0) || '';
    return (first + last).toUpperCase();
  }
}
