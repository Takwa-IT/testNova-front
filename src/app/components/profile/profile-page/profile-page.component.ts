import { Component } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ProfileInfoComponent } from '../profile-info/profile-info.component';
import { ProfileHistoryComponent } from '../profile-history/profile-history.component';
import { ProfileRecommendationsComponent } from '../profile-recommendations/profile-recommendations.component';

@Component({
  selector: 'app-profile-page',
  imports: [  MatTabsModule,
    MatToolbarModule,
   ProfileInfoComponent,
    ProfileHistoryComponent,
    ProfileRecommendationsComponent],
  templateUrl: './profile-page.component.html',
  standalone: true,
  styleUrl: './profile-page.component.css'
})
export class ProfilePageComponent {

}
