// src/main.server.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { renderApplication } from '@angular/platform-server'; // Import clé pour contexte SSR
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

const bootstrap = () => bootstrapApplication(AppComponent, appConfig);

// Fonction de rendering SSR avec contexte (fix pour NG0401)
export default async function render(url: string, document: string) {
    const html = await renderApplication(bootstrap, {
        document,  // Le document HTML à rendre
        url        // L'URL demandée (pour routing serveur)
    });

    return html;
}