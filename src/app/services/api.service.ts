// src/app/services/api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators'; // Pour mapper la réponse Adzuna
import { Offer } from '../models/offer.model'; // Interface Offer
import { CvAnalysis } from '../models/cv-analysis.model';
import { environment } from '../../environments/environment'; // Pour clés Adzuna


const ADZUNA_URL = 'https://api.adzuna.com/v1/api/jobs/gb/search/30?app_id=04af4a1c&app_key=37926d2f11a44c707f25b87c4fd3a828%09'; // Base URL Adzuna

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

  // Nouvelle méthode : Récupère offres depuis API externe Adzuna (pas de DB)
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
        if (response && response.results) {
          return response.results.map((job: any) => ({
            id: job.id,
            title: job.title,
            description: job.description,
            company: job.company.display_name,
            skills: job.tags ? job.tags.map((tag: any) => tag.label) : [], // Extrait skills si disponibles
            imageUrl: job.company ? job.company.logo : null // Logo si dispo
          } as unknown as Offer));
        }
        return [];
      })
    );
  }

  // Garde l'upload CV pour ton backend (analyse IA)
  uploadCv(file: File, offerId: number): Observable<CvAnalysis> {
    const formData = new FormData();
    formData.append('cvFile', file);
    formData.append('offerId', offerId.toString());
    return this.http.post<CvAnalysis>('http://localhost:8080/api/candidatures/upload', formData); // Backend local pour IA
  }
}