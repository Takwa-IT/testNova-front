import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

export interface RegisterRequest {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface VerifyRequest {
    email: string;
    code: string;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = 'http://localhost:8081/api/auth';  // Adjust to your Spring Boot URL

    constructor(private http: HttpClient, private router: Router) { }

    register(user: RegisterRequest): Observable<any> {
        return this.http.post(`${this.apiUrl}/register`, user);
    }

    login(credentials: LoginRequest): Observable<any> {
        return this.http.post(`${this.apiUrl}/login`, credentials);
    }

    verifyEmail(verify: VerifyRequest): Observable<any> {
        return this.http.post(`${this.apiUrl}/verify`, verify);
    }

    sendVerificationEmail(email: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/send-verification`, { email });
    }

    // Store JWT token after login/register
    setToken(token: string): void {
        localStorage.setItem('token', token);
    }

    getToken(): string | null {
        return localStorage.getItem('token');
    }

    logout(): void {
        localStorage.removeItem('token');
        this.router.navigate(['/login']);
    }

    isLoggedIn(): boolean {
        return !!this.getToken();
    }
}