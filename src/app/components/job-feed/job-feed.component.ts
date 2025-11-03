// src/app/components/job-feed/job-feed.component.ts
import { Component, type OnInit } from "@angular/core"
import type { Offer, Comment } from "../../models/offer.model"
import { NgFor, NgIf, CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { ApiService } from "../../services/api.service"
import { PdfExtractorService } from "../../services/pdf-extractor.service"
import { MatDialog } from '@angular/material/dialog'
import { CvAnalysisComponent } from '../cv-analysis/cv-analysis.component'

@Component({
  selector: "app-job-feed",
  standalone: true,
  imports: [NgIf, NgFor, CommonModule, FormsModule],
  templateUrl: "./job-feed.component.html",
  styleUrls: ["./job-feed.component.css"],
})
export class JobFeedComponent implements OnInit {
  offers: Offer[] = []
  selectedFile: File | null = null
  selectedOfferId: number | null = null
  isUploading = false
  isLoadingOffers = true
  showCommentsForPost: { [key: number]: boolean } = {}
  newCommentText: { [key: number]: string } = {}
  newPostText = ''

  constructor(
    private apiService: ApiService,
    private pdfExtractor: PdfExtractorService,
    private dialog: MatDialog // 🆕 Injection du service Dialog
  ) { }

  ngOnInit(): void {
    this.loadOffers()
    this.loadFollowedCompanies()
  }

  loadOffers(what = "developer", location = "france"): void {
    this.isLoadingOffers = true
    this.apiService.getExternalOffers(what, location).subscribe({
      next: (data) => {
        this.offers = data.map((offer) => ({
          ...offer,
          likes: offer.likes || Math.floor(Math.random() * 2000) + 500,
          comments: offer.comments || Math.floor(Math.random() * 1000) + 100,
          shares: offer.shares || Math.floor(Math.random() * 100) + 10,
          isLiked: false,
          commentsList: offer.commentsList || [],
        }))
        this.isLoadingOffers = false
      },
      error: (err) => {
        console.error("Erreur chargement offres:", err)
        this.offers = []
        this.isLoadingOffers = false
      },
    })
  }

  onLikeClick(offer: Offer): void {
    if (offer.isLiked) {
      offer.likes--
      offer.isLiked = false
    } else {
      offer.likes++
      offer.isLiked = true
    }
  }

  onCommentClick(offer: Offer): void {
    this.showCommentsForPost[offer.id] = !this.showCommentsForPost[offer.id]
  }

  onShareClick(offer: Offer): void {
    offer.shares++
    navigator.clipboard.writeText(`Check out this job: ${offer.title} at ${offer.company}`)
    alert("Lien copié dans le presse-papier !")
  }

  onAddComment(offer: Offer): void {
    const commentText = this.newCommentText[offer.id]?.trim()
    if (commentText) {
      const newComment: Comment = {
        id: Date.now(),
        author: "Utilisateur actuel",
        authorAvatar: "/diverse-user-avatars.png",
        content: commentText,
        timestamp: new Date(),
      }
      if (!offer.commentsList) {
        offer.commentsList = []
      }
      offer.commentsList.unshift(newComment)
      offer.comments++
      this.newCommentText[offer.id] = ""
    }
  }

  isCommentsVisible(offerId: number): boolean {
    return this.showCommentsForPost[offerId] || false
  }

  onRegisterClick(offer: Offer): void {
    this.selectedOfferId = offer.id
    const fileInput = document.getElementById("cvFile") as HTMLInputElement
    fileInput.click()
  }

  // 🆕 MÉTHODE MODIFIÉE : Extraction PDF + Analyse IA
  async onFileSelected(event: any): Promise<void> {
    const file = event.target.files[0]

    if (!file) {
      return
    }

    if (file.type !== "application/pdf") {
      alert("Veuillez sélectionner un fichier PDF valide.")
      return
    }

    if (!this.selectedOfferId) {
      alert("Erreur : aucune offre sélectionnée.")
      return
    }

    this.selectedFile = file
    this.isUploading = true

    try {
      // 1️⃣ Extraire le texte du PDF
      console.log('📄 Extraction du texte du PDF...')
      const cvText = await this.pdfExtractor.extractTextFromPdf(file)

      if (!cvText || cvText.length < 50) {
        throw new Error('Le PDF semble vide ou illisible')
      }

      console.log('✅ Texte extrait:', cvText.substring(0, 200) + '...')

      // 2️⃣ Envoyer au backend pour analyse IA
      console.log('🤖 Envoi au backend pour analyse IA...')
      this.apiService.analyzeCvWithAI(cvText).subscribe({
        next: (rawResponse) => {
          console.log('📥 Réponse brute backend:', rawResponse)

          // 3️⃣ Parser la réponse JSON (le backend renvoie une string JSON)
          let analysis
          try {
            analysis = typeof rawResponse === 'string'
              ? JSON.parse(rawResponse)
              : rawResponse
          } catch (parseError) {
            console.error('Erreur parsing JSON:', parseError)
            throw new Error('Format de réponse invalide du backend')
          }

          // 4️⃣ Adapter le format pour le composant cv-analysis
          const adaptedAnalysis = {
            score: this.calculateScore(analysis.skills || []),
            skills: (analysis.skills || []).map((s: any) => ({
              name: s.name,
              level: this.mapLevel(s.level)
            })),
            experience: (analysis.experience || []).map((exp: any) => ({
              ...exp,
              competences: exp.competences || []
            })),
            resume: analysis.resume || ''
          }

          console.log('✅ Analyse adaptée:', adaptedAnalysis)

          // 5️⃣ Ouvrir le dialog avec les résultats
          this.isUploading = false
          this.dialog.open(CvAnalysisComponent, {
            width: '900px',
            maxHeight: '90vh',
            data: { analysis: adaptedAnalysis }
          })
        },
        error: (err) => {
          this.isUploading = false
          console.error('❌ Erreur analyse backend:', err)
          alert(`Erreur lors de l'analyse du CV: ${err.message || 'Erreur inconnue'}`)
        }
      })

    } catch (error: any) {
      this.isUploading = false
      console.error('❌ Erreur extraction PDF:', error)
      alert(`Erreur: ${error.message || 'Impossible de lire le PDF'}`)
    }

    // Réinitialiser l'input file
    event.target.value = ''
  }

  // 🆕 Calculer un score basé sur les compétences
  private calculateScore(skills: any[]): number {
    if (!skills || skills.length === 0) return 0;

    const levelScores: { [key: string]: number } = {
      'expert': 100,
      'advanced': 75,
      'intermediate': 50,
      'beginner': 25
    };

    const totalScore = skills.reduce((sum, skill) => {
      const level = skill?.level;  // Guard : skill.level safe
      if (!level) return sum;  // Skip si undefined
      const lower = level.toLowerCase();  // Safe
      return sum + (levelScores[lower] || 0);
    }, 0);

    return Math.round(totalScore / skills.length);
  }

  // 🆕 Mapper les niveaux backend vers frontend
  private mapLevel(level: string | undefined): 'beginner' | 'intermediate' | 'advanced' | 'expert' {
    if (!level) return 'beginner';  // Guard : fallback si undefined/null/empty
    const lower = level.toLowerCase();  // Safe maintenant
    const mapping: { [key: string]: 'beginner' | 'intermediate' | 'advanced' | 'expert' } = {
      'beginner': 'beginner',
      'intermediate': 'intermediate',
      'advanced': 'advanced',
      'expert': 'expert'
    };
    return mapping[lower] || 'beginner';
  }

  // Méthode obsolète, gardée pour compatibilité
  uploadCv(): void {
    // Cette méthode n'est plus utilisée, tout est géré dans onFileSelected
  }

  getTimeAgo(date: Date): string {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000)
    if (seconds < 60) return "À l'instant"
    if (seconds < 3600) return `Il y a ${Math.floor(seconds / 60)} min`
    if (seconds < 86400) return `Il y a ${Math.floor(seconds / 3600)} h`
    return `Il y a ${Math.floor(seconds / 86400)} j`
  }

  followedCompanies: Set<string> = new Set();


  followCompany(event: Event, companyName: string): void {
    const button = event.target as HTMLButtonElement;

    if (this.followedCompanies.has(companyName)) {
      // Désabonnement
      this.followedCompanies.delete(companyName);
      this.updateFollowButton(button, false);
      console.log(`Désabonné de ${companyName}`);
    } else {
      // Abonnement
      this.followedCompanies.add(companyName);
      this.updateFollowButton(button, true);
      console.log(`Abonné à ${companyName}`);
    }

    this.saveFollowedCompanies();
  }

  private updateFollowButton(button: HTMLButtonElement, isFollowing: boolean): void {
    if (isFollowing) {
      button.classList.add('following');
      button.textContent = 'Abonné';
    } else {
      button.classList.remove('following');
      button.textContent = 'Suivre';
    }

    // Animation
    button.style.transform = 'scale(0.95)';
    setTimeout(() => {
      button.style.transform = 'scale(1)';
    }, 150);
  }

  private loadFollowedCompanies(): void {
    // Charger depuis le localStorage ou une API
    const saved = localStorage.getItem('followedCompanies');
    if (saved) {
      this.followedCompanies = new Set(JSON.parse(saved));

      // Mettre à jour les boutons au chargement
      setTimeout(() => this.updateAllFollowButtons(), 100);
    }
  }

  private saveFollowedCompanies(): void {
    // Sauvegarder dans le localStorage ou une API
    localStorage.setItem('followedCompanies', JSON.stringify([...this.followedCompanies]));
  }

  private updateAllFollowButtons(): void {
    const buttons = document.querySelectorAll('.btn-follow');
    buttons.forEach(button => {
      const companyName = button.getAttribute('data-company');
      if (companyName && this.followedCompanies.has(companyName)) {
        button.classList.add('following');
        button.textContent = 'Abonné';
      }
    });
  }
}