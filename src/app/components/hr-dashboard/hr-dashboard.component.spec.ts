// src/app/components/hr-dashboard/hr-dashboard.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { HRDashboardComponent } from './hr-dashboard.component';
import { HRService } from '../../services/hr.service';
import { of } from 'rxjs';
import { CandidateStatus } from '../../models/hr.model';

describe('HRDashboardComponent', () => {
    let component: HRDashboardComponent;
    let fixture: ComponentFixture<HRDashboardComponent>;
    let hrServiceSpy: jasmine.SpyObj<HRService>;

    const mockCandidates = [
        {
            id: 1,
            nom: 'Dupont',
            prenom: 'Jean',
            email: 'jean.dupont@email.com',
            score: 85,
            poste: 'Développeur Frontend',
            dateApplication: new Date(),
            status: CandidateStatus.PENDING
        },
        {
            id: 2,
            nom: 'Martin',
            prenom: 'Marie',
            email: 'marie.martin@email.com',
            score: 72,
            poste: 'Designer UX',
            dateApplication: new Date(),
            status: CandidateStatus.ACCEPTED
        }
    ];

    const mockStats = {
        totalCandidates: 10,
        pendingCandidates: 5,
        acceptedCandidates: 3,
        rejectedCandidates: 2
    };

    beforeEach(async () => {
        const spy = jasmine.createSpyObj('HRService', [
            'getCandidates',
            'getDashboardStats',
            'updateCandidateStatus'
        ]);
        spy.getCandidates.and.returnValue(of(mockCandidates));
        spy.getDashboardStats.and.returnValue(of(mockStats));

        await TestBed.configureTestingModule({
            imports: [HRDashboardComponent, HttpClientTestingModule, FormsModule],
            providers: [
                { provide: HRService, useValue: spy }
            ]
        }).compileComponents();

        hrServiceSpy = TestBed.inject(HRService) as jasmine.SpyObj<HRService>;
        fixture = TestBed.createComponent(HRDashboardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load candidates on init', () => {
        expect(hrServiceSpy.getCandidates).toHaveBeenCalled();
        expect(component.candidates.length).toBe(2);
    });

    it('should load stats on init', () => {
        expect(hrServiceSpy.getDashboardStats).toHaveBeenCalled();
        expect(component.stats).toEqual(mockStats);
    });

    it('should filter candidates by status', () => {
        component.statusFilter = 'PENDING';
        component.applyFilters();
        expect(component.filteredCandidates.length).toBe(1);
        expect(component.filteredCandidates[0].status).toBe(CandidateStatus.PENDING);
    });

    it('should filter candidates by search query', () => {
        component.searchQuery = 'Dupont';
        component.applyFilters();
        expect(component.filteredCandidates.length).toBe(1);
        expect(component.filteredCandidates[0].nom).toBe('Dupont');
    });

    it('should prepare accept action', () => {
        component.prepareAccept(mockCandidates[0]);
        expect(component.pendingAction).toEqual({
            candidateId: 1,
            action: CandidateStatus.ACCEPTED
        });
    });

    it('should prepare reject action', () => {
        component.prepareReject(mockCandidates[0]);
        expect(component.pendingAction).toEqual({
            candidateId: 1,
            action: CandidateStatus.REJECTED
        });
    });

    it('should cancel action', () => {
        component.prepareAccept(mockCandidates[0]);
        component.cancelAction();
        expect(component.pendingAction).toBeNull();
    });

    it('should return correct status badge class', () => {
        expect(component.getStatusBadgeClass(CandidateStatus.ACCEPTED)).toBe('badge-success');
        expect(component.getStatusBadgeClass(CandidateStatus.REJECTED)).toBe('badge-danger');
        expect(component.getStatusBadgeClass(CandidateStatus.PENDING)).toBe('badge-warning');
    });

    it('should return correct score class', () => {
        expect(component.getScoreClass(85)).toBe('score-excellent');
        expect(component.getScoreClass(65)).toBe('score-good');
        expect(component.getScoreClass(45)).toBe('score-average');
        expect(component.getScoreClass(30)).toBe('score-low');
    });
});
