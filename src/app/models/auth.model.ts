// src/app/models/user.model.ts
export interface User {
    id: number;
    nom: string;
    prenom: string;
    email: string;
    roles: string[];
    telephone?: string;
    ville?: string;
    posteRecherche?: string;
}

// src/app/models/auth.model.ts
export interface LoginRequest {
    email: string;
    motDePasse: string;
}

export interface RegisterRequest {
    nom: string;
    prenom: string;
    email: string;
    motDePasse: string;
    role: string;
    telephone?: string;
    ville?: string;
    posteRecherche?: string;
}

export interface JwtResponse {
    token: string;
    type: string;
    id: number;
    email: string;
    nom: string;
    prenom: string;
    roles: string[];
    telephone?: string;
    ville?: string;
    posteRecherche?: string;

}