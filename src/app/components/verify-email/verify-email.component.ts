import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.css']
})
export class VerifyEmailComponent implements OnInit {
  token: string = '';
  loading = true;
  verified = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Récupérer le token depuis l'URL
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || '';
      
      if (this.token) {
        this.verifyEmail();
      } else {
        this.errorMessage = 'Token de vérification manquant.';
        this.loading = false;
      }
    });
  }

  verifyEmail(): void {
    this.authService.verifyEmail(this.token).subscribe({
      next: () => {
        this.verified = true;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur vérification email:', err);
        this.errorMessage = err.error?.message || 'Le lien de vérification est invalide ou a expiré.';
        this.loading = false;
      }
    });
  }

  resendEmail(): void {
    // Redirect to login with resend option
    // This would require knowing the email, typically handled differently
  }
}
