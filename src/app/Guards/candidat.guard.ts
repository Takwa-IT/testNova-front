// src/app/Guards/candidat.guard.ts
import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
    providedIn: 'root'
})
export class CandidatGuard implements CanActivate {
    constructor(
        private authService: AuthService,
        private router: Router
    ) { }

    canActivate(): boolean {
        // Vérifier si l'utilisateur est authentifié
        if (!this.authService.isAuthenticated()) {
            this.router.navigate(['/login']);
            return false;
        }

        // Vérifier si l'utilisateur est un Candidat
        if (this.authService.isCandidat()) {
            return true;
        }

        // Si c'est un HR, rediriger vers le dashboard HR
        if (this.authService.isHR()) {
            this.router.navigate(['/hr-dashboard']);
            return false;
        }

        // Sinon, rediriger vers login
        this.router.navigate(['/login']);
        return false;
    }
}
