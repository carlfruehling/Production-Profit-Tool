# Supabase Setup Guide

## 1. Projekt erstellen

1. Gehen Sie zu https://supabase.com
2. Melden Sie sich an oder registrieren Sie sich
3. Klicken Sie auf "New Project"
4. Wählen Sie eine Organisation oder erstellen Sie eine neue
5. Geben Sie einen Projektnamen ein (z.B. "production-profit-tool")
6. Wählen Sie eine Region
7. Erstellen Sie ein sicheres Passwort für die Datenbank

## 2. Users-Tabelle erstellen

Führen Sie dieses SQL im Supabase Editor aus:

```sql
-- Tabelle anlegen (wird übersprungen wenn sie bereits existiert)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  company TEXT NOT NULL,
  position TEXT,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  password_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  email_verified BOOLEAN DEFAULT FALSE,
  consent_contact BOOLEAN DEFAULT FALSE,
  reset_token_hash TEXT,
  reset_token_expires_at TIMESTAMP WITH TIME ZONE
);

-- Fehlende Spalten ergänzen (sicher ausführbar, auch wenn Tabelle schon existiert)
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS password_hash TEXT,
  ADD COLUMN IF NOT EXISTS reset_token_hash TEXT,
  ADD COLUMN IF NOT EXISTS reset_token_expires_at TIMESTAMP WITH TIME ZONE;

-- Indizes anlegen (werden übersprungen wenn sie bereits existieren)
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_reset_token_hash ON public.users(reset_token_hash);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policies anlegen (bestehende zuerst entfernen, damit kein Konflikt entsteht)
DROP POLICY IF EXISTS "Anyone can register" ON public.users;
CREATE POLICY "Anyone can register"
ON public.users FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Users can read own data" ON public.users;
CREATE POLICY "Users can read own data"
ON public.users FOR SELECT
USING (auth.uid()::text = id::text);

-- Service-Role benötigt UPDATE-Rechte (z.B. für E-Mail-Verifikation, Passwort-Reset)
DROP POLICY IF EXISTS "Service role can update users" ON public.users;
CREATE POLICY "Service role can update users"
ON public.users FOR UPDATE
USING (true)
WITH CHECK (true);

-- Berechnungshistorie je User
CREATE TABLE IF NOT EXISTS public.calculation_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  calculation_input JSONB NOT NULL,
  calculation_result JSONB NOT NULL,
  pricing_signal TEXT NOT NULL CHECK (pricing_signal IN ('green', 'yellow', 'red')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_calculation_history_user_created
ON public.calculation_history(user_id, created_at DESC);

ALTER TABLE public.calculation_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role can manage history" ON public.calculation_history;
CREATE POLICY "Service role can manage history"
ON public.calculation_history
USING (true)
WITH CHECK (true);

-- Globaler lernender Benchmark je Vergleichsprofil
CREATE TABLE IF NOT EXISTS public.industry_benchmark_profiles (
  bucket_key TEXT PRIMARY KEY,
  time_band TEXT NOT NULL,
  price_band TEXT NOT NULL,
  hourly_rate_band TEXT NOT NULL,
  seed_sample_size INTEGER NOT NULL DEFAULT 0,
  seed_avg_contribution_per_hour DOUBLE PRECISION NOT NULL DEFAULT 0,
  real_sample_size INTEGER NOT NULL DEFAULT 0,
  real_avg_contribution_per_hour DOUBLE PRECISION NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_industry_benchmark_profiles_bands
ON public.industry_benchmark_profiles(time_band, price_band, hourly_rate_band);

ALTER TABLE public.industry_benchmark_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role can manage benchmark profiles" ON public.industry_benchmark_profiles;
CREATE POLICY "Service role can manage benchmark profiles"
ON public.industry_benchmark_profiles
USING (true)
WITH CHECK (true);

-- Pseudonymisierte Analytics-Ereignisse für Besucher-, Tool- und Registrierungszahlen
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL CHECK (event_type IN ('page_view', 'tool_calculation_completed', 'account_registered')),
  visitor_hash TEXT,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  path TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_type_created
ON public.analytics_events(event_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_events_visitor_created
ON public.analytics_events(visitor_hash, created_at DESC);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role can manage analytics events" ON public.analytics_events;
CREATE POLICY "Service role can manage analytics events"
ON public.analytics_events
USING (true)
WITH CHECK (true);

-- Optional: vorher prüfen
SELECT id, email
FROM public.users
WHERE email = 'cfruehling@live.de';

-- User löschen
DELETE FROM public.users
WHERE email = 'cfruehling@live.de';
```

