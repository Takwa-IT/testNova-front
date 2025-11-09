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
  progress = 0;  // Progression pour l'analyse CV
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
    this.loadSuggestedCompanies()
    this.loadTrendingHashtags()
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
        console.error("Error loading offers:", err)
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
    alert("Link copied to clipboard!")
  }

  onAddComment(offer: Offer): void {
    const commentText = this.newCommentText[offer.id]?.trim()
    if (commentText) {
      const newComment: Comment = {
        id: Date.now(),
        author: "Current user",
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

  // 🆕 MÉTHODE MODIFIÉE : Extraction PDF + Analyse IA avec progression
  async onFileSelected(event: any): Promise<void> {
    const file = event.target.files[0]

    if (!file) {
      return
    }

    if (file.type !== "application/pdf") {
      alert("Please select a valid PDF file.")
      return
    }

    if (!this.selectedOfferId) {
      alert("Error: No offer selected.")
      return
    }

    this.selectedFile = file
    this.isUploading = true
    this.progress = 0

    // Simulation de progression élégante (courbe non linéaire)
    const progressInterval = setInterval(() => {
      this.progress += Math.random() * 15
      if (this.progress > 95) {
        this.progress = 95  // Pause avant fin
      }
    }, 200)

    try {
      // 1️⃣ Extraire le texte du PDF
      console.log('📄 Extracting PDF text...')
      const cvText = await this.pdfExtractor.extractTextFromPdf(file)

      if (!cvText || cvText.length < 50) {
        throw new Error('The PDF seems empty or unreadable')
      }

      console.log('✅ Text extracted:', cvText.substring(0, 200) + '...')

      // 2️⃣ Envoyer au backend pour analyse IA
      console.log('🤖 Sending to backend for AI analysis...')
      this.apiService.analyzeCvWithAI(cvText).subscribe({
        next: (rawResponse) => {
          clearInterval(progressInterval)
          this.progress = 100

          console.log('📥 Raw backend response:', rawResponse)

          // 3️⃣ Parser la réponse JSON si nécessaire (compatibilité)
          let analysis
          try {
            analysis = typeof rawResponse === 'string' ? JSON.parse(rawResponse) : rawResponse
          } catch (parseError) {
            console.error('JSON parsing error:', parseError)
            throw new Error('Invalid backend response format')
          }

          // 4️⃣ Adapter le format pour le composant cv-analysis
          const backendSkills = analysis.skills || []

          let mappedSkills: any[] = []
          let skillsGroup: any = undefined

          if (Array.isArray(backendSkills)) {
            // Ancien format : un tableau de skills
            mappedSkills = backendSkills.map((s: any) => ({
              name: s.name,
              level: this.mapLevel(s.level)
            }))
          } else {
            // Nouveau format : { hardSkills: [...], softSkills: [...] }
            const hard = (backendSkills.hardSkills || []).map((s: any) => ({
              name: s.name,
              level: this.mapLevel(s.level)
            }))
            const soft = (backendSkills.softSkills || []).map((s: any) => ({
              name: s.name,
              level: this.mapLevel(s.level)
            }))
            mappedSkills = [...hard, ...soft]
            skillsGroup = { hardSkills: backendSkills.hardSkills || [], softSkills: backendSkills.softSkills || [] }
          }

          const adaptedAnalysis = {
            score: this.calculateScore(mappedSkills),
            skills: mappedSkills,
            // Conserver la structure groupée si fournie (utile pour le composant)
            skillsGroup,
            experience: (analysis.experience || []).map((exp: any) => ({
              ...exp,
              competencies: exp.competencies || []
            })),
            resume: analysis.resume || ''
          }

          console.log('✅ Adapted analysis:', adaptedAnalysis)

          // 5️⃣ Ouvrir le dialog avec les résultats
          setTimeout(() => {
            this.isUploading = false
            this.progress = 0  // Reset
            this.dialog.open(CvAnalysisComponent, {
              width: '900px',
              maxHeight: '90vh',
              data: { analysis: adaptedAnalysis }
            })
          }, 500)  // Délai pour voir 100%
        },
        error: (err) => {
          clearInterval(progressInterval)
          this.isUploading = false
          this.progress = 0
          console.error('❌ Backend analysis error:', err)
          alert(`CV analysis error: ${err.message || 'Unknown error'}`)
        }
      })

    } catch (error: any) {
      clearInterval(progressInterval)
      this.isUploading = false
      this.progress = 0
      console.error('❌ PDF extraction error:', error)
      alert(`Error: ${error.message || 'Cannot read PDF'}`)
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
      const level = skill?.level;
      if (!level) return sum;
      const lower = level.toLowerCase();
      return sum + (levelScores[lower] || 0);
    }, 0);

    return Math.round(totalScore / skills.length);
  }

  // 🆕 Mapper les niveaux backend vers frontend
  private mapLevel(level: string | undefined): 'beginner' | 'intermediate' | 'advanced' | 'expert' {
    if (!level) return 'beginner';
    const lower = level.toLowerCase();
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
    if (seconds < 60) return "Just now"
    if (seconds < 3600) return ` ${Math.floor(seconds / 60)} min ago`
    if (seconds < 86400) return ` ${Math.floor(seconds / 3600)} h ago`
    return ` ${Math.floor(seconds / 86400)} d ago`
  }

  followedCompanies: Set<string> = new Set();

  suggestedCompanies: any[] = [];
  trendingHashtags: any[] = [];
  isLoadingCompanies = true;
  isLoadingHashtags = true;


  followCompany(event: Event, companyName: string): void {
    const button = event.target as HTMLButtonElement;

    if (this.followedCompanies.has(companyName)) {
      // Unfollow
      this.followedCompanies.delete(companyName);
      this.updateFollowButton(button, false);
      console.log(`Unfollowed ${companyName}`);
    } else {
      // Follow
      this.followedCompanies.add(companyName);
      this.updateFollowButton(button, true);
      console.log(`Followed ${companyName}`);
    }

    this.saveFollowedCompanies();
  }

  private updateFollowButton(button: HTMLButtonElement, isFollowing: boolean): void {
    if (isFollowing) {
      button.classList.add('following');
      button.textContent = 'Following';
    } else {
      button.classList.remove('following');
      button.textContent = 'Follow';
    }

    // Animation
    button.style.transform = 'scale(0.95)';
    setTimeout(() => {
      button.style.transform = 'scale(1)';
    }, 150);
  }

  private loadFollowedCompanies(): void {
    // Charge from localStorage or API
    const saved = localStorage.getItem('followedCompanies');
    if (saved) {
      this.followedCompanies = new Set(JSON.parse(saved));

      // Update buttons on load
      setTimeout(() => this.updateAllFollowButtons(), 100);
    }
  }

  private saveFollowedCompanies(): void {
    // Save to localStorage or API
    localStorage.setItem('followedCompanies', JSON.stringify([...this.followedCompanies]));
  }

  private updateAllFollowButtons(): void {
    const buttons = document.querySelectorAll('.btn-follow');
    buttons.forEach(button => {
      const companyName = button.getAttribute('data-company');
      if (companyName && this.followedCompanies.has(companyName)) {
        button.classList.add('following');
        button.textContent = 'Following';
      }
    });
  }

  private loadSuggestedCompanies(): void {
    this.isLoadingCompanies = true;
    this.apiService.getSuggestedCompanies().subscribe({
      next: (companies) => {
        this.suggestedCompanies = companies;
        this.isLoadingCompanies = false;
      },
      error: (err) => {
        console.error('Error loading suggested companies:', err);
        this.suggestedCompanies = [];
        this.isLoadingCompanies = false;
      }
    });
  }

  private loadTrendingHashtags(): void {
    this.isLoadingHashtags = true;
    this.apiService.getTrendingHashtags().subscribe({
      next: (hashtags) => {
        this.trendingHashtags = hashtags;
        this.isLoadingHashtags = false;
      },
      error: (err) => {
        console.error('Error loading trending hashtags:', err);
        this.trendingHashtags = [];
        this.isLoadingHashtags = false;
      }
    });
  }
}