import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CvAnalysis } from '../models/cv-analysis.model';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private cvAnalysisSubject = new BehaviorSubject<CvAnalysis | null>(null);
  cvAnalysis$ = this.cvAnalysisSubject.asObservable();

  setCvAnalysis(analysis: CvAnalysis): void {
    this.cvAnalysisSubject.next(analysis);
  }

  clearCvAnalysis(): void {
    this.cvAnalysisSubject.next(null);
  }
}