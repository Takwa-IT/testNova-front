// src/app/Guards/hr.guard.ts
import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
    providedIn: 'root'
})
export class HRGuard implements CanActivate {
    // Mode développement : désactiver la vérification pour tester le design
    private devMode = true;

    constructor(
        private authService: AuthService,
        private router: Router
    ) { }

    canActivate(): boolean {
        // En mode dev, autoriser l'accès sans vérification
        if (this.devMode) {
            return true;
        }

        // Vérifier si l'utilisateur est authentifié
        if (!this.authService.isAuthenticated()) {
            this.router.navigate(['/login']);
            return false;
        }

        // Vérifier si l'utilisateur a le rôle HR
        const currentUser = this.authService.getCurrentUser();
        if (currentUser && currentUser.roles) {
            const hasHRRole = currentUser.roles.some(role => 
                role === 'ROLE_HR' || 
                role === 'HR' || 
                role === 'ROLE_ADMIN' || 
                role === 'ADMIN'
            );
            
            if (hasHRRole) {
                return true;
            }
        }

        // Rediriger vers la page d'accueil si pas autorisé
        this.router.navigate(['/feed']);
        return false;
    }
}
