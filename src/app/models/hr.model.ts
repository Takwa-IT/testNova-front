// src/app/models/hr.model.ts

export interface Candidate {
    id: number;
    nom: string;
    prenom: string;
    email: string;
    telephone?: string;
    ville?: string;
    score: number | null;  // Peut être null si le candidat n'a pas encore passé de test
    poste: string;
    dateApplication: Date | string;  // Le backend renvoie une string ISO
    status: CandidateStatus;
    cvUrl?: string;
}

export enum CandidateStatus {
    PENDING = 'PENDING',
    ACCEPTED = 'ACCEPTED',
    REJECTED = 'REJECTED'
}

export interface CandidateDecision {
    candidateId: number;
    decision: CandidateStatus;
    comment?: string;
}

export interface HRDashboardStats {
    totalCandidates: number;
    pendingCandidates: number;
    acceptedCandidates: number;
    rejectedCandidates: number;
}
