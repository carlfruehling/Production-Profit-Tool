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
```

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
