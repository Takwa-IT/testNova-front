import { Routes } from '@angular/router';
import { JobFeedComponent } from './components/job-feed/job-feed.component';
import { CvAnalysisComponent } from './components/cv-analysis/cv-analysis.component';

export const routes: Routes = [
    {
        path: 'feed',
        component: JobFeedComponent

    },

    {
        path: 'analysecv',
        component: CvAnalysisComponent
    },

    {

        path: '**',
        component: JobFeedComponent
    },

    {

        path: 'full',
        component: JobFeedComponent
    },

];
