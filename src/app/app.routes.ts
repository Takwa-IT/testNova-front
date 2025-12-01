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
    {
        path: 'feed',
        component: JobFeedComponent
    },
    {
        path: 'analysecv',
        component: CvAnalysisComponent
    },
    {
        path: 'test',
        component: TestComponent
    },
    {
        path: 'jobfeed',
        component: JobFeedComponent
    },

    {
        path: 'profile',
        component: ProfilePageComponent
    },
    {
        path: '**',
        redirectTo: '/login'
    },

];