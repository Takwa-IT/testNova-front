import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from "../../../services/api.service"
import { CvAnalysis } from '../../../models/cv-analysis.model';

@Component({
  selector: 'app-profile-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-history.component.html',
  styleUrls: ['./profile-history.component.css']
})
export class ProfileHistoryComponent implements OnInit {

  cvAnalyses: CvAnalysis[] = [];
  loading: boolean = false;
  errorMessage: string = '';

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.loadCvAnalyses();
  }

  loadCvAnalyses(): void {
    this.loading = true;
    const userId = 1; // 🔹 À remplacer par l'ID de l'utilisateur courant
    this.apiService.getUserCvAnalyses(userId).subscribe({
      next: (analyses) => {
        this.cvAnalyses = analyses;
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = 'Impossible de récupérer les analyses de CV.';
        console.error(err);
        this.loading = false;
      }
    });
  }
}
