import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, catchError, Observable, of, tap } from "rxjs";

@Injectable({ providedIn: 'root' })
export class CvStateService {
  private cvAnalysisSource = new BehaviorSubject<any>(null);
  cvAnalysis$ = this.cvAnalysisSource.asObservable();

  private apiUrl = 'http://localhost:8082/api/cv/analyze';  // Fixed: Use /api/cv/analyze to match backend

  constructor(private http: HttpClient) { }

  analyzeCv(textcv: string): Observable<any> {
    return this.http.post<any>(this.apiUrl, { textcv }).pipe(  // Sends { cvText }
      tap((response: any) => {
        console.log("Réponse backend reçue:", response);
        this.cvAnalysisSource.next(response); // ENVOIE À TOUS LES COMPOSANTS
      }),
      catchError(err => {
        console.error("Erreur API:", err);
        return of({ analysis: { score: 50, fileName: "Erreur.pdf", uploadDate: "Maintenant" } });
      })
    );
  }

  setCvAnalysis(data: any) {
    this.cvAnalysisSource.next(data);
  }

  getCvAnalysis(): any {
    return this.cvAnalysisSource.value;
  }
}