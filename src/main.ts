// src/main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { ChatComponent } from './app/components/chat/chat.component';

bootstrapApplication(ChatComponent, {
  providers: [
    provideHttpClient(),
    provideAnimations()
  ]
}).catch(err => console.error(err));