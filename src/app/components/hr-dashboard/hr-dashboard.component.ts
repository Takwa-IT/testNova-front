// src/app/components/hr-dashboard/hr-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HRService } from '../../services/hr.service';
import { Candidate, CandidateStatus, HRDashboardStats } from '../../models/hr.model';

@Component({
    selector: 'app-hr-dashboard',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './hr-dashboard.component.html',
    styleUrls: ['./hr-dashboard.component.css']
})
export class HRDashboardComponent implements OnInit {
    candidates: Candidate[] = [];
    filteredCandidates: Candidate[] = [];
    stats: HRDashboardStats | null = null;
    loading = false;
    error: string | null = null;
    
    // Filtres
    statusFilter: string = 'ALL';
    searchQuery: string = '';
    
    // Pour les confirmations
    pendingAction: { candidateId: number; action: CandidateStatus } | null = null;
    actionComment: string = '';

    constructor(private hrService: HRService) { }

    ngOnInit(): void {
        this.loadCandidates();
        this.loadStats();
    }

    loadCandidates(): void {
        this.loading = true;
        this.error = null;
        
        this.hrService.getCandidates().subscribe({
            next: (candidates) => {
                this.candidates = candidates;
                this.applyFilters();
                this.loading = false;
            },
            error: (err) => {
                console.error('Erreur lors du chargement des candidats:', err);
                this.error = 'Impossible de charger les candidats. Veuillez réessayer.';
                this.loading = false;
            }
        });
    }

    loadStats(): void {
        this.hrService.getDashboardStats().subscribe({
            next: (stats) => {
                this.stats = stats;
            },
            error: (err) => {
                console.error('Erreur lors du chargement des statistiques:', err);
            }
        });
    }

    applyFilters(): void {
        let filtered = [...this.candidates];

        // Filtre par statut
        if (this.statusFilter !== 'ALL') {
            filtered = filtered.filter(c => c.status === this.statusFilter);
        }

        // Filtre par recherche
        if (this.searchQuery.trim()) {
            const query = this.searchQuery.toLowerCase();
            filtered = filtered.filter(c =>
                c.nom.toLowerCase().includes(query) ||
                c.prenom.toLowerCase().includes(query) ||
                c.poste.toLowerCase().includes(query) ||
                c.email.toLowerCase().includes(query)
            );
        }

        this.filteredCandidates = filtered;
    }

    onStatusFilterChange(): void {
        this.applyFilters();
    }

    onSearchChange(): void {
        this.applyFilters();
    }

    // Préparer l'action d'acceptation
    prepareAccept(candidate: Candidate): void {
        this.pendingAction = {
            candidateId: candidate.id,
            action: CandidateStatus.ACCEPTED
        };
        this.actionComment = '';
    }

    // Préparer l'action de rejet
    prepareReject(candidate: Candidate): void {
        this.pendingAction = {
            candidateId: candidate.id,
            action: CandidateStatus.REJECTED
        };
        this.actionComment = '';
    }

    // Annuler l'action en cours
    cancelAction(): void {
        this.pendingAction = null;
        this.actionComment = '';
    }

    // Confirmer l'action
    confirmAction(): void {
        if (!this.pendingAction) return;

        const { candidateId, action } = this.pendingAction;
        
        this.hrService.updateCandidateStatus(candidateId, action, this.actionComment).subscribe({
            next: (updatedCandidate) => {
                // Mettre à jour le candidat dans la liste
                const index = this.candidates.findIndex(c => c.id === candidateId);
                if (index !== -1) {
                    this.candidates[index] = updatedCandidate;
                }
                this.applyFilters();
                this.loadStats();
                this.cancelAction();
            },
            error: (err) => {
                console.error('Erreur lors de la mise à jour du statut:', err);
                this.error = 'Impossible de mettre à jour le statut. Veuillez réessayer.';
            }
        });
    }

    // Obtenir la classe CSS pour le badge de statut
    getStatusBadgeClass(status: CandidateStatus): string {
        switch (status) {
            case CandidateStatus.ACCEPTED:
                return 'badge-success';
            case CandidateStatus.REJECTED:
                return 'badge-danger';
            case CandidateStatus.PENDING:
            default:
                return 'badge-warning';
        }
    }

    // Obtenir le libellé du statut
    getStatusLabel(status: CandidateStatus): string {
        switch (status) {
            case CandidateStatus.ACCEPTED:
                return 'Accepté';
            case CandidateStatus.REJECTED:
                return 'Rejeté';
            case CandidateStatus.PENDING:
            default:
                return 'En attente';
        }
    }

    // Obtenir la classe CSS pour le score
    getScoreClass(score: number): string {
        if (score >= 80) return 'score-excellent';
        if (score >= 60) return 'score-good';
        if (score >= 40) return 'score-average';
        return 'score-low';
    }

    // Vérifier si une action est en cours pour un candidat
    isActionPending(candidateId: number): boolean {
        return this.pendingAction?.candidateId === candidateId;
    }
}
