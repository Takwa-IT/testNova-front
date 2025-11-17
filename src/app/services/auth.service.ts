// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoginRequest, RegisterRequest, JwtResponse, User } from '../models/auth.model';
import { ApiService } from './api.service';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private currentUserSubject = new BehaviorSubject<User | null>(null);
    public currentUser$ = this.currentUserSubject.asObservable();

    constructor(
        private http: HttpClient,
        private apiService: ApiService
    ) {
        this.loadUserFromStorage();
    }

    private loadUserFromStorage() {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('currentUser');
        if (token && user) {
            this.currentUserSubject.next(JSON.parse(user));
        }
    }

    login(loginRequest: LoginRequest): Observable<JwtResponse> {
        return this.http.post<JwtResponse>(
            this.apiService.getAuthUrl('login'),
            loginRequest
        ).pipe(
            tap(response => {
                this.storeAuthData(response);
            })
        );
    }

    register(registerRequest: RegisterRequest): Observable<any> {
        return this.http.post(
            this.apiService.getAuthUrl('register'),
            registerRequest
        );
    }

    checkEmail(email: string): Observable<{ exists: boolean }> {
        return this.http.get<{ exists: boolean }>(
            `${this.apiService.getAuthUrl('check-email')}?email=${email}`
        );
    }

    forgotPassword(email: string): Observable<any> {
        return this.http.post(
            this.apiService.getAuthUrl('forgot-password'),
            { email }
        );
    }

    resetPassword(token: string, newPassword: string): Observable<any> {
        return this.http.post(
            this.apiService.getAuthUrl('reset-password'),
            { token, newPassword }
        );
    }

    loginWithGoogle(): Observable<any> {
        // Implémentation de la connexion Google
        return this.http.post(
            this.apiService.getAuthUrl('google'),
            {}
        );
    }

    private storeAuthData(response: JwtResponse) {
        localStorage.setItem('token', response.token);
        const user: User = {
            id: response.id,
            nom: response.nom,
            prenom: response.prenom,
            email: response.email,
            roles: response.roles
        };
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUserSubject.next(user);
    }

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
        this.currentUserSubject.next(null);
    }

    getToken(): string | null {
        return localStorage.getItem('token');
    }

    isAuthenticated(): boolean {
        return !!this.getToken();
    }

    isHR(): boolean {
        const user = this.currentUserSubject.value;
        return user ? user.roles.includes('ROLE_HR') : false;
    }

    isCandidat(): boolean {
        const user = this.currentUserSubject.value;
        return user ? user.roles.includes('ROLE_CANDIDAT') : false;
    }

    getCurrentUser(): User | null {
        return this.currentUserSubject.value;
    }

    updateUserProfile(userData: Partial<User>): Observable<any> {
        return this.http.put(
            this.apiService.getAuthUrl('profile'),
            userData
        ).pipe(
            tap(response => {
                const currentUser = this.currentUserSubject.value;
                if (currentUser) {
                    const updatedUser = { ...currentUser, ...userData };
                    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
                    this.currentUserSubject.next(updatedUser);
                }
            })
        );
    }
}