import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { JobFeedComponent } from "./components/job-feed/job-feed.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterModule, JobFeedComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'testNova';
}
