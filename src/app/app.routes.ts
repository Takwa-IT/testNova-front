import { Routes } from '@angular/router';
import { JobFeedComponent } from './components/job-feed/job-feed.component';
import { CvAnalysisComponent } from './components/cv-analysis/cv-analysis.component';
import { TestComponent } from './components/test/test.component';
import { ProfilePageComponent } from './components/profile/profile-page/profile-page.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { VerifyEmailComponent } from './components/verify-email/verify-email.component';
import { HRDashboardComponent } from './components/hr-dashboard/hr-dashboard.component';
import { HRGuard } from './Guards/hr.guard';
import { CandidatGuard } from './Guards/candidat.guard';
import { AuthGuard } from './Guards/auth.guards';

export const routes: Routes = [
    {
        path: '',
        redirectTo: '/login',
        pathMatch: 'full'
    },
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'register',
        component: RegisterComponent
    },
    {
        path: 'forgot-password',
        component: ForgotPasswordComponent
    },
    {
        path: 'reset-password',
        component: ResetPasswordComponent
    },
    {
        path: 'verify-email',
        component: VerifyEmailComponent
    },
    // ===== PAGES CANDIDAT (protégées par CandidatGuard) =====
    {
        path: 'feed',
        component: JobFeedComponent,
        canActivate: [CandidatGuard]
    },
    {
        path: 'analysecv',
        component: CvAnalysisComponent,
        canActivate: [CandidatGuard]
    },
    {
        path: 'test',
        component: TestComponent,
        canActivate: [CandidatGuard]
    },
    {
        path: 'jobfeed',
        component: JobFeedComponent,
        canActivate: [CandidatGuard]
    },
    {
        path: 'profile',
        component: ProfilePageComponent,
        canActivate: [AuthGuard]  // Accessible par tous les utilisateurs authentifiés
    },
    // ===== PAGES HR (protégées par HRGuard) =====
    {
        path: 'hr-dashboard',
        component: HRDashboardComponent,
        canActivate: [HRGuard]
    },
    {
        path: '**',
        redirectTo: '/login'
    },

];