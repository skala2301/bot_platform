# Trapezzio Bot Platform — Frontend (v2)

Angular 21 + Tailwind v4 single-page application for the **Trapezzio Bot Platform**. It's the authenticated dashboard where organization owners and members create AI chatbots, manage knowledge bases (files, URLs, FAQs), generate widget API keys, and embed the resulting chatbots in any website.

This repository contains **only the frontend**. It talks to a separate FastAPI backend exposed at `http://localhost:8000/api/v1` by default.

---

## Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Prerequisites](#prerequisites)
5. [Installation](#installation)
6. [Running the App](#running-the-app)
7. [Environment / Backend URL](#environment--backend-url)
8. [Authentication & Session Flow](#authentication--session-flow)
9. [Widget / Public Chat URL](#widget--public-chat-url)
10. [Design System](#design-system)
11. [Available Scripts](#available-scripts)
12. [Troubleshooting](#troubleshooting)

---

## Features

- **JWT authentication** — register, email verification, login, logout, refresh-token rotation, forgot/reset password
- **Multi-tenant orgs** — each user can belong to multiple organizations; switch via the sidebar dropdown
- **Bot management** — create bots, configure settings (language, system prompt, tone, fallback message), pick a local-Ollama or cloud-Ollama chat model
- **Knowledge ingestion** — upload PDF/TXT/DOCX files, scrape URLs, paste FAQ pairs, or import FAQs from a JSON file
- **API keys** — generate per-bot `trpz_*` keys for embedding the chat widget on external websites
- **Embed code snippets** — ready-to-paste iframe / Angular / React / vanilla JS frontend snippets and curl / Node.js / Python / Laravel backend proxy snippets
- **Public widget chat** — standalone page at `/chat/:botUid?api_key=...` for external users (or iframe embeds)
- **Organization administration** — members, invites, custom roles with permission checklist, organization lifecycle (active → suspended → closed → delete)
- **Model browser** — browse available chat models by type (local vs cloud), inspect model metadata
- **Design system** — navy `brand-primary` + lime `brand-accent` + semantic `success / warning / danger / info` tokens defined once in `src/styles.css` via Tailwind v4 `@theme`

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Angular 21 (standalone components, signals, `inject()`, new control flow syntax) |
| Language | TypeScript 5.9 (strict mode) |
| Styling | Tailwind CSS v4 (CSS-based config via `@theme`) |
| HTTP | `HttpClient` with functional interceptor (Bearer-token auth + transparent refresh) |
| Routing | Angular Router with `CanActivateFn` guards (`authGuard`, `publicGuard`) |
| State | Angular Signals (`signal`, `computed`, `effect`) — no NgRx |
| Testing | Vitest |
| Package manager | npm 11 |

---

## Project Structure

```
src/
└── app/
    ├── app.config.ts              # providers, HTTP interceptor, APP_INITIALIZER
    ├── app.routes.ts              # top-level routes (public + auth-guarded + widget)
    │
    ├── auth/                       # authenticated domain
    │   ├── auth-shell.component.ts # loads user orgs, redirects to /organization/create if none
    │   ├── auth.routes.ts          # /bots/*, /organization/*, /profile, /accept-invite
    │   │
    │   ├── components/
    │   │   ├── bots/              # bot-card, bot-settings-tab, document-tab, url-tab,
    │   │   │                       # faq-tab, deploy-tab, api-key-list, code-snippet-tabs,
    │   │   │                       # bot-model-selector, ingestion-job
    │   │   └── org/               # org-details-tab, members-tab, invites-tab, roles-tab,
    │   │                           # models-available-tab, permission-checklist, org-switcher
    │   │
    │   ├── pages/
    │   │   ├── bots/              # bot-list, bot-create, bot-edit, bot-chat
    │   │   ├── organization/      # organization, create-org
    │   │   ├── invites/           # accept-invite
    │   │   └── profile/
    │   │
    │   ├── services/
    │   │   ├── auth/              # auth.service (session store), auth-api.service,
    │   │   │                       # auth.interceptor, auth.guard
    │   │   ├── bots/              # bot-api.service, widget-api.service, model-api.service
    │   │   └── org/               # org-api.service, member-api.service,
    │   │                           # invite-api.service, role-api.service
    │   │
    │   └── interfaces/
    │       ├── auth/              # user.interface, token.interface
    │       ├── bots/              # bot.interface, api-key.interface, model.interface,
    │       │                       # widget.interface, ingestion.interface, chat.interface
    │       └── org/               # org.interface, member.interface, invite.interface,
    │                               # role.interface, permission.interface
    │
    ├── public/                     # unauthenticated domain (reached without a JWT)
    │   ├── public.routes.ts
    │   └── pages/
    │       ├── auth/              # login, register, verify-email, forgot-password,
    │       │                       # reset-password, auth-layout
    │       └── public-chat-page   # widget chat at /chat/:botUid?api_key=...
    │
    └── shared/
        ├── components/            # confirm-dialog, sidebar-layout
        ├── interfaces/            # tab.interface, nav.interface, message-response.interface
        └── utils/                 # http-error (httpErrorStatus, httpErrorDetail)

styles.css                          # Tailwind v4 @theme with all brand + semantic tokens
```

---

## Prerequisites

- **Node.js ≥ 20**
- **npm 11** (pinned in `package.json` via `packageManager` — npm will auto-install this via Corepack if you have it enabled)
- **Running Trapezzio backend** at `http://localhost:8000` (see the backend repo). The frontend expects endpoints under `/api/v1/*`.

Check your versions:

```bash
node --version   # v20 or higher
npm --version    # 11.x
```

---

## Installation

Clone the repo and install dependencies:

```bash
git clone <this-repo-url> bot_platform_v2
cd bot_platform_v2
npm install
```

That's it — no extra CLI to install globally. `ng` is available via `npx ng`.

---

## Running the App

### Development mode (hot reload)

```bash
npx ng serve
```

Then open **http://localhost:4200**. The app will rebuild on file changes.

### Production build

```bash
npx ng build
```

Build artifacts land in `dist/bot_platform_v2/`. Serve them with any static file server, or deploy the folder behind a reverse proxy.

### Running both frontend and backend locally

Typical dev workflow:

```bash
# Terminal 1 — backend (see backend repo)
uvicorn app.main:app --reload --port 8000

# Terminal 2 — frontend
cd bot_platform_v2
npx ng serve
```

Then visit `http://localhost:4200` and register / log in.

---

## Environment / Backend URL

The backend base URL is currently hardcoded to `http://localhost:8000/api/v1` inside each API service:

- `src/app/auth/services/auth/auth-api.service.ts`
- `src/app/auth/services/bots/bot-api.service.ts`
- `src/app/auth/services/bots/widget-api.service.ts`
- `src/app/auth/services/bots/model-api.service.ts`
- `src/app/auth/services/org/org-api.service.ts`
- `src/app/auth/services/org/member-api.service.ts`
- `src/app/auth/services/org/invite-api.service.ts`
- `src/app/auth/services/org/role-api.service.ts`

To point at a different backend (e.g. staging), update the `private readonly baseUrl: string = '…'` line in each service. A future improvement is to move this to `src/environments/environment.ts` with Angular's build-time file replacement.

---

## Authentication & Session Flow

1. User registers at `/register` → backend creates user with `status: "pending_verification"` and logs a verification token to the console.
2. User pastes the token at `/verify-email` → account becomes `active`.
3. User logs in at `/login`. **Note:** the backend expects form-encoded credentials (`username=email&password=pass` with `Content-Type: application/x-www-form-urlencoded`) — handled automatically by `AuthApiService.login()`.
4. On successful login, the frontend calls `GET /auth/me` with the access token to load the `UserOut` profile and stores tokens + user + current org in `localStorage` under keys `bp_tokens`, `bp_user`, `bp_current_org`.
5. The `authInterceptor` automatically:
   - Attaches `Authorization: Bearer <access_token>` to every authenticated request
   - On `401`, transparently refreshes via `/auth/refresh` and retries the original request once
   - On refresh failure, clears the session and redirects to `/login`
6. The `authGuard` redirects any unauthenticated navigation attempt to `/login?redirect=<target>`; `publicGuard` redirects logged-in users away from public auth pages.

### Accessing the first-run flow

A freshly-registered user will have **zero organizations** on first login. The `AuthShellComponent` detects this and redirects to `/organization/create`, forcing the user to create an org before they can create bots.

---

## Widget / Public Chat URL

The Deploy tab of every bot generates a chat URL of the form:

```
http://localhost:4200/chat/<bot_uid>?api_key=<trpz_…>
```

This URL is routed to the `PublicChatPageComponent`, which:
1. Reads the `api_key` query parameter
2. Calls `GET /api/v1/widget/config?api_key=…` to load the bot's name, tone, and fallback message
3. Sends each user message via `POST /api/v1/widget/chat?api_key=…`

The Deploy tab also provides copy-paste snippets for iframe embed, Angular component, React component, vanilla JS, curl, Node.js/Express proxy, Python/FastAPI proxy, and Laravel proxy.

---

## Design System

All colors live in `src/styles.css` via the Tailwind v4 `@theme` directive. **Do not hardcode hex values in components or templates.** The available tokens:

| Category | Tokens |
|---|---|
| Brand | `brand-primary` (#00263E), `brand-secondary` (#004976), `brand-accent` (#A2D40A), `brand-neutral` (#E5E7EB) |
| Semantic | `success`, `warning`, `danger`, `info` — each with `-tint` and `-dark` variants |
| Neutrals | Tailwind `slate-*` scale (matches the design-system neutrals exactly) |
| Surfaces | CSS variables `--surface-base`, `--surface-raised`, `--surface-sunken`, `--border-subtle`, `--border-default`, `--text-muted`, `--text-secondary`, `--text-primary` |

Usage cheat-sheet:

```html
<!-- Primary CTA -->
<button class="bg-brand-primary text-white hover:bg-brand-secondary">…</button>

<!-- Secondary CTA -->
<button class="bg-slate-100 text-slate-700 hover:bg-slate-200">…</button>

<!-- Destructive button -->
<button class="bg-danger text-white hover:bg-danger-dark">Delete</button>

<!-- Success toast -->
<div class="bg-success-tint text-success-dark border border-success">Saved</div>
```

The full design-system rulebook (contrast pairings, 60/30/10 proportion, dos and don'ts) is documented in `CLAUDE.md`.

---

## Available Scripts

| Command | What it does |
|---|---|
| `npx ng serve` | Start the dev server at `http://localhost:4200` with hot reload |
| `npx ng build` | Production build into `dist/bot_platform_v2/` |
| `npx ng build --watch --configuration development` | Rebuild on change, no dev server |
| `npx ng test` | Run unit tests with Vitest |
| `npx ng generate component <name>` | Scaffold a new component following the project's patterns |
| `npx ng generate --help` | List all available schematics |

---

## Troubleshooting

**Login says "Invalid email or password" even though curl works:**  
Your browser has stale tokens in `localStorage`. Open DevTools → Application → Local Storage → delete the `bp_*` keys, then reload and sign in again.

**`http://localhost:8000/api/v1/bots/.../api-keys` returns `405 Method Not Allowed`:**  
The backend does not implement a `GET` endpoint for listing API keys. The frontend handles this gracefully and shows only keys created in the current session. Keys will still generate and work — the list section is just partial.

**The sidebar shows "No organization selected" but the org dropdown shows one:**  
Fixed in the latest commit. The bot list now waits for the `AuthService.orgsLoaded` signal before deciding what to render. If it reappears, hard-refresh the page.

**Cloud models dropdown is empty:**  
The backend needs an `OLLAMA_API_KEY` environment variable set to query Ollama Cloud. Local models work without any extra configuration.

**TypeScript warning `TS6059: rootDir must be explicitly set`:**  
Already fixed. Both `tsconfig.app.json` and `tsconfig.spec.json` now declare `"rootDir": "./src"`.

**npm audit reports vulnerabilities in `picomatch`, `undici`, `vite`:**  
These are transitive dev-only dependencies pinned by Angular CLI tooling. They don't affect the production bundle. They'll resolve automatically once `@angular/build` ships a patched version. If the warnings must be suppressed, add an `overrides` block to `package.json` pinning `picomatch ^4.0.4`, `undici ^7.24.0`, `vite ^7.3.2`.
