// src/app/services/api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Offer } from '../models/offer.model';
import { CvAnalysis } from '../models/cv-analysis.model';
import { environment } from '../../environments/environment';

const ADZUNA_URL = 'https://api.adzuna.com/v1/api/jobs/gb/search/30?app_id=04af4a1c&app_key=37926d2f11a44c707f25b87c4fd3a828%09'; // Base URL Adzuna
const BACKEND_URL = 'http://localhost:8081/api/cv/analyze'; // Backend CV analysis endpoint
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) { }

  // Méthode modifiée : Récupère offres depuis API externe Adzuna (pas de DB)
  getExternalOffers(what: string = 'developer', location: string = 'france'): Observable<Offer[]> {
    const params = new URLSearchParams({
      app_id: environment.adzuna.appId,
      app_key: environment.adzuna.appKey,
      what: what, // Ex: 'developer frontend'
      where: location, // Ex: 'paris' ou 'france'
      results_per_page: '50' // Limite pour MVP
    });

    return this.http.get<any>(`${ADZUNA_URL}/fr/search/1?${params.toString()}`).pipe(
      map(response => {
        console.log('Réponse Adzuna brute:', response);  // Debug : vérifie structure
        if (response && response.results) {
          return response.results.map((job: any) => ({
            id: job.id || 'unknown',  // Fallback ID
            title: job.title || 'Titre inconnu',
            description: job.description || 'Description inconnue',
            company: job.company?.display_name || 'Entreprise inconnue',  // Guard for company
            skills: job.tags ? job.tags.map((tag: any) => tag.label || 'Tag inconnu') : [],  // Guard for tags
            imageUrl: this.getCompanyLogoPlaceholder(job.company),  // Fix : méthode safe
            // Fix: Ajoute les propriétés manquantes de Offer avec defaults (pour compatibilité TS)
            likes: 0,
            comments: 0,
            shares: 0,
            isLiked: false,
            commentsList: [],
            showComments: false
          } as Offer));  // Cast TS après extension
        }
        return [];
      })
    );
  }

  // Fix : Méthode pour placeholder logo (ligne 68 corrigée)
  private getCompanyLogoPlaceholder(company: any): string | null {
    if (!company || !company.logo) return null;  // Guard : évite .length sur undefined
    // Si logo est string, retourne-le ; sinon, fallback placeholder
    return typeof company.logo === 'string' ? company.logo : 'assets/placeholder-company.png';
  }

  // Méthode pour récupérer les entreprises suggérées
  getSuggestedCompanies(): Observable<any[]> {
    // Simulation d'une API - en production, remplacer par un vrai endpoint
    return this.http.get<any[]>('https://jsonplaceholder.typicode.com/users').pipe(
      map(users => users.slice(0, 4).map(user => ({
        name: user.company.name,
        logo: `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000000000000)}?w=80&h=80&fit=crop&crop=center`,
        sector: user.company.catchPhrase.split(' ').slice(0, 2).join(' ') + ' • ' + user.company.bs.split(' ')[0]
      })))
    );
  }

  // Méthode pour récupérer les hashtags tendances
  getTrendingHashtags(): Observable<any[]> {
    // Simulation d'une API - en production, remplacer par un vrai endpoint
    const hashtags = [
      { name: 'DéveloppementWeb', posts: Math.floor(Math.random() * 5000) + 2000 },
      { name: 'Intelligence Artificielle', posts: Math.floor(Math.random() * 3000) + 1000 },
      { name: 'RemoteWork', posts: Math.floor(Math.random() * 4000) + 2000 },
      { name: 'DataScience', posts: Math.floor(Math.random() * 2500) + 1000 },
      { name: 'UXDesign', posts: Math.floor(Math.random() * 2000) + 500 }
    ];
    return this.http.get<any[]>('https://jsonplaceholder.typicode.com/posts').pipe(
      map(() => hashtags.sort((a, b) => b.posts - a.posts))
    );
  }

  // Reste du code inchangé (analyse CV, etc.)
  analyzeCvWithAI(cvText: string, ownerName: string = ''): Observable<CvAnalysis> {
    const body = { textcv: cvText, ownerName };
    return this.http.post<CvAnalysis>(BACKEND_URL, body, this.httpOptions);
  }
}