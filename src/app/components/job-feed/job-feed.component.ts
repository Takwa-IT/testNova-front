// src/app/components/job-feed/job-feed.component.ts
import { Component, OnInit, OnDestroy } from "@angular/core";
import { NgFor, NgIf, CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ApiService } from "../../services/api.service";
import { OffersService } from "../../services/offers.service";
import { FollowedCompaniesService } from "../../services/followed-companies.service";
import { CvAnalysisService } from "../../services/cv-analysis.service";
import { RouterModule } from "@angular/router";
import type { Offer } from "../../models/offer.model";
import { Subscription } from "rxjs";
import { calculateAverageScore } from "../../utils/skill-utils";

@Component({
  selector: "app-job-feed",
  standalone: true,
  imports: [NgIf, NgFor, CommonModule, FormsModule, RouterModule],
  templateUrl: "./job-feed.component.html",
  styleUrls: ["./job-feed.component.css"],
})
export class JobFeedComponent implements OnInit, OnDestroy {
  offers: Offer[] = [];
  selectedFile: File | null = null;
  selectedOffer: Offer | null = null;
  isUploading = false;
  progress = 0;
  newCommentText: { [key: number]: string } = {};
  suggestedCompanies: any[] = [];
  trendingHashtags: any[] = [];
  isLoadingOffers = true;
  isLoadingCompanies = true;
  isLoadingHashtags = true;
  newPostText = '';

  private subscriptions: Subscription[] = [];

  constructor(
    private apiService: ApiService,
    private offersService: OffersService,
    private followedCompaniesService: FollowedCompaniesService,
    private cvAnalysisService: CvAnalysisService
  ) { }

  ngOnInit(): void {
    this.loadOffers();
    this.loadFollowedCompanies();
    this.loadSuggestedCompanies();
    this.loadTrendingHashtags();

    // Subscribe to offers service
    this.subscriptions.push(
      this.offersService.offers$.subscribe(offers => {
        this.offers = offers;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // -------- OFFERS --------
  loadOffers(what = "developer", location = "france"): void {
    this.isLoadingOffers = true;
    this.apiService.getExternalOffers(what, location).subscribe({
      next: (data) => {
        const offers = data.map((offer) => ({
          ...offer,
          likes: offer.likes ?? Math.floor(Math.random() * 2000) + 500,
          comments: offer.comments ?? Math.floor(Math.random() * 1000) + 100,
          shares: offer.shares ?? Math.floor(Math.random() * 100) + 10,
          isLiked: false,
          commentsList: offer.commentsList ?? [],
        }));
        this.offersService.setOffers(offers);
        this.isLoadingOffers = false;
      },
      error: (err) => {
        console.error("Error loading offers:", err);
        this.offersService.setOffers([]);
        this.isLoadingOffers = false;
      },
    });
  }

  onLikeClick(offer: Offer): void {
    this.offersService.toggleLike(offer);
  }

  onCommentClick(offer: Offer): void {
    this.offersService.toggleCommentsVisibility(offer.id);
  }

  onShareClick(offer: Offer): void {
    this.offersService.shareOffer(offer);
  }

  onAddComment(offer: Offer): void {
    const text = this.newCommentText[offer.id]?.trim();
    if (!text) return;

    this.offersService.addComment(offer, text);
    this.newCommentText[offer.id] = "";
  }

  isCommentsVisible(offerId: number): boolean {
    const offer = this.offers.find(o => o.id === offerId);
    return offer?.showComments ?? false;
  }

  // -------- REGISTER CV --------
  onRegisterClick(offer: Offer): void {
    this.selectedOffer = offer;
    const fileInput = document.getElementById("cvFile") as HTMLInputElement;
    fileInput?.click();
  }

  async onFileSelected(event: any): Promise<void> {
    const file = event.target.files[0];
    if (!file || file.type !== "application/pdf" || !this.selectedOffer) return;

    this.selectedFile = file;
    this.isUploading = true;
    this.progress = 0;

    const cleanupProgress = this.cvAnalysisService.showProgress((progress) => {
      this.progress = progress;
    });

    try {
      await this.cvAnalysisService.analyzeCvWithOffer(file, this.selectedOffer);

      cleanupProgress();
      this.progress = 100;

      setTimeout(() => {
        this.isUploading = false;
        this.progress = 0;
      }, 500);
    } catch (error: any) {
      cleanupProgress();
      this.isUploading = false;
      this.progress = 0;
      alert(`Error: ${error.message || "Cannot read PDF"}`);
    }

    event.target.value = "";
  }

  // -------- UTILS --------
  getTimeAgo(date: Date): string {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} h ago`;
    return `${Math.floor(seconds / 86400)} d ago`;
  }

  // -------- FOLLOW COMPANIES --------
  followCompany(event: Event, companyName: string): void {
    this.followedCompaniesService.toggleFollow(companyName);
    this.followedCompaniesService.updateFollowButton(event.target as HTMLButtonElement, companyName);
  }

  private loadFollowedCompanies(): void {
    // Service loads automatically on init
  }

  private loadSuggestedCompanies(): void {
    this.isLoadingCompanies = true;
    this.apiService.getSuggestedCompanies().subscribe({
      next: (companies) => {
        this.suggestedCompanies = companies;
        this.isLoadingCompanies = false;
      },
      error: (err) => {
        console.error("Error loading suggested companies:", err);
        this.suggestedCompanies = [];
        this.isLoadingCompanies = false;
      },
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
        console.error("Error loading trending hashtags:", err);
        this.trendingHashtags = [];
        this.isLoadingHashtags = false;
      },
    });
  }

  private calculateScore(skills: any[]): number {
    return calculateAverageScore(skills || []);
  }

  // === PROGRESSION ANALYSE CV ===
  getCvAnalysisStep(): string {
    if (this.progress < 30) return "Lecture du PDF et extraction du texte...";
    if (this.progress < 60) return "Analyse des compétences techniques...";
    if (this.progress < 90) return "Évaluation du niveau et génération du test...";
    return "Finalisation de l’évaluation personnalisée...";
  }
}
