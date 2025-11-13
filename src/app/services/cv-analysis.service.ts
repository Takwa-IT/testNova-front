import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { MatDialog } from '@angular/material/dialog';
import { CvAnalysisComponent } from '../components/cv-analysis/cv-analysis.component';
import { PdfExtractorService } from './pdf-extractor.service';
import type { Offer } from '../models/offer.model';

@Injectable({
  providedIn: 'root'
})
export class CvAnalysisService {
  constructor(
    private apiService: ApiService,
    private pdfExtractor: PdfExtractorService,
    private dialog: MatDialog
  ) {}

  // Analyze CV with offer
  async analyzeCvWithOffer(file: File, selectedOffer: Offer): Promise<void> {
    try {
      const cvText = await this.pdfExtractor.extractTextFromPdf(file);
      if (!cvText || cvText.length < 50) {
        throw new Error("PDF vide ou illisible");
      }

      this.apiService.analyzeCvWithOffer(cvText, selectedOffer).subscribe({
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

  // Open analysis dialog
  private openAnalysisDialog(analysis: any, selectedOffer: Offer): void {
    this.dialog.open(CvAnalysisComponent, {
      width: '900px',
      maxHeight: '90vh',
      data: { analysis: analysis, selectedOffer: selectedOffer }
    });
  }

  // Calculate score from skills
  private calculateScore(skills: any[]): number {
    if (!skills || skills.length === 0) return 0;

    const levelScores: { [key: string]: number } = {
      'expert': 100,
      'advanced': 75,
      'intermediate': 50,
      'beginner': 25
    };

    const totalScore = skills.reduce((sum, skill) => {
      const level = skill?.level?.toLowerCase();
      return sum + (levelScores[level] || 0);
    }, 0);

    return Math.round(totalScore / skills.length);
  }

  // Show progress during analysis
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
