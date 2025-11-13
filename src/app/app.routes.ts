import { Routes } from '@angular/router';
import { JobFeedComponent } from './components/job-feed/job-feed.component';
import { CvAnalysisComponent } from './components/cv-analysis/cv-analysis.component';
import { TestComponent } from './components/test/test.component';
import { ProfilePageComponent } from './components/profile/profile-page/profile-page.component';

export const routes: Routes = [
    {
        path: '',
        redirectTo: '/feed',
        pathMatch: 'full'
    },
    {
        path: 'full',
        component: JobFeedComponent
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
    {path: 'profile', component: ProfilePageComponent},
    {
        path: '**',
        redirectTo: '/feed'
    }
];