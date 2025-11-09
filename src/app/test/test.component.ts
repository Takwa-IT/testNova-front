import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { QuestionnaireServiceService, Question, QuestionnaireResponse } from '../services/questionnaire-service.service';
import { DataService } from '../services/data.service';
import type { CvAnalysis } from '../models/cv-analysis.model';
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
  problem: string = ''; // Dynamic problem description from AI
  form!: FormGroup;
  loading = true;
  progress = 0;  // Progression for test generation
  submitted = false;
  submitting = false;
  error: string | null = null;
  successMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private questionnaireService: QuestionnaireServiceService,
    private dataService: DataService,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    // Use Observable for reactivity – wait for real data
    this.dataService.cvAnalysis$.pipe(
      take(1),
      timeout(5000)
    ).subscribe({
      next: (cvAnalysis) => {
        console.log('TestComponent - Received cvAnalysis from Observable:', cvAnalysis);  // Debug
        if (this.hasValidSkills(cvAnalysis)) {
          this.loadDynamicQuestions(cvAnalysis);
        } else {
          this.handleNoAnalysis();
        }
      },
      error: (err) => {
        console.error('Observable timeout/error:', err);  // Debug
        this.handleNoAnalysis();
      }
    });
  }

  private hasValidSkills(analysis: any): boolean {
    if (!analysis || !analysis.skills) return false;
    if (Array.isArray(analysis.skills)) {
      return analysis.skills.length > 0;
    } else if (analysis.skills.hardSkills || analysis.skills.softSkills) {
      const hardCount = (analysis.skills.hardSkills?.length || 0);
      const softCount = (analysis.skills.softSkills?.length || 0);
      return hardCount + softCount > 0;
    }
    return false;
  }

  private handleNoAnalysis(): void {
    this.error = 'No CV analysis available. Please analyze your CV first.';
    this.loading = false;
    this.cdr.detectChanges();
    console.error('No valid CV analysis found');  // Debug
  }

  loadDynamicQuestions(analysis: CvAnalysis): void {
    console.log('Loading dynamic questions with analysis:', analysis);  // Debug
    this.loading = true;
    this.progress = 0;
    this.error = null;

    // Simulation de progression élégante (courbe non linéaire)
    const progressInterval = setInterval(() => {
      this.progress += Math.random() * 15;
      if (this.progress > 95) {
        this.progress = 95;
      }
    }, 200);

    this.questionnaireService.generateTest(analysis).subscribe({
      next: (data: QuestionnaireResponse) => {
        clearInterval(progressInterval);
        this.progress = 100;
        this.questions = data.questions;
        this.problem = data.problem.description;
        this.initializeForm();
        this.loading = false;
        setTimeout(() => {
          this.progress = 0;  // Reset
          this.cdr.detectChanges();
        }, 500);
      },
      error: (err) => {
        clearInterval(progressInterval);
        this.loading = false;
        this.progress = 0;
        console.error('Generation error details:', err);  // Debug
        this.error = `Error during dynamic test generation (AI): ${err.message || err.status || 'Unknown error'}`;
        this.cdr.detectChanges();
      },
    });
  }

  initializeForm(): void {
    const group: { [key: string]: FormControl } = {};

    this.questions.forEach((question) => {
      const validators = [];

      if (question.type === 'multiple' || question.type === 'text') {
        validators.push(Validators.required);
      }

      if (question.type === 'number') {
        validators.push(Validators.required);
        validators.push(Validators.pattern(/^\d+$/));
      }

      group[`question_${question.id}`] = new FormControl('', validators);
    });

    // Add FormControl for problem solution
    group['problemSolution'] = new FormControl('', [Validators.required]);

    this.form = this.fb.group(group);
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.form.valid) {
      this.submitting = true;
      this.successMessage = null;

      const answers = {
        responses: this.questions.map((q) => ({
          questionId: q.id,
          answer: this.form.get(`question_${q.id}`)?.value,
        })),
        problemSolution: this.form.get('problemSolution')?.value,
      };

      this.questionnaireService.submitAnswers(answers).subscribe({
        next: (response) => {
          this.successMessage = 'Questionnaire submitted successfully!';
          this.form.reset();
          this.submitting = false;
        },
        error: (err) => {
          this.error = 'Error submitting questionnaire';
          this.submitting = false;
          console.error(err);
        },
      });
    }
  }

  getErrorMessage(questionId: number): string {
    const control = this.form.get(`question_${questionId}`);
    if (control?.hasError('required')) {
      return 'This field is required';
    }
    if (control?.hasError('pattern')) {
      return 'Please enter a valid number';
    }
    return '';
  }

  isSolutionInvalid(): boolean {
    const field = this.form.get('problemSolution');
    return !!(field && field.invalid && (field.dirty || field.touched || this.submitted));
  }

  getSolutionErrorMessage(): string {
    const control = this.form.get('problemSolution');
    if (control?.hasError('required')) {
      return 'Problem solution is required';
    }
    return '';
  }

  isFieldInvalid(questionId: number): boolean {
    const field = this.form.get(`question_${questionId}`);
    return !!(field && field.invalid && (field.dirty || field.touched || this.submitted));
  }

  getFormControl(questionId: number): FormControl {
    return this.form.get(`question_${questionId}`) as FormControl;
  }
}