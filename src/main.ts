import { bootstrapApplication } from '@angular/platform-browser';
import { RegisterComponent } from './app/register/register.component';
import { provideHttpClient } from '@angular/common/http';

bootstrapApplication(RegisterComponent, {
  providers: [provideHttpClient()]
});