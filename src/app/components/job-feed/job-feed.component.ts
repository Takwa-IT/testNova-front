import { Component, type OnInit } from "@angular/core"
import type { Offer, Comment } from "../../models/offer.model"
import { NgFor, NgIf, CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { ApiService } from "../../services/api.service"

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

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.loadOffers()
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

  onFileSelected(event: any): void {
    const file = event.target.files[0]
    if (file && file.type === "application/pdf" && this.selectedOfferId) {
      this.selectedFile = file
      this.uploadCv()
    } else {
      alert("Veuillez sélectionner un fichier PDF valide.")
    }
  }

  uploadCv(): void {
    if (this.selectedFile && this.selectedOfferId) {
      this.isUploading = true
      this.apiService.uploadCv(this.selectedFile, this.selectedOfferId).subscribe({
        next: (analysis) => {
          this.isUploading = false
          alert(`Analyse CV - Score: ${analysis.score}/100`)
        },
        error: (err) => {
          this.isUploading = false
          console.error("Erreur upload CV:", err)
          alert("Erreur lors de l'analyse du CV.")
        },
      })
    }
  }

  getTimeAgo(date: Date): string {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000)

    if (seconds < 60) return "À l'instant"
    if (seconds < 3600) return `Il y a ${Math.floor(seconds / 60)} min`
    if (seconds < 86400) return `Il y a ${Math.floor(seconds / 3600)} h`
    return `Il y a ${Math.floor(seconds / 86400)} j`
  }
}
