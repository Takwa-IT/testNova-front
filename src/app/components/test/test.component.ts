import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { QuestionnaireServiceService, Question, QuestionnaireResponse } from '../../services/questionnaire-service.service';
import { CvAnalysisService } from '../../services/cv-analysis.service';
import type { CvAnalysis } from '../../models/cv-analysis.model';
import { take, timeout } from 'rxjs/operators';

@Component({
  selector: 'app-test',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css'],
})
export class TestComponent implements OnInit {
  title = 'Candidate Skills Assessment';
  questions: Question[] = [];
  problem: string = '';
  form!: FormGroup;
  loading = true;
  progress = 0;
  submitted = false;
  submitting = false;
  error: string | null = null;
  successMessage: string | null = null;

  // === RÉSULTAT DE LA CORRECTION IA ===
  testResult: any = null;
  showResult = false;

  constructor(
    private fb: FormBuilder,
    private questionnaireService: QuestionnaireServiceService,
    private cvAnalysisService: CvAnalysisService,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.cvAnalysisService.cvAnalysis$.pipe(take(1), timeout(5000)).subscribe({
      next: (cvAnalysis) => {
        console.log('TestComponent - Received cvAnalysis:', cvAnalysis);
        if (this.hasValidSkills(cvAnalysis)) {
          this.loadDynamicQuestions(cvAnalysis);
        } else {
          this.handleNoAnalysis();
        }
      },
      error: (err) => {
        console.error('Observable error:', err);
        this.handleNoAnalysis();
      }
    });
  }

  private hasValidSkills(analysis: any): boolean {
    if (!analysis || !analysis.skills) return false;
    if (Array.isArray(analysis.skills)) return analysis.skills.length > 0;
    const hard = analysis.skills.hardSkills?.length || 0;
    const soft = analysis.skills.softSkills?.length || 0;
    return hard + soft > 0;
  }

  private handleNoAnalysis(): void {
    this.error = 'No CV analysis available. Please analyze your CV first.';
    this.loading = false;
    this.cdr.detectChanges();
  }

  loadDynamicQuestions(analysis: CvAnalysis): void {
    this.loading = true;
    this.progress = 0;
    this.error = null;

    const progressInterval = setInterval(() => {
      this.progress += Math.random() * 15;
      if (this.progress > 95) this.progress = 95;
    }, 200);

    this.questionnaireService.generateTest(analysis).subscribe({
      next: (data: any) => {
        clearInterval(progressInterval);
        this.progress = 100;

        const questions = data.questions;
        const problem = data.problem?.description;

        if (!Array.isArray(questions) || questions.length !== 10 || !problem) {
          this.error = "Test invalide généré par l'IA. Réessayez.";
          this.loading = false;
          return;
        }

        this.questions = questions;
        this.problem = problem;
        this.initializeForm();
        this.loading = false;

        setTimeout(() => {
          this.progress = 0;
          this.cdr.detectChanges();
        }, 500);
      },
      error: (err) => {
        clearInterval(progressInterval);
        this.loading = false;
        this.progress = 0;
        this.error = `Erreur génération: ${err.message}`;
        this.cdr.detectChanges();
      },
    });
  }

  initializeForm(): void {
    const group: { [key: string]: FormControl } = {};

    this.questions.forEach((q) => {
      const validators = [];
      if (q.type === 'multiple' || q.type === 'text') validators.push(Validators.required);
      if (q.type === 'number') {
        validators.push(Validators.required, Validators.pattern(/^\d+$/));
      }
      group[`question_${q.id}`] = new FormControl('', validators);
    });

    group['problemSolution'] = new FormControl('', [Validators.required]);
    this.form = this.fb.group(group);
  }

  onSubmit(): void {
    if (!this.form.valid) return;

    this.submitting = true;

    const answers = {
      responses: this.questions.map(q => ({
        questionId: q.id,
        answer: this.form.get(`question_${q.id}`)?.value
      })),
      problemSolution: this.form.get('problemSolution')?.value,
      originalQuestions: { questions: this.questions }, // ← ENVOIE LES QUESTIONS ORIGINALES
      problemDescription: this.problem
    };

    this.questionnaireService.submitAndCorrect(answers).subscribe({
      next: (result) => {
        this.testResult = result;
        this.showResult = true;
        this.submitting = false;
      },
      error: () => {
        this.error = "Erreur correction";
        this.submitting = false;
      }
    });
  }

  scrollToResult() {
    setTimeout(() => {
      document.querySelector('.test-result')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  // === VALIDATION ===
  getErrorMessage(questionId: number): string {
    const control = this.form.get(`question_${questionId}`);
    if (control?.hasError('required')) return 'This field is required';
    if (control?.hasError('pattern')) return 'Please enter a valid number';
    return '';
  }

  isSolutionInvalid(): boolean {
    const field = this.form.get('problemSolution');
    return !!(field && field.invalid && (field.dirty || field.touched || this.submitted));
  }

  getSolutionErrorMessage(): string {
    const control = this.form.get('problemSolution');
    if (control?.hasError('required')) return 'Problem solution is required';
    return '';
  }

  isFieldInvalid(questionId: number): boolean {
    const field = this.form.get(`question_${questionId}`);
    return !!(field && field.invalid && (field.dirty || field.touched || this.submitted));
  }

  getFormControl(questionId: number): FormControl {
    return this.form.get(`question_${questionId}`) as FormControl;
  }

  getScoreClass(): string {
    if (!this.testResult) {
      return 'poor';
    }

    const score = this.testResult.totalScore;

    if (score >= 8.5) {
      return 'excellent';
    } else if (score >= 7) {
      return 'good';
    } else if (score >= 5) {
      return 'fair';
    } else {
      return 'poor';
    }
  }



}