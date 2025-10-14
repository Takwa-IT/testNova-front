// src/app/components/cv-analysis/cv-analysis.component.ts
import { Component, Inject, ElementRef, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { CvAnalysis, Skill } from '../../models/cv-analysis.model';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-cv-analysis',
  templateUrl: './cv-analysis.component.html',
  styleUrls: ['./cv-analysis.component.css']
})
export class CvAnalysisComponent {
  @ViewChild('modalContent', { static: false }) modalContent!: ElementRef;

  constructor(
    public dialogRef: MatDialogRef<CvAnalysisComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { analysis: CvAnalysis },
    private router: Router,
    private dataService: DataService
  ) { }

  // Score global (de l'IA backend)
  getScore(): number {
    return this.data?.analysis?.score || 0;
  }

  // Skills groupés par niveau (optionnel)
  getSkillsByLevel(level: 'Débutant' | 'Intermédiaire' | 'Avancé'): Skill[] {
    return this.data?.analysis?.skills?.filter(skill => skill.level === level) || [];
  }

  // Méthode pour dernière expérience
  getLastExperience(): any {
    return this.data?.analysis?.experiences && this.data.analysis.experiences.length > 0
      ? this.data.analysis.experiences[this.data.analysis.experiences.length - 1]
      : null;
  }

  hasValidData(): boolean {
    return !!(this.data?.analysis?.skills?.length > 0 || this.data?.analysis?.experiences?.length > 0);
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  async onDownload(): Promise<void> {
    if (!this.data?.analysis) {
      alert('Aucune donnée à télécharger.');
      return;
    }

    try {
      const canvas = await html2canvas(this.modalContent.nativeElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');

      const today = new Date().toLocaleDateString('fr-FR');
      pdf.setFontSize(16);
      pdf.text('Rapport d\'Analyse CV - SkillPulse', 20, 20);
      pdf.setFontSize(10);
      pdf.text(`Date : ${today}`, 20, 30);
      pdf.text(`Score global : ${this.getScore()}%`, 20, 40);
      pdf.text(`Nombre de compétences : ${this.data.analysis.skills?.length || 0}`, 20, 50);
      pdf.text(`Nombre d'expériences : ${this.data.analysis.experiences?.length || 0}`, 20, 60);

      const imgWidth = 170;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 70;

      pdf.addImage(imgData, 'PNG', 20, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + 20;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 20, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`analyse-cv-${today.replace(/\//g, '-')}.pdf`);
    } catch (error) {
      console.error('Erreur génération PDF:', error);
      alert('Erreur lors du téléchargement du PDF. Vérifiez la console.');
    }
  }

  onNextTest(): void {
    if (!this.data?.analysis) {
      alert('Aucune analyse disponible pour le test.');
      return;
    }

    this.dataService.setCvAnalysis(this.data.analysis);
    this.dialogRef.close();
    this.router.navigate(['/test']);
  }
}