import { Component, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CreditService } from '../../services/credit.service';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.html',
  styleUrls: ['./chatbot.css']
})
export class Chatbot implements AfterViewChecked {
  isOpen = false;
  isLoading = false;
  messages: { text: string, isBot: boolean, isHtml?: boolean }[] = [
    { text: 'Merhaba! 👋 Ben AI Kredi Asistanı. Size nasıl yardımcı olabilirim?', isBot: true, isHtml: false }
  ];
  userInput = '';

  @ViewChild('chatBody') private chatBody!: ElementRef;

  constructor(private router: Router, private creditService: CreditService) {}

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      setTimeout(() => this.scrollToBottom(), 100);
    }
  }

  sendMessage() {
    if (!this.userInput.trim() || this.isLoading) return;

    const userMsg = this.userInput;
    this.messages.push({ text: userMsg, isBot: false });
    this.userInput = '';
    this.isLoading = true;
    
    setTimeout(() => this.scrollToBottom(), 50);

    this.creditService.sendMessageToAi(userMsg).subscribe({
      next: (res) => {
        this.isLoading = false;
        const formattedText = this.formatResponse(res.response);
        this.messages.push({ text: formattedText, isBot: true, isHtml: true });
        setTimeout(() => this.scrollToBottom(), 50);
      },
      error: (err) => {
        this.isLoading = false;
        this.messages.push({ 
          text: '⚠️ Sistemle iletişim kurarken bir hata oluştu. Lütfen daha sonra tekrar deneyin.', 
          isBot: true, 
          isHtml: false 
        });
        setTimeout(() => this.scrollToBottom(), 50);
      }
    });
  }

  formatResponse(text: string): string {
    if (!text) return '';
    // Escape standard HTML first to prevent XSS
    let escaped = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

    // Replace newlines with <br>
    let formatted = escaped.replace(/\n/g, '<br>');
    
    // Replace **text** with <strong>text</strong> (restoring strong tags safely)
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    return formatted;
  }

  scrollToBottom(): void {
    try {
      if (this.chatBody) {
        this.chatBody.nativeElement.scrollTop = this.chatBody.nativeElement.scrollHeight;
      }
    } catch(err) { }
  }
}
