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
        const currentUser = this.authService.getCurrentUser();
        if (!currentUser || !currentUser.id) {
            this.errorMessage = 'Utilisateur non connecté';
            return;
        }

        this.loading = true;
        this.errorMessage = '';

        this.authService.getUserTestResults(currentUser.id).subscribe({
            next: (results: TestResult[]) => {
                this.testResults = results;
                this.loading = false;
            },
            error: (error) => {
                console.error('Erreur lors du chargement des tests:', error);
                this.errorMessage = 'Erreur lors du chargement des tests';
                this.loading = false;
            }
        });
    }
}
