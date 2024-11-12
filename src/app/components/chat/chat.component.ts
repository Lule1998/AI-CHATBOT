import { Component, ViewChild, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

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
    MatFormFieldModule
  ],
  template: `
    <div class="chat-container">
      <mat-toolbar color="primary" class="chat-toolbar">
        <span>AI Chat Assistant</span>
        <span class="spacer"></span>
        <button mat-icon-button (click)="clearChat()">
          <mat-icon>delete_outline</mat-icon>
        </button>
      </mat-toolbar>

      <div class="messages-area" #scrollContainer>
        <div class="message-wrapper" *ngFor="let msg of messages">
          <div class="message" [ngClass]="{'user-message': msg.isUser, 'bot-message': !msg.isUser}">
            <p class="message-content">{{msg.text}}</p>
            <span class="message-time">{{msg.time | date:'shortTime'}}</span>
          </div>
        </div>
      </div>

      <div class="input-area">
        <form [formGroup]="chatForm" (ngSubmit)="sendMessage()" class="input-form">
          <mat-form-field appearance="outline" class="message-input">
            <input matInput
                   formControlName="message"
                   placeholder="Type your message..."
                   (keyup.enter)="sendMessage()">
          </mat-form-field>
          <button mat-fab 
                  color="primary"
                  type="submit"
                  [disabled]="!chatForm.valid">
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

    ::ng-deep .message-input .mat-mdc-form-field-subscript-wrapper {
      display: none;
    }
  `]
})
export class ChatComponent implements OnInit, OnDestroy {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  messages: Array<{
    text: string;
    isUser: boolean;
    time: Date;
  }> = [];

  chatForm = new FormGroup({
    message: new FormControl('', [Validators.required])
  });

  ngOnInit() {
    this.messages.push({
      text: 'Hello! How can I help you today?',
      isUser: false,
      time: new Date()
    });
  }

  ngOnDestroy() {
  }

  sendMessage() {
    if (this.chatForm.valid) {
      const messageText = this.chatForm.get('message')?.value;
      if (messageText) {
        this.messages.push({
          text: messageText,
          isUser: true,
          time: new Date()
        });

        setTimeout(() => {
          this.messages.push({
            text: 'This is a simulated response. Backend integration needed for real AI responses.',
            isUser: false,
            time: new Date()
          });
          this.scrollToBottom();
        }, 1000);

        this.chatForm.reset();
        this.scrollToBottom();
      }
    }
  }

  clearChat() {
    this.messages = [{
      text: 'Hello! How can I help you today?',
      isUser: false,
      time: new Date()
    }];
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