import { APP_INITIALIZER, ApplicationConfig, provideZoneChangeDetection } from "@angular/core";
import { provideRouter } from "@angular/router";
import { routes } from "@app/app.routes";
import { provideHttpClient, withFetch } from "@angular/common/http";
import { WorkerController } from "@app/services/controller";
import { provideServiceWorker } from "@angular/service-worker";
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withFetch()),
    provideServiceWorker("worker.js"),
    provideAnimationsAsync(),
  ],
};
