import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { TestResult } from '../../../models/test.model';

@Component({
    selector: 'app-profile-test',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './profile-test.component.html',
    styleUrls: ['./profile-test.component.css']
})
export class ProfileTestComponent implements OnInit {
    testResults: TestResult[] = [];
    loading = false;
    errorMessage = '';

    constructor(public authService: AuthService) { }

    ngOnInit(): void {
        this.loadTestResults();
    }

    loadTestResults(): void {
        if (!this.authService.isAuthenticated()) {
            this.errorMessage = 'Utilisateur non connecté';
            return;
        }

        this.loading = true;
        this.errorMessage = '';

        this.authService.getUserTestResults().subscribe({   // ← sans paramètre
            next: (results: TestResult[]) => {
                this.testResults = results;
                this.loading = false;
            },
            error: (error) => {
                console.error('Erreur chargement tests:', error);
                this.errorMessage = 'Impossible de charger vos tests';
                this.loading = false;
            }
        });
    }
}