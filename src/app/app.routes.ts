import { Routes } from '@angular/router';
import { JobFeedComponent } from './components/job-feed/job-feed.component';
import { CvAnalysisComponent } from './components/cv-analysis/cv-analysis.component';
import { TestComponent } from './test/test.component';

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
    {
        path: '**',
        redirectTo: '/feed'
    }
];