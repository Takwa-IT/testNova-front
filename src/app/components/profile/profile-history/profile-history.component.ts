import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from "../../../services/api.service";
import { AuthService } from "../../../services/auth.service";
import { CvAnalysis } from '../../../models/cv-analysis.model';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

@Component({
  selector: 'app-profile-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-history.component.html',
  styleUrls: ['./profile-history.component.css']
})
export class ProfileHistoryComponent implements OnInit {

  cvAnalyses: CvAnalysis[] = [];
  loading = false;
  errorMessage = '';

  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) {
    console.log('🔵 [ProfileHistory] Composant CONSTRUIT');
  }

  ngOnInit(): void {
    console.log('🟢 [ProfileHistory] ngOnInit APPELÉ');
    this.loadCvAnalyses();
  }

  loadCvAnalyses(): void {
    console.log('🟡 [ProfileHistory] loadCvAnalyses DÉMARRÉ');
    this.loading = true;
    this.errorMessage = '';

    // Vérifie d'abord si l'utilisateur est connecté (token présent)
    console.log('🔍 [ProfileHistory] isAuthenticated:', this.authService.isAuthenticated());
    if (!this.authService.isAuthenticated()) {
      console.warn('❌ [ProfileHistory] Utilisateur non authentifié, skip chargement CV');
      this.errorMessage = 'Veuillez vous connecter pour voir vos analyses.';
      this.loading = false;
      return;
    }

    // Récupère l'utilisateur courant
    const currentUser = this.authService.getCurrentUser();
    console.log('🔍 [ProfileHistory] currentUser:', currentUser);
    
    if (!currentUser || !currentUser.id) {
      console.warn('❌ [ProfileHistory] Pas d\'utilisateur courant ou pas d\'ID');
      this.errorMessage = 'Utilisateur non trouvé.';
      this.loading = false;
      return;
    }

    console.log('✅ [ProfileHistory] Chargement CV pour userId:', currentUser.id);
    console.log('✅ [ProfileHistory] Token présent:', !!this.authService.getToken());

    this.apiService.getUserCvAnalyses(currentUser.id).pipe(
      catchError((err) => {
        console.error('❌ Erreur récupération analyses CV', err);
        this.errorMessage = 'Impossible de récupérer les analyses de CV.';
        return of([]);
      }),
      finalize(() => {
        this.loading = false;
      })
    ).subscribe((response: any) => {
      console.log('📦 [ProfileHistory] Réponse brute:', response);
      
      let analyses: CvAnalysis[] = [];
      
      if (Array.isArray(response)) {
        // Le backend renvoie directement un tableau avec resume à la racine
        analyses = response.map((item: any) => {
          return {
            id: item.id,
            resume: item.resume || '',  // Le resume est à la racine
            skills: item.skills || [],
            experiences: item.experiences || [],
            score: item.score,
            matchingScore: item.matchingScore,
            matchedSkills: item.matchedSkills || [],
            missingSkills: item.missingSkills || [],
            dateAnalyse: item.dateAnalyse || item.user?.dateInscription
          } as CvAnalysis;
        });
      }

      console.log('✅ [ProfileHistory] Analyses transformées:', analyses.length);
      if (analyses.length > 0) {
        console.log('📝 [ProfileHistory] Premier resume:', analyses[0].resume);
      }
      
      this.cvAnalyses = analyses;
    });
  }
}
