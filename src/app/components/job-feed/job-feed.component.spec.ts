import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobFeedComponent } from './job-feed.component';

describe('JobFeedComponent', () => {
  let component: JobFeedComponent;
  let fixture: ComponentFixture<JobFeedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobFeedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JobFeedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
