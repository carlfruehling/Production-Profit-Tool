# Produktions-Deckungsbeitrags-Tool - MVP

Ein kostenloses Analyse-Tool für Fertigungsunternehmen zur Berechnung von Opportunitätskosten ungenutzter Maschinenkapazität.

## Features

- **Schnelle Berechnung**: 60-Sekunden Analyse Ihrer Maschinenauslastung
- **Kostenlos**: Keine versteckten Gebühren
- **Lead-Generator**: Registrierungspflicht für volle Ergebnisse
- **Double-Opt-In**: E-Mail-Bestätigung für Datensicherheit
- **Responsive Design**: Funktioniert auf allen Geräten

## Technologie-Stack

- **Frontend**: Next.js 14+ mit TypeScript & TailwindCSS
- **Backend**: Node.js/Next.js API Routes
- **Datenbank**: Supabase (PostgreSQL)  
- **Auth**: Supabase
- **E-Mail**: Resend
- **Hosting**: Vercel

## Voraussetzungen

- Node.js 18+
- npm oder yarn
- Supabase Account
- Resend Account
- Vercel Account (für Deployment)

## Installation

### 1. Projekt initialisieren

\\\ash
cd production-profit-tool
npm install
\\\

### 2. Supabase einrichten

1. https://supabase.com anmelden
2. Neues Projekt erstellen
3. PostgreSQL Datenbank "users" anlegen

### 3. Environment-Variablen

\\\.env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
BENCHMARK_ADMIN_TOKEN=your_long_random_admin_token
RESEND_API_KEY=re_your_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=https://ihre-produktive-domain.de
\\\

`NEXT_PUBLIC_SITE_URL` wird für Canonical-URLs, `robots.txt` und `sitemap.xml` verwendet und sollte in Produktion immer auf die finale Domain gesetzt werden.

## Benchmark-Administration

Für Testphasen oder Demos gibt es eine kleine geschützte Admin-API:

- `GET /api/benchmark-admin` zeigt den Status der Benchmark-Profile.
- `POST /api/benchmark-admin` mit `{"action":"reset-real-data"}` entfernt nur echte Nutzungsdaten.
- `POST /api/benchmark-admin` mit `{"action":"reseed-all"}` setzt alle Benchmark-Profile auf die Seed-Daten zurück.

Authentifizierung erfolgt über `BENCHMARK_ADMIN_TOKEN` im Header `x-admin-token` oder als Bearer-Token.

### 4. Anwendung starten

\\\ash
npm run dev
\\\

Öffnen Sie http://localhost:3000 in Ihrem Browser.

## Deployment auf Vercel

1. GitHub Repository erstellen
2. Vercel Projekt erstellen
3. Environment-Variablen hinzufügen
4. Deploy

## Support

Für Fragen: [Ihre Kontaktinformationen]
