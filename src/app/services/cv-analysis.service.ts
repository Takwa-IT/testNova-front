import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { ApiService } from './api.service';
import { MatDialog } from '@angular/material/dialog';
import { CvAnalysisComponent } from '../components/cv-analysis/cv-analysis.component';
import { PdfExtractorService } from './pdf-extractor.service';
import { AuthService } from './auth.service';
import type { Offer } from '../models/offer.model';
import { calculateAverageScore } from '../utils/skill-utils';

@Injectable({
  providedIn: 'root'
})
export class CvAnalysisService {
  // 🔹 State management: CV analysis data shared across components
  private cvAnalysisSource = new BehaviorSubject<any>(null);
  cvAnalysis$ = this.cvAnalysisSource.asObservable();

  constructor(
    private apiService: ApiService,
    private pdfExtractor: PdfExtractorService,
    private dialog: MatDialog,
    private authService: AuthService
  ) { }

  /**
   * Analyze CV with standalone AI (no offer matching)
   * Updates the shared state via BehaviorSubject
   */
  analyzeCv(textcv: string): Observable<any> {
    return this.apiService.analyzeCv(textcv).pipe(
      tap((response: any) => {
        console.log("CV Analysis response:", response);
        this.cvAnalysisSource.next(response); // Share with all components
      })
    );
  }

  /**
   * Analyze CV with offer matching
   * Handles PDF extraction → API call → dialog display
   */
  async analyzeCvWithOffer(file: File, selectedOffer: Offer): Promise<void> {
    try {
      const cvText = await this.pdfExtractor.extractTextFromPdf(file);
      if (!cvText || cvText.length < 50) {
        throw new Error("PDF vide ou illisible");
      }

      const currentUser = this.authService.getCurrentUser();
      const userId = currentUser?.id;

      if (!userId) {
        console.warn('Utilisateur non connecté - analyse CV non associée à un compte');
      }

      this.apiService.analyzeCvWithOffer(cvText, selectedOffer, '', userId).subscribe({
        next: (rawResponse) => {
          const analysisResponse = typeof rawResponse === "string" ? JSON.parse(rawResponse) : rawResponse;

          if (!analysisResponse || !analysisResponse.analysis) {
            console.error("Invalid response format:", analysisResponse);
            alert("Erreur: Format de réponse invalide du serveur");
            return;
          }

          const analysis = analysisResponse.analysis;
          const mappedSkills = (analysis.skills || []).map((s: any) => ({
            name: s.name || "Unknown Skill",
            level: s.level || "beginner",
            type: s.type || "hardSkills"
          }));

          const adaptedAnalysis: any = {
            score: analysis.score || this.calculateScore(mappedSkills),
            resume: analysis.resume,
            skills: mappedSkills,
            experiences: (analysis.experience || []).map((exp: any) => ({
              ...exp,
              competences: exp.competences || []
            })),
            matchingScore: analysis.matching?.score || 0,
            matchedSkills: analysis.matching?.matchedSkills || [],
            missingSkills: analysis.matching?.missingSkills || []
          };

          // Update shared state
          this.cvAnalysisSource.next(adaptedAnalysis);
          this.openAnalysisDialog(adaptedAnalysis, selectedOffer);
        },
        error: (err) => {
          console.error("Backend analysis error:", err);
          alert(`CV analysis error: ${err.message || "Unknown error"}`);
        },
      });
    } catch (error: any) {
      alert(`Error: ${error.message || "Cannot read PDF"}`);
    }
  }

  /**
   * Get current CV analysis from state
   */
  getCvAnalysis(): any {
    return this.cvAnalysisSource.value;
  }

  /**
   * Manually set CV analysis in state
   */
  setCvAnalysis(data: any) {
    this.cvAnalysisSource.next(data);
  }

  /**
   * Open analysis dialog with results
   */
  private openAnalysisDialog(analysis: any, selectedOffer: Offer): void {
    this.dialog.open(CvAnalysisComponent, {
      width: '900px',
      maxHeight: '90vh',
      data: { analysis: analysis, selectedOffer: selectedOffer }
    });
  }

  /**
   * Calculate average score from skills
   */
  private calculateScore(skills: any[]): number {
    return calculateAverageScore(skills || []);
  }

  /**
   * Show progress bar animation during analysis
   */
  showProgress(callback: (progress: number) => void): () => void {
    let progress = 0;
    const interval = setInterval(() => {
      progress = Math.min(progress + Math.random() * 15, 95);
      callback(progress);
    }, 200);

    // Return cleanup function
    return () => clearInterval(interval);
  }
}
