// src/main.server.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { renderApplication } from '@angular/platform-server';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

const bootstrap = () => bootstrapApplication(AppComponent, appConfig);

export default async function render(url: string, document: string) {
  const html = await renderApplication(bootstrap, {
    document,
    url
  });
  return html;
}