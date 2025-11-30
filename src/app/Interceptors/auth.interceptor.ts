// src/app/interceptors/auth.interceptor.ts
import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor(private authService: AuthService) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const token = this.authService.getToken();

        // Only add Authorization header for backend requests (not external APIs like Adzuna)
        const isBackendRequest = request.url.includes('localhost:8082') || 
                                  request.url.includes('127.0.0.1:8082') ||
                                  request.url.startsWith('/api') ||
                                  request.url.startsWith('/analysecv') ||
                                  request.url.startsWith('/cvparuser');

        // Debug log
        console.debug('[AuthInterceptor]', {
            url: request.url,
            isBackendRequest,
            hasToken: !!token,
            tokenPreview: token ? token.substring(0, 20) + '...' : 'NONE'
        });

        if (token && isBackendRequest) {
            request = request.clone({
                setHeaders: {
                    Authorization: `Bearer ${token}`
                }
            });
        } else if (isBackendRequest && !token) {
            console.warn('[AuthInterceptor] ⚠️ No token available for backend request:', request.url);
        }

        return next.handle(request);
    }
}