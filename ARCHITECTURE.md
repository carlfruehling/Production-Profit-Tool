# 🏗️ Architektur-Übersicht

## System-Architektur

```
┌─────────────────────────────────────────────────────┐
│           Browser (Client)                          │
│  React Components + TailwindCSS                     │
│  (Responsive UI, Form Validation)                   │
└──────────────────┬──────────────────────────────────┘
                   │ HTTP/API
┌──────────────────▼──────────────────────────────────┐
│        Next.js Server (Edge)                        │
│  - API Routes (/api/calculate, /api/register, etc) │
│  - Server-Side Rendering                           │
│  - TypeScript Type Safety                          │
└──────────────────┬──────────────────────────────────┘
                   │
        ┌──────────┼──────────┐
        │          │          │
        ▼          ▼          ▼
┌────────────┐ ┌────────┐ ┌────────────┐
│  Supabase  │ │ Resend │ │  Vercel    │
│ PostgreSQL │ │ E-Mail │ │  CDN/Edge  │
└────────────┘ └────────┘ └────────────┘
```

## Komponenten-Struktur

```
src/
├── app/                          # Next.js App Router Pages
│   ├── page.tsx                 # Landing Page (Hero + Calculator)
│   ├── register/page.tsx        # Registration Page
│   ├── verify-success/page.tsx  # Verification Success
│   ├── impressum/page.tsx       # Legal Notice
│   ├── datenschutz/page.tsx     # Data Protection
│   ├── layout.tsx               # Root Layout
│   ├── globals.css              # Global Styles
│   │
│   └── api/                     # API Routes
│       ├── calculate/route.ts   # POST: Calculates production economics
│       ├── register/route.ts    # POST: User registration + email
│       └── verify/route.ts      # GET: Email verification link
│
├── components/                   # React Components
│   ├── CalculatorForm.tsx       # Form component for machine data input
│   ├── RegistrationForm.tsx     # User registration form
│   └── ResultPreview.tsx        # Shows partial results (teaser)
│
├── lib/                         # Utilities & Services
│   ├── calculation.ts          # Business logic for economics calculation
│   └── supabase.ts             # Supabase client initialization
│
└── types/                       # TypeScript Definitions
    └── calculation.ts          # Shared type definitions
```

## Daten-Fluss

### Berechnung (Calculator Workflow)

```
1. User gibt Daten ein:
   - Freie Maschinenstunden pro Woche
   - Maschinenstundensatz
   - Angebotspreis
   - Materialkosten
   - Rüstzeit (optional)

2. Frontend: CalculatorForm.tsx
   - Validiert mit react-hook-form
   - Sendet POST zu /api/calculate

3. Backend: api/calculate/route.ts
   - Validiert mit Zod
   - Ruft calculateProductionEconomics() auf
   - Ergänzt lernenden Benchmark für vergleichbare Aufträge
   - Gibt JSON zurück

4. Berechnungen (lib/calculation.ts):
   - Deckungsbeitrag = Angebotspreis - Materialkosten
   - Opportunitätskosten = Satz × Freie Stunden × 52 Wochen
   - Mindestpreis = Materialkosten + (Satz × 0.6)

5. Diagnose:
   - Automatische Analyse der Zahlen
   - Warnings bei problematischen Szenarien

6. Frontend: Ergebnisse anzeigen
   - ResultPreview.tsx zeigt Preview
   - CalculatorForm.tsx zeigt Einzel- und Durchschnittsbenchmark
   - CTA zum Registrieren
```

### Lernender Benchmark

Zusätzlich zur eigentlichen Kostenrechnung nutzt das Tool eine globale Benchmark-Schicht:

1. Jeder Auftrag wird nach Maschinenzeit, Angebotspreis und Maschinenstundensatz in ein Vergleichsprofil eingeordnet.
2. Für jedes Profil existiert ein realistischer Seed-Wert als Startbasis.
3. Echte Berechnungen erhöhen das Gewicht der realen Daten in diesem Profil.
4. Das Ergebnis ist ein adaptiver Branchenvergleich für den aktuellen Auftrag und den Durchschnitt der Nutzerhistorie.

### Registrierungs-Workflow

```
1. User klickt auf "Vollständige Analyse freischalten"

2. Weiterleitung zu /register/page.tsx
   - Zeigt RegistrationForm.tsx

3. User füllt Formular aus:
   - Name, Firma, Position
   - E-Mail, Telefon
   - Datenschutzzustimmung

4. Frontend sendet POST zu /api/register

5. Backend: api/register/route.ts
   - Validiert mit Zod
   - Prüft E-Mail-Duplikate in Supabase
   - Speichert User in DB
   - Sendet Verifikations-E-Mail via Resend

6. Resend:
   - E-Mail mit Verifikations-Link
   - Link: /verify?token={user_id}

7. User klickt auf Link

8. Backend: api/verify/route.ts
   - Aktualisiert email_verified = true
   - Weiterleitung zu /verify-success

9. Bestätigungs-Nachricht
   - User kann jetzt vollständige Ergebnisse sehen
```

## Sicherheit

### Frontend Security
✅ CSRF Token via Next.js (automatisch)
✅ HTML Escaping (React automatisch)
✅ Input Validation (Zod + react-hook-form)
✅ HTTPS only (Vercel)

### Backend Security
✅ Service Role Key nur serverseitig
✅ Environment-Variablen verschlüsselt
✅ SQL Injection Prevention (Supabase)
✅ E-Mail Validation
✅ Rate Limiting (via Vercel)

### Datenschutz
✅ Docker Service mit Verschlüsselung
✅ GDPR Compliant (Optional)
✅ Datenminimierung
✅ Double Opt-In
✅ Datenschutzerklärung

## Datenbank-Schema

```sql
Table: users
├── id (UUID, PK)
├── name (TEXT, NOT NULL)
├── company (TEXT, NOT NULL)
├── position (TEXT, NULLABLE)
├── email (TEXT, UNIQUE, NOT NULL)
├── phone (TEXT, NULLABLE)
├── created_at (TIMESTAMP)
├── email_verified (BOOLEAN, DEFAULT: false)
└── consent_contact (BOOLEAN, DEFAULT: false)

Indexes:
├── PRIMARY KEY: id
└── UNIQUE INDEX: email
```

## Environment-Variablen

### Public (Client-seitig sichtbar)
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_APP_URL
```

### Secret (Server-seitig nur)
```
SUPABASE_SERVICE_ROLE_KEY
RESEND_API_KEY
```

## Externe Services

### Supabase
- PostgreSQL Datenbank
- User Management
- Authentication
- Kostenlos: bis 500MB DB

### Resend
- Transactional E-Mail Versand
- Double-Opt-In Bestätigungen
- Kostenlos: 3000 E-Mails/Monat

### Vercel
- Deployment & Hosting
- Edge Functions
- SSL/TLS automatisch
- Kostenlos: Unlimited Deploys

## Performance

### Frontend
- Next.js: ~2.5s First Paint
- TailwindCSS: ~15KB gzipped
- React: Automatic optimization

### Backend
- API Response Time: <100ms
- Database Query: <50ms
- E-Mail: ~2s (async)

### Caching
- Static Pages: CDN (Vercel Edge)
- API Routes: Cloud Functions (on-demand)
- Images: Optimized via next/image

## Deployment-Pipeline

```
GitHub Repo
    ↓
    └─→ Vercel (git push main)
         ├─ Install dependencies
         ├─ Build dengan Next.js
         ├─ Run TypeScript
         ├─ Deploy to Edge
         └─ ✅ Live (auto-SSL)
```

## State Management

- **Frontend State**: React Hooks (useState)
- **Form State**: react-hook-form (performant)
- **Server State**: Supabase (source of truth)
- **Auth State**: Email verification token

## Error Handling

### Frontend
- Toast notifications (optional)
- Error boundaries
- Form validation errors

### Backend
- Zod validation errors
- Database errors
- Email sending errors
- Type-safe error responses

## Monitoring & Logging

### Available
- Vercel Analytics (optional)
- Next.js Analytics
- Error Tracking (Sentry optional)

### Future
- PostHog/Plausible Analytics
- Custom event tracking
- User journey tracking
