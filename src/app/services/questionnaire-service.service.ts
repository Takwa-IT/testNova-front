import { Injectable } from '@angular/core';
import type { Observable } from "rxjs";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import type { CvAnalysis } from '../models/cv-analysis.model'; // Adjust path as needed

export interface Question {
  id: number;
  text: string;
  type: "multiple" | "number" | "text";
  options?: string[];
}

export interface QuestionnaireResponse {
  questions: Question[];
  problem: {
    description: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class QuestionnaireServiceService {
  private apiUrl = 'http://localhost:8081/api/test/generateTest'; // Backend endpoint

  constructor(private http: HttpClient) { }

  generateTest(analysis: CvAnalysis): Observable<QuestionnaireResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.http.post<QuestionnaireResponse>(this.apiUrl, analysis, { headers });
  }

  // Submit remains as-is (implement backend /submit if needed)
  submitAnswers(answers: any): Observable<any> {
    console.warn('Submit endpoint not implemented in backend yet');
    return this.http.post(`${this.apiUrl}/submit`, answers);
  }
}