import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet],
  template: `
    <div class="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-12">
      <div class="w-full max-w-md">
        <div class="flex items-center justify-center gap-3 mb-8">
          <div class="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714a2.25 2.25 0 0 0 .659 1.591L19 14.5" />
            </svg>
          </div>
          <span class="text-xl font-bold text-slate-900">Bot Platform</span>
        </div>
        <router-outlet />
      </div>
    </div>
  `,
})
export class AuthLayoutComponent {}
