import { Component } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ProfileInfoComponent } from '../profile-info/profile-info.component';
import { ProfileHistoryComponent } from '../profile-history/profile-history.component';
import { ProfileTestComponent } from '../profile-test/profile-test.component';

@Component({
  selector: 'app-profile-page',
  imports: [MatTabsModule,
    MatToolbarModule,
    ProfileInfoComponent,
    ProfileHistoryComponent,
    ProfileTestComponent],
  templateUrl: './profile-page.component.html',
  standalone: true,
  styleUrl: './profile-page.component.css'
})
export class ProfilePageComponent {

}
