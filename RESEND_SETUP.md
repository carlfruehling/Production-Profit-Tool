# Resend Setup Guide

## 1. Account erstellen

1. Gehen Sie zu https://resend.com
2. Klicken Sie auf "Sign Up"
3. Verwenden Sie Ihre E-Mail-Adresse
4. Bestätigen Sie Ihre E-Mail

## 2. API Key erstellen

1. Im Dashboard auf "API Keys" gehen
2. Klicken Sie auf "Create API Key"
3. Geben Sie einen Namen ein (z.B. "Production Profit Tool")
4. Kopieren Sie den API Key

## 3. Domain verifizieren (optional für Tests)

Für Tests können Sie die Standard Resend-Domain verwenden:
- `noreply@onboarding.resend.dev`

Für Produktion:
1. Gehen Sie zu "Domains"
2. Klicken Sie auf "Add Domain"
3. Geben Sie Ihre Domain ein (z.B. production-profit-tool.com)
4. Folgen Sie den DNS-Einweisungen
5. Verifizieren Sie die Domain

## 4. Environment-Variablen

Fügen Sie zu `.env.local` hinzu:

```env
RESEND_API_KEY=<API Key from Step 2>
```

## 5. E-Mail Templates

Die Standard-E-Mail wird mit HTML aktualisiert, um professionell auszusehen.

Benutzerdefinierte Templates können später im Dashboard erstellt werden.

## Test E-Mail senden

Sie können Test-E-Mails von der Resend API aus senden. Die API akzeptiert beliebige Test-E-Mails:
- `test@example.com`
- `hello@world.com`
- Etc.

## Wichtige Hinweise

- Service Role Key (Resend API Key) gehört auf den Server
- Nie den API Key im Frontend verwenden
- Nie den API Key in Git committen
- Resend hat großzügige kostenlose Limits (3000 E-Mails/Monat)

## Dokumentation

Weitere Informationen: https://resend.com/docs
