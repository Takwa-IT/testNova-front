import { Component, ViewChild, ElementRef, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Router, RouterLink } from "@angular/router";
import { CvAnalysis, Skill, Experience } from "../../models/cv-analysis.model";
import { calculateAverageScore } from '../../utils/skill-utils';
import { CvAnalysisService } from "../../services/cv-analysis.service";
import { CommonModule } from "@angular/common";
import { ApiService } from "../../services/api.service";

@Component({
  selector: "app-cv-analysis",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./cv-analysis.component.html",
  styleUrls: ["./cv-analysis.component.css"],
})
export class CvAnalysisComponent {
  @ViewChild("modalContent", { static: false }) modalContent!: ElementRef;

  selectedExperience: Experience | null = null;
  showSkillsDropdown = false;
  hardSkills: Skill[] = [];
  softSkills: Skill[] = [];
  selectedOffer: any = null;

  constructor(
    private apiService: ApiService,
    public dialogRef: MatDialogRef<CvAnalysisComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { analysis: CvAnalysis | any, selectedOffer?: any },
    private router: Router,
    private cvAnalysisService: CvAnalysisService
  ) {
    console.log("CV Analysis data received:", this.data);

    // 🔹 Récupérer correctement l'objet analysis depuis le backend
    const analysis = this.data?.analysis?.analysis || this.data?.analysis;

    // Séparer les hardSkills et softSkills
    const skills: Skill[] = analysis.skills || [];
    this.hardSkills = skills.filter((s) => s.type === "hardSkills");
    this.softSkills = skills.filter((s) => s.type === "softSkills");

    // Sélectionner la première expérience par défaut
    if (analysis.experiences?.length > 0) {
      this.selectedExperience = analysis.experiences[0];
    }

    // Récupérer l'offre sélectionnée
    this.selectedOffer = this.data.selectedOffer;

    // ❌ Ne pas écraser les données du backend
    this.data.analysis = {
      ...analysis,
      skills: skills,
      experiences: analysis.experiences || [],
      resume: analysis.resume || "",
      score: analysis.score || 0
    };
    // Propager les recommandations fournies par le backend (si présentes)
    (this.data.analysis as any).recommendations = analysis.recommendations || (this.data.analysis as any).recommendations || [];
    // Exposer localement pour usage simple
    // @ts-ignore
    this.recommendations = (this.data.analysis as any).recommendations || [];
  }

  toggleSkillsDropdown(): void {
    this.showSkillsDropdown = !this.showSkillsDropdown;
  }

  getScore(): number {
    return this.calculateScore(this.data?.analysis?.skills || []);
  }

  private calculateScore(skills: Skill[]): number {
    return calculateAverageScore(skills || []);
  }

  getLevelColor(level: string | undefined): string {
    if (!level) return "skill-default";
    switch (level.toLowerCase()) {
      case "expert":
        return "skill-expert";
      case "advanced":
        return "skill-advanced";
      case "intermediate":
        return "skill-intermediate";
      case "beginner":
        return "skill-beginner";
      default:
        return "skill-default";
    }
  }

  getLevelLabel(level: string | undefined): string {
    if (!level) return "Inconnu";
    switch (level.toLowerCase()) {
      case "expert":
        return "Expert";
      case "advanced":
        return "Avancé";
      case "intermediate":
        return "Intermédiaire";
      case "beginner":
        return "Débutant";
      default:
        return level;
    }
  }

  getAllSkills(): Skill[] {
    return [...this.hardSkills, ...this.softSkills];
  }

  getExperiences(): Experience[] {
    return this.data?.analysis?.experiences || [];
  }

  selectExperience(experience: Experience): void {
    this.selectedExperience = experience;
  }

  isExperienceSelected(experience: Experience): boolean {
    return this.selectedExperience === experience;
  }

  hasValidData(): boolean {
    const hasSkills = (this.data?.analysis?.skills?.length || 0) > 0;
    const hasExperience = (this.data?.analysis?.experiences?.length || 0) > 0;
    return hasSkills || hasExperience;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onNextTest(): void {
    if (!this.data?.analysis) {
      alert("Aucune analyse disponible pour le test.");
      return;
    }

    this.cvAnalysisService.setCvAnalysis(this.data.analysis);
    this.dialogRef.close();
    this.router.navigate(["/test"]);
  }
  sendCvWithOffer(cvText: string, selectedOffer: any) {
    this.apiService.analyzeCvWithOffer(cvText, selectedOffer).subscribe({
      next: (response) => {
        console.log('Score de matching reçu:', response);
        // Exemple : stocker pour affichage
        this.data.analysis.matchingScore = response.matchingScore;
        this.data.analysis.matchedSkills = response.matchedSkills;
        this.data.analysis.missingSkills = response.missingSkills;
      },
      error: (err) => {
        console.error('Erreur lors de l’envoi du CV et de l’offre:', err);
      }
    });
  }
}
