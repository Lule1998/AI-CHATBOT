
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ChatMessage {
  text: string;
  isUser: boolean;
  time: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private readonly API_URL = 'http://localhost:3000';
  private messages = new BehaviorSubject<ChatMessage[]>([]);
  private isLoading = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) {
    // Dodaj inicijalnu poruku
    this.addMessage({
      text: 'Hello! How can I help you today?',
      isUser: false,
      time: new Date()
    });
  }

  getMessages(): Observable<ChatMessage[]> {
    return this.messages.asObservable();
  }

  getLoadingState(): Observable<boolean> {
    return this.isLoading.asObservable();
  }

  async sendMessage(messageText: string): Promise<void> {
    // Dodaj korisničku poruku
    this.addMessage({
      text: messageText,
      isUser: true,
      time: new Date()
    });

    this.isLoading.next(true);

    try {
      // Pripremi placeholder za AI odgovor
      const placeholderIndex = this.messages.value.length;
      this.addMessage({
        text: '',
        isUser: false,
        time: new Date()
      });

      const response = await fetch(`${this.API_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: messageText })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No reader available');
      }

      let accumulatedResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = new TextDecoder().decode(value);
        accumulatedResponse += text;

        // Ažuriraj trenutnu AI poruku
        const currentMessages = this.messages.value;
        currentMessages[placeholderIndex].text = accumulatedResponse;
        this.messages.next([...currentMessages]);
      }

    } catch (error) {
      console.error('Error:', error);
      this.addMessage({
        text: 'Sorry, I encountered an error. Please try again.',
        isUser: false,
        time: new Date()
      });
    } finally {
      this.isLoading.next(false);
    }
  }

  private addMessage(message: ChatMessage): void {
    const currentMessages = this.messages.value;
    this.messages.next([...currentMessages, message]);
  }

  clearMessages(): void {
    this.messages.next([{
      text: 'Hello! How can I help you today?',
      isUser: false,
      time: new Date()
    }]);
  }
}
