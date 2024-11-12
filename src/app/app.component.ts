// src/app/components/chat/chat.component.ts
import { Component, ViewChild, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, takeUntil } from 'rxjs';
import { ChatService, ChatMessage } from '../app/services/chat.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="chat-container">
      <!-- Toolbar -->
      <mat-toolbar color="primary" class="chat-toolbar">
        <span>AI Chat Assistant</span>
        <span class="spacer"></span>
        <button mat-icon-button (click)="clearChat()">
          <mat-icon>delete_outline</mat-icon>
        </button>
      </mat-toolbar>

      <!-- Messages Area -->
      <div class="messages-area" #scrollContainer>
        <div class="message-wrapper" *ngFor="let msg of messages">
          <div class="message" [ngClass]="{'user-message': msg.isUser, 'bot-message': !msg.isUser}">
            <div class="message-content">
              {{msg.text}}
              <mat-progress-spinner
                *ngIf="isLoading && !msg.isUser && msg.text === ''"
                [diameter]="20"
                mode="indeterminate"
                class="spinner">
              </mat-progress-spinner>
            </div>
            <span class="message-time">{{msg.time | date:'shortTime'}}</span>
          </div>
        </div>
      </div>

      <!-- Input Area -->
      <div class="input-area">
        <form [formGroup]="chatForm" (ngSubmit)="sendMessage()" class="input-form">
          <mat-form-field appearance="outline" class="message-input">
            <input matInput
                   formControlName="message"
                   placeholder="Type your message..."
                   [disabled]="isLoading">
          </mat-form-field>
          <button mat-fab 
                  color="primary"
                  type="submit"
                  [disabled]="!chatForm.valid || isLoading">
            <mat-icon>send</mat-icon>
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .chat-container {
      height: 100vh;
      display: flex;
      flex-direction: column;
      background-color: #f5f5f5;
    }

    .chat-toolbar {
      position: sticky;
      top: 0;
      z-index: 1000;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .spacer {
      flex: 1 1 auto;
    }

    .messages-area {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .message-wrapper {
      display: flex;
      margin: 4px 0;
    }

    .message {
      max-width: 70%;
      padding: 12px 16px;
      border-radius: 12px;
      position: relative;
    }

    .user-message {
      margin-left: auto;
      background-color: #2196f3;
      color: white;
      border-bottom-right-radius: 4px;
    }

    .bot-message {
      margin-right: auto;
      background-color: white;
      color: #333;
      border-bottom-left-radius: 4px;
      box-shadow: 0 1px 2px rgba(0,0,0,0.1);
    }

    .message-content {
      margin: 0;
      font-size: 14px;
      line-height: 1.4;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .message-time {
      font-size: 11px;
      opacity: 0.7;
      margin-top: 4px;
      display: block;
    }

    .input-area {
      padding: 16px;
      background-color: white;
      border-top: 1px solid rgba(0,0,0,0.1);
    }

    .input-form {
      display: flex;
      gap: 16px;
      align-items: center;
    }

    .message-input {
      flex: 1;
      margin-bottom: -1.25em;
    }

    .spinner {
      width: 20px !important;
      height: 20px !important;
    }

    ::ng-deep .message-input .mat-mdc-form-field-subscript-wrapper {
      display: none;
    }

    ::ng-deep .mat-mdc-progress-spinner {
      --mdc-circular-progress-active-indicator-color: #2196f3;
    }

    @media (max-width: 600px) {
      .message {
        max-width: 85%;
      }

      .input-area {
        padding: 12px;
      }

      .input-form {
        gap: 8px;
      }
    }
  `]
})
export class ChatComponent implements OnInit, OnDestroy {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  messages: ChatMessage[] = [];
  isLoading = false;
  private destroy$ = new Subject<void>();

  chatForm = new FormGroup({
    message: new FormControl('', [Validators.required, Validators.minLength(1)])
  });

  constructor(private chatService: ChatService) {}

  ngOnInit() {
    // Pretplata na poruke
    this.chatService.getMessages()
      .pipe(takeUntil(this.destroy$))
      .subscribe((messages: ChatMessage[]) => {
        this.messages = messages;
        this.scrollToBottom();
      });

    // Pretplata na loading state
    this.chatService.getLoadingState()
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.isLoading = state;
        if (!state) {
          this.scrollToBottom();
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async sendMessage() {
    if (this.chatForm.valid && !this.isLoading) {
      const messageText = this.chatForm.get('message')?.value;
      if (messageText) {
        try {
          this.chatForm.reset();
          this.chatForm.get('message')?.disable();
          await this.chatService.sendMessage(messageText);
        } catch (error) {
          console.error('Error sending message:', error);
        } finally {
          this.chatForm.get('message')?.enable();
        }
      }
    }
  }

  clearChat() {
    this.chatService.clearMessages();
  }

  private scrollToBottom(): void {
    try {
      setTimeout(() => {
        if (this.scrollContainer) {
          const element = this.scrollContainer.nativeElement;
          element.scrollTop = element.scrollHeight;
        }
      });
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }
}