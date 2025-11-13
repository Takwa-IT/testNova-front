import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import type { Offer, Comment } from '../models/offer.model';

@Injectable({
  providedIn: 'root'
})
export class OffersService {
  private offersSubject = new BehaviorSubject<Offer[]>([]);
  public offers$ = this.offersSubject.asObservable();

  constructor() {}

  // Get current offers
  getOffers(): Offer[] {
    return this.offersSubject.value;
  }

  // Set offers
  setOffers(offers: Offer[]): void {
    this.offersSubject.next(offers);
  }

  // Update specific offer
  updateOffer(updatedOffer: Offer): void {
    const currentOffers = this.offersSubject.value;
    const index = currentOffers.findIndex(offer => offer.id === updatedOffer.id);
    if (index !== -1) {
      currentOffers[index] = updatedOffer;
      this.offersSubject.next([...currentOffers]);
    }
  }

  // Like/Unlike offer
  toggleLike(offer: Offer): void {
    const updatedOffer = { ...offer };
    updatedOffer.isLiked = !updatedOffer.isLiked;
    updatedOffer.likes += updatedOffer.isLiked ? 1 : -1;
    this.updateOffer(updatedOffer);
  }

  // Add comment to offer
  addComment(offer: Offer, commentText: string): void {
    const newComment: Comment = {
      id: Date.now(),
      author: "Current user",
      authorAvatar: "/diverse-user-avatars.png",
      content: commentText,
      timestamp: new Date(),
    };

    const updatedOffer = { ...offer };
    updatedOffer.commentsList = updatedOffer.commentsList || [];
    updatedOffer.commentsList.unshift(newComment);
    updatedOffer.comments++;
    this.updateOffer(updatedOffer);
  }

  // Toggle comments visibility
  toggleCommentsVisibility(offerId: number): void {
    const currentOffers = this.offersSubject.value;
    const offer = currentOffers.find(o => o.id === offerId);
    if (offer) {
      const updatedOffer = { ...offer };
      updatedOffer.showComments = !updatedOffer.showComments;
      this.updateOffer(updatedOffer);
    }
  }

  // Share offer
  shareOffer(offer: Offer): void {
    const updatedOffer = { ...offer };
    updatedOffer.shares++;
    navigator.clipboard.writeText(`Check out this job: ${updatedOffer.title} at ${updatedOffer.company}`);
    alert("Link copied to clipboard!");
    this.updateOffer(updatedOffer);
  }

  // Get time ago string
  getTimeAgo(date: Date): string {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} h ago`;
    return `${Math.floor(seconds / 86400)} d ago`;
  }
}
