import { bootstrapApplication } from '@angular/platform-browser';
import { enableProdMode } from '@angular/core';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

enableProdMode();

bootstrapApplication(AppComponent, appConfig).then((r) => null);
