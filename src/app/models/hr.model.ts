// src/app/models/hr.model.ts

export interface Candidate {
    id: number;
    nom: string;
    prenom: string;
    email: string;
    telephone?: string;
    ville?: string;
    score: number;
    poste: string;
    dateApplication: Date;
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
