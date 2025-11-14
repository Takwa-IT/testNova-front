import { Injectable } from '@angular/core';
import type { Observable } from "rxjs";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import type { CvAnalysis } from '../models/cv-analysis.model'; // Adjust path as needed

export interface Question {
  id: number;
  text: string;
  type: 'multiple' | 'number' | 'text';
  options?: string[];
}

export interface QuestionnaireResponse {
  questions: Question[];
  problem: { description: string };
}

// src/app/services/questionnaire-service.service.ts

@Injectable({
  providedIn: 'root'
})
export class QuestionnaireServiceService {
  // CORRIGÉ : Utilise le bon port du backend
  private apiUrl = 'http://localhost:8082/api/test';

  constructor(private http: HttpClient) { }

  generateTest(analysis: CvAnalysis): Observable<QuestionnaireResponse> {
    return this.http.post<QuestionnaireResponse>(`${this.apiUrl}/generateTest`, analysis);
  }

  submitAnswers(answers: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/submit`, answers);
  }

  submitAndCorrect(answers: any): Observable<any> {
    const payload = {
      responses: answers.responses,
      problemSolution: answers.problemSolution,
      originalQuestions: answers.originalQuestions,
      problemDescription: answers.problemDescription
    };

    return this.http.post(`${this.apiUrl}/correct`, payload);
  }
}