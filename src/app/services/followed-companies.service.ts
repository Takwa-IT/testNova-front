import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FollowedCompaniesService {
  private followedCompaniesSubject = new BehaviorSubject<Set<string>>(new Set());
  public followedCompanies$ = this.followedCompaniesSubject.asObservable();

  constructor() {
    this.loadFollowedCompanies();
  }

  // Get current followed companies
  getFollowedCompanies(): Set<string> {
    return this.followedCompaniesSubject.value;
  }

  // Check if company is followed
  isFollowing(companyName: string): boolean {
    return this.followedCompaniesSubject.value.has(companyName);
  }

  // Follow company
  followCompany(companyName: string): void {
    const current = new Set(this.followedCompaniesSubject.value);
    current.add(companyName);
    this.followedCompaniesSubject.next(current);
    this.saveFollowedCompanies();
  }

  // Unfollow company
  unfollowCompany(companyName: string): void {
    const current = new Set(this.followedCompaniesSubject.value);
    current.delete(companyName);
    this.followedCompaniesSubject.next(current);
    this.saveFollowedCompanies();
  }

  // Toggle follow status
  toggleFollow(companyName: string): void {
    if (this.isFollowing(companyName)) {
      this.unfollowCompany(companyName);
    } else {
      this.followCompany(companyName);
    }
  }

  // Update follow button
  updateFollowButton(button: HTMLButtonElement, companyName: string): void {
    const isFollowing = this.isFollowing(companyName);
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

  // Update all follow buttons
  updateAllFollowButtons(): void {
    const buttons = document.querySelectorAll('.btn-follow');
    buttons.forEach(button => {
      const companyName = button.getAttribute('data-company');
      if (companyName) {
        this.updateFollowButton(button as HTMLButtonElement, companyName);
      }
    });
  }

  // Load from localStorage
  private loadFollowedCompanies(): void {
    const saved = localStorage.getItem('followedCompanies');
    if (saved) {
      this.followedCompaniesSubject.next(new Set(JSON.parse(saved)));
      // Update buttons on load
      setTimeout(() => this.updateAllFollowButtons(), 100);
    }
  }

  // Save to localStorage
  private saveFollowedCompanies(): void {
    localStorage.setItem('followedCompanies', JSON.stringify([...this.followedCompaniesSubject.value]));
  }
}
