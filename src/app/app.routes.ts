import { Routes } from '@angular/router';
import { JobFeedComponent } from './components/job-feed/job-feed.component';
import { CvAnalysisComponent } from './components/cv-analysis/cv-analysis.component';

export const routes: Routes = [
    {
        path: 'feed',
        component: JobFeedComponent

    },

    {
        path: 'cv-analyse',
        component: CvAnalysisComponent
    },

    {

        path: '**',
        component: JobFeedComponent
    },



];
