import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  input,
  Signal,
} from '@angular/core';

export type FrontendTabId = 'iframe' | 'angular' | 'react' | 'vanilla';
export type BackendTabId = 'curl' | 'nodejs' | 'python' | 'laravel';

interface SnippetTab<T extends string> {
  id: T;
  label: string;
}

@Component({
  selector: 'app-code-snippet-tabs',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './code-snippet-tabs.component.html',
})
export class CodeSnippetTabsComponent {
  chatUrl = input.required<string>();
  apiKey = input<string>('');
  baseApiUrl = input<string>('http://localhost:8000/api/v1');

  protected readonly activeFrontend = signal<FrontendTabId>('iframe');
  protected readonly activeBackend = signal<BackendTabId>('curl');
  protected readonly copiedSnippet = signal<string | null>(null);

  protected readonly frontendTabs: ReadonlyArray<SnippetTab<FrontendTabId>> = [
    { id: 'iframe', label: 'iframe' },
    { id: 'angular', label: 'Angular' },
    { id: 'react', label: 'React' },
    { id: 'vanilla', label: 'Vanilla JS' },
  ];

  protected readonly backendTabs: ReadonlyArray<SnippetTab<BackendTabId>> = [
    { id: 'curl', label: 'curl' },
    { id: 'nodejs', label: 'Node.js / Express' },
    { id: 'python', label: 'Python / FastAPI' },
    { id: 'laravel', label: 'Laravel' },
  ];

  private readonly key: Signal<string> = computed((): string => this.apiKey() || 'YOUR_API_KEY');
  private readonly url: Signal<string> = computed((): string => this.chatUrl());
  private readonly api: Signal<string> = computed((): string => this.baseApiUrl());

  protected readonly iframeSnippet = computed(() =>
`<iframe
  src="${this.url()}?api_key=${this.key()}"
  width="400"
  height="600"
  frameborder="0"
  allow="clipboard-write"
></iframe>`);

  protected readonly angularSnippet = computed(() =>
`import { Component, signal, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [FormsModule],
  template: \`
    <div class="chat-container">
      @for (msg of messages(); track $index) {
        <div [class]="msg.role">{{ msg.content }}</div>
      }
      <form (ngSubmit)="send()">
        <input [(ngModel)]="question" name="q" placeholder="Ask a question..." />
        <button type="submit">Send</button>
      </form>
    </div>
  \`
})
export class ChatbotComponent {
  private readonly http = inject(HttpClient);
  private readonly apiKey = '${this.key()}';
  private readonly apiUrl = '${this.api()}/widget/chat';

  messages = signal<{ role: string; content: string }[]>([]);
  question = '';

  async send(): Promise<void> {
    if (!this.question.trim()) return;
    const q = this.question;
    this.question = '';
    this.messages.update(m => [...m, { role: 'user', content: q }]);

    const params = new HttpParams().set('api_key', this.apiKey);
    const res = await firstValueFrom(
      this.http.post<{ answer: string }>(this.apiUrl, { content: q }, { params })
    );
    this.messages.update(m => [...m, { role: 'assistant', content: res.answer }]);
  }
}`);

  protected readonly reactSnippet = computed(() =>
`import { useState } from 'react';

const API_KEY = '${this.key()}';
const API_URL = '${this.api()}/widget/chat';

export default function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState('');

  const send = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;
    const q = question;
    setQuestion('');
    setMessages(prev => [...prev, { role: 'user', content: q }]);

    const res = await fetch(\`\${API_URL}?api_key=\${API_KEY}\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: q }),
    });
    const data = await res.json();
    setMessages(prev => [...prev, { role: 'assistant', content: data.answer }]);
  };

  return (
    <div>
      {messages.map((msg, i) => (
        <div key={i} className={msg.role}>{msg.content}</div>
      ))}
      <form onSubmit={send}>
        <input value={question} onChange={e => setQuestion(e.target.value)} />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}`);

  protected readonly vanillaSnippet = computed(() =>
`<div id="chatbot">
  <div id="messages"></div>
  <form id="chat-form">
    <input id="chat-input" placeholder="Ask a question..." />
    <button type="submit">Send</button>
  </form>
</div>

<script>
  const API_KEY = '${this.key()}';
  const API_URL = '${this.api()}/widget/chat';

  document.getElementById('chat-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = document.getElementById('chat-input');
    const q = input.value.trim();
    if (!q) return;
    input.value = '';

    appendMessage('user', q);

    const res = await fetch(\`\${API_URL}?api_key=\${API_KEY}\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: q }),
    });
    const data = await res.json();
    appendMessage('assistant', data.answer);
  });

  function appendMessage(role, content) {
    const div = document.createElement('div');
    div.className = role;
    div.textContent = content;
    document.getElementById('messages').appendChild(div);
  }
</script>`);

  protected readonly curlSnippet = computed(() =>
`curl -X POST '${this.api()}/widget/chat?api_key=${this.key()}' \\
  -H 'Content-Type: application/json' \\
  -d '{"content": "Hello, what can you help me with?"}'`);

  protected readonly nodejsSnippet = computed(() =>
`// server.js — Express proxy (keeps API key server-side)
const express = require('express');
const app = express();
app.use(express.json());

const API_KEY = process.env.BOT_API_KEY || '${this.key()}';
const API_URL = '${this.api()}/widget/chat';

app.post('/api/chat', async (req, res) => {
  const response = await fetch(
    \`\${API_URL}?api_key=\${API_KEY}\`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: req.body.content }),
    }
  );
  const data = await response.json();
  res.json(data);
});

app.listen(3000, () => console.log('Proxy running on :3000'));`);

  protected readonly pythonSnippet = computed(() =>
`# main.py — FastAPI proxy (keeps API key server-side)
import os
import httpx
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

API_KEY = os.getenv("BOT_API_KEY", "${this.key()}")
API_URL = "${this.api()}/widget/chat"

class ChatRequest(BaseModel):
    content: str

@app.post("/api/chat")
async def chat(req: ChatRequest):
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{API_URL}?api_key={API_KEY}",
            json={"content": req.content},
        )
        return resp.json()`);

  protected readonly laravelSnippet = computed(() =>
`// routes/api.php
use Illuminate\\Http\\Request;
use Illuminate\\Support\\Facades\\Http;
use Illuminate\\Support\\Facades\\Route;

Route::post('/chat', function (Request $request) {
    $apiKey = config('services.bot.api_key'); // Set in .env: BOT_API_KEY=${this.key()}
    $apiUrl = '${this.api()}/widget/chat';

    $response = Http::post("{$apiUrl}?api_key={$apiKey}", [
        'content' => $request->input('content'),
    ]);

    return $response->json();
});

// config/services.php — add:
// 'bot' => ['api_key' => env('BOT_API_KEY')],`);

  copySnippet(content: string, id: string): void {
    navigator.clipboard.writeText(content);
    this.copiedSnippet.set(id);
    setTimeout((): void => this.copiedSnippet.set(null), 2000);
  }
}
