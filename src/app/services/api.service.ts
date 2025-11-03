// src/app/services/api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators'; // Pour mapper la réponse Adzuna
import { Offer } from '../models/offer.model'; // Interface Offer
import { CvAnalysis } from '../models/cv-analysis.model';
import { environment } from '../../environments/environment'; // Pour clés Adzuna


const ADZUNA_URL = 'https://api.adzuna.com/v1/api/jobs/gb/search/30?app_id=04af4a1c&app_key=37926d2f11a44c707f25b87c4fd3a828%09'; // Base URL Adzuna
const BACKEND_URL = 'http://localhost:8081'; // ⚠️ Port 8081 selon votre config

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

  analyzeCvWithAI(cvText: string): Observable<any> {
    const body = { textcv: cvText };
    return this.http.post<any>(`${BACKEND_URL}/analysecv`, body, this.httpOptions);
  }

  // Nouvelle méthode : Récupère offres depuis API externe Adzuna (pas de DB)
  getExternalOffers(what: string = 'developer', location: string = 'tunisia'): Observable<Offer[]> {
    const params = new URLSearchParams({
      app_id: environment.adzuna.appId,
      app_key: environment.adzuna.appKey,
      what: what, // Ex: 'developer frontend'
      where: location, // Ex: 'tunisia'
      results_per_page: '50' // Limite pour MVP
    });

    return this.http.get<any>(`${ADZUNA_URL}/tn/search/1?${params.toString()}`).pipe(
      map(response => {
        if (response && response.results) {
          return response.results.map((job: any, index: number) => ({
            id: job.id,
            title: job.title,
            description: job.description,
            company: job.company.display_name,
            companyLogo: job.company.logo || this.getCompanyLogoPlaceholder(job.company.display_name),
            illustration: this.getJobIllustration(job.category?.label || job.title),
            followers: Math.floor(Math.random() * 50000) + 1000,
            likes: Math.floor(Math.random() * 2000) + 500,
            comments: Math.floor(Math.random() * 1000) + 100,
            shares: Math.floor(Math.random() * 100) + 10,
            isLiked: false,
            commentsList: [],
            showComments: false
          } as Offer));
        }
        return [];
      })
    );
  }

  private getCompanyLogoPlaceholder(companyName: string): string {
    // Generate a consistent placeholder based on company name
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
    const index = companyName.length % colors.length;
    return `https://via.placeholder.com/64x64/${colors[index].slice(1)}/FFFFFF?text=${companyName.charAt(0).toUpperCase()}`;
  }

  private getJobIllustration(jobTitle: string): string {
    // Return relevant illustration based on job type
    const illustrations: { [key: string]: string } = {
      'developer': 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=300&fit=crop',
      'frontend': 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=600&h=300&fit=crop',
      'backend': 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&h=300&fit=crop',
      'fullstack': 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=600&h=300&fit=crop',
      'designer': 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&h=300&fit=crop',
      'data': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=300&fit=crop',
      'analyst': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=300&fit=crop',
      'manager': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=300&fit=crop',
      'engineer': 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=300&fit=crop'
    };

    const lowerTitle = jobTitle.toLowerCase();
    for (const [key, url] of Object.entries(illustrations)) {
      if (lowerTitle.includes(key)) {
        return url;
      }
    }

    // Default illustration
    return 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=300&fit=crop';
  }
}