### Benchmark-Seed-Daten

Die App befüllt die Tabelle `industry_benchmark_profiles` beim ersten Zugriff automatisch mit
realistischen Startprofilen für alle Kombinationen aus Zeit-Band, Angebotspreis-Band und
Maschinenstundensatz-Band. Sie müssen daher keine Fake-Datensätze manuell anlegen.

Die Logik arbeitet als gewichteter Mischwert:

- `seed_*` enthält die Startbasis für das jeweilige Vergleichsprofil.
- `real_*` sammelt echte Berechnungen aus der Anwendung.
- Mit jeder echten Berechnung verliert die Startbasis relativ an Gewicht.

So startet der Benchmark plausibel und wird mit echter Nutzung präziser.

## 3. API Keys abrufen

1. Im Supabase Dashboard auf das Projekt gehen
2. Klicken Sie auf "Settings" in der linken Sidebar
3. Klicken Sie auf "API"
4. Sie sehen:
   - **Project URL**: Dies ist `NEXT_PUBLIC_SUPABASE_URL`
   - **Service Role Key**: Dies ist `SUPABASE_SERVICE_ROLE_KEY` (secret!)

**Wichtig**: Der Service Role Key sollte nur serverseitig verwendet werden!

## 4. Environment-Variablen kopieren

Kopieren Sie in die `.env.local` Datei:

```env
NEXT_PUBLIC_SUPABASE_URL=<Project URL from Step 3>
SUPABASE_SERVICE_ROLE_KEY=<Service Role Key from Step 3>
BENCHMARK_ADMIN_TOKEN=<Langes Secret nur für Benchmark-Reset und Statistik>
ANALYTICS_ADMIN_TOKEN=<Optional eigenes Secret nur fuer Analytics; sonst faellt die App auf BENCHMARK_ADMIN_TOKEN zurueck>
ANALYTICS_HASH_SALT=<Optionales Salt fuer anonyme Besucher-Hashes>
```

### Benchmark-Admin / Reset

Für Testphasen gibt es eine geschützte Admin-API unter `/api/benchmark-admin`.

- `GET /api/benchmark-admin` liefert Kennzahlen zur aktuellen Benchmark-Basis.
- `POST /api/benchmark-admin` mit `{"action":"reset-real-data"}` entfernt nur echte Nutzungsdaten und behält alle Seeds.
- `POST /api/benchmark-admin` mit `{"action":"reseed-all"}` setzt alles vollständig auf Seed-Daten zurück.

Authentifizierung:

- Header `x-admin-token: <BENCHMARK_ADMIN_TOKEN>` oder `Authorization: Bearer <BENCHMARK_ADMIN_TOKEN>`

Beispiel:

```bash
curl -X GET http://localhost:3000/api/benchmark-admin \
  -H "x-admin-token: <BENCHMARK_ADMIN_TOKEN>"

curl -X POST http://localhost:3000/api/benchmark-admin \
  -H "Content-Type: application/json" \
  -H "x-admin-token: <BENCHMARK_ADMIN_TOKEN>" \
  -d '{"action":"reset-real-data"}'
```

### Analytics-Auswertung

Zusätzlich gibt es eine geschützte Analytics-API unter `/api/analytics-admin` und eine Admin-Seite unter `/analytics`.

- `GET /api/analytics-admin?days=30` liefert eindeutige Besucher, Tool-Nutzer, Registrierungen und Conversion-Raten.
- Die Seite `/analytics` fragt das Admin-Token im Browser ab und ruft die API damit geschützt auf.
- Das Token kommt aus `ANALYTICS_ADMIN_TOKEN` oder, falls nicht gesetzt, aus `BENCHMARK_ADMIN_TOKEN`.

Beispiel:

```bash
curl -X GET "http://localhost:3000/api/analytics-admin?days=30" \
  -H "x-admin-token: <ANALYTICS_ADMIN_TOKEN oder BENCHMARK_ADMIN_TOKEN>"
```

## 5. Verifikation

Sie können die Tabelle im Supabase Editor sehen unter:
- Table Editor → public → users

## Sicherheit

- Nie den Service Role Key in den Browser senden
- Nur in `.env.local` speichern
- `.env.local` zu `.gitignore` hinzufügen
- Verwenden Sie Public Keys nur für Client-seitige Operationen

## Backup

Supabase speichert automatische Backups. Sie können diese unter Settings → Backups einsehen.
