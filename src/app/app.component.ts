import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { JobFeedComponent } from "./components/job-feed/job-feed.component";
import { CvAnalysisComponent } from './components/cv-analysis/cv-analysis.component';
import { TestComponent } from './components/test/test.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'testNova';
}
