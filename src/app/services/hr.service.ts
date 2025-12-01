// src/app/services/hr.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Candidate, CandidateDecision, CandidateStatus, HRDashboardStats } from '../models/hr.model';
import { ApiService } from './api.service';

@Injectable({
    providedIn: 'root'
})
export class HRService {
    // Mode mock pour tester sans backend
    private useMockData = true;

    // Données mockées pour les tests
    private mockCandidates: Candidate[] = [
        {
            id: 1,
            nom: 'Dupont',
            prenom: 'Jean',
            email: 'jean.dupont@email.com',
            telephone: '0612345678',
            ville: 'Paris',
            score: 92,
            poste: 'Développeur Frontend Angular',
            dateApplication: new Date('2025-11-25'),
            status: CandidateStatus.PENDING
        },
        {
            id: 2,
            nom: 'Martin',
            prenom: 'Marie',
            email: 'marie.martin@email.com',
            telephone: '0623456789',
            ville: 'Lyon',
            score: 78,
            poste: 'Designer UX/UI',
            dateApplication: new Date('2025-11-24'),
            status: CandidateStatus.PENDING
        },
        {
            id: 3,
            nom: 'Bernard',
            prenom: 'Pierre',
            email: 'pierre.bernard@email.com',
            telephone: '0634567890',
            ville: 'Marseille',
            score: 85,
            poste: 'Développeur Backend Java',
            dateApplication: new Date('2025-11-23'),
            status: CandidateStatus.ACCEPTED
        },
        {
            id: 4,
            nom: 'Dubois',
            prenom: 'Sophie',
            email: 'sophie.dubois@email.com',
            telephone: '0645678901',
            ville: 'Toulouse',
            score: 45,
            poste: 'Chef de Projet IT',
            dateApplication: new Date('2025-11-22'),
            status: CandidateStatus.REJECTED
        },
        {
            id: 5,
            nom: 'Leroy',
            prenom: 'Thomas',
            email: 'thomas.leroy@email.com',
            telephone: '0656789012',
            ville: 'Nice',
            score: 67,
            poste: 'DevOps Engineer',
            dateApplication: new Date('2025-11-21'),
            status: CandidateStatus.PENDING
        },
        {
            id: 6,
            nom: 'Moreau',
            prenom: 'Emma',
            email: 'emma.moreau@email.com',
            telephone: '0667890123',
            ville: 'Bordeaux',
            score: 88,
            poste: 'Data Scientist',
            dateApplication: new Date('2025-11-20'),
            status: CandidateStatus.PENDING
        },
        {
            id: 7,
            nom: 'Garcia',
            prenom: 'Lucas',
            email: 'lucas.garcia@email.com',
            telephone: '0678901234',
            ville: 'Lille',
            score: 55,
            poste: 'Développeur Frontend Angular',
            dateApplication: new Date('2025-11-19'),
            status: CandidateStatus.REJECTED
        },
        {
            id: 8,
            nom: 'Petit',
            prenom: 'Chloé',
            email: 'chloe.petit@email.com',
            telephone: '0689012345',
            ville: 'Nantes',
            score: 73,
            poste: 'Product Owner',
            dateApplication: new Date('2025-11-18'),
            status: CandidateStatus.ACCEPTED
        }
    ];

    constructor(
        private http: HttpClient,
        private apiService: ApiService
    ) { }

    /**
     * Récupère la liste de tous les candidats
     */
    getCandidates(): Observable<Candidate[]> {
        if (this.useMockData) {
            return of([...this.mockCandidates]).pipe(delay(500));
        }
        return this.http.get<Candidate[]>(this.apiService.getBackendUrl('hr/candidates'));
    }

    /**
     * Récupère les candidats par statut
     */
    getCandidatesByStatus(status: CandidateStatus): Observable<Candidate[]> {
        if (this.useMockData) {
            const filtered = this.mockCandidates.filter(c => c.status === status);
            return of(filtered).pipe(delay(300));
        }
        return this.http.get<Candidate[]>(
            this.apiService.getBackendUrl(`hr/candidates?status=${status}`)
        );
    }

    /**
     * Récupère les candidats en attente de décision
     */
    getPendingCandidates(): Observable<Candidate[]> {
        return this.getCandidatesByStatus(CandidateStatus.PENDING);
    }

    /**
     * Accepter un candidat
     */
    acceptCandidate(candidateId: number, comment?: string): Observable<Candidate> {
        if (this.useMockData) {
            return this.updateCandidateStatus(candidateId, CandidateStatus.ACCEPTED, comment);
        }
        const decision: CandidateDecision = {
            candidateId,
            decision: CandidateStatus.ACCEPTED,
            comment
        };
        return this.http.post<Candidate>(
            this.apiService.getBackendUrl('hr/candidates/decision'),
            decision
        );
    }

    /**
     * Rejeter un candidat
     */
    rejectCandidate(candidateId: number, comment?: string): Observable<Candidate> {
        if (this.useMockData) {
            return this.updateCandidateStatus(candidateId, CandidateStatus.REJECTED, comment);
        }
        const decision: CandidateDecision = {
            candidateId,
            decision: CandidateStatus.REJECTED,
            comment
        };
        return this.http.post<Candidate>(
            this.apiService.getBackendUrl('hr/candidates/decision'),
            decision
        );
    }

    /**
     * Mettre à jour le statut d'un candidat
     */
    updateCandidateStatus(candidateId: number, status: CandidateStatus, comment?: string): Observable<Candidate> {
        if (this.useMockData) {
            const candidate = this.mockCandidates.find(c => c.id === candidateId);
            if (candidate) {
                candidate.status = status;
                return of({ ...candidate }).pipe(delay(300));
            }
            throw new Error('Candidat non trouvé');
        }
        const decision: CandidateDecision = {
            candidateId,
            decision: status,
            comment
        };
        return this.http.post<Candidate>(
            this.apiService.getBackendUrl('hr/candidates/decision'),
            decision
        );
    }

    /**
     * Récupère les statistiques du dashboard
     */
    getDashboardStats(): Observable<HRDashboardStats> {
        if (this.useMockData) {
            const stats: HRDashboardStats = {
                totalCandidates: this.mockCandidates.length,
                pendingCandidates: this.mockCandidates.filter(c => c.status === CandidateStatus.PENDING).length,
                acceptedCandidates: this.mockCandidates.filter(c => c.status === CandidateStatus.ACCEPTED).length,
                rejectedCandidates: this.mockCandidates.filter(c => c.status === CandidateStatus.REJECTED).length
            };
            return of(stats).pipe(delay(300));
        }
        return this.http.get<HRDashboardStats>(
            this.apiService.getBackendUrl('hr/dashboard/stats')
        );
    }

    /**
     * Récupère les détails d'un candidat
     */
    getCandidateDetails(candidateId: number): Observable<Candidate> {
        return this.http.get<Candidate>(
            this.apiService.getBackendUrl(`hr/candidates/${candidateId}`)
        );
    }
}
