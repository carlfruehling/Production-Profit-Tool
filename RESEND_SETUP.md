# Resend Setup Guide

Diese Anleitung ist auf Ihre Domain `fruehling-corporate.de` zugeschnitten.

## 1. Resend Account und API Key

1. Öffnen Sie https://resend.com und melden Sie sich an.
2. Gehen Sie zu `API Keys`.
3. Erstellen Sie einen neuen Key, z. B. `production-profit-tool`.
4. Kopieren Sie den Key sofort.

## 2. Domain für Versand konfigurieren

Empfohlen: Nutzen Sie eine Subdomain als Absenderdomain, nicht die Root-Domain.

- Empfohlene Versanddomain: `mail.fruehling-corporate.de`
- Empfohlener Absender: `noreply@mail.fruehling-corporate.de`

Schritte in Resend:
1. `Domains` -> `Add Domain`
2. Domain eintragen: `mail.fruehling-corporate.de`
3. Die von Resend angezeigten DNS-Records (SPF, DKIM, ggf. DMARC) bei Ihrem Domain-Anbieter eintragen
4. In Resend auf `Verify` klicken

Hinweis: Die exakten Record-Namen und Werte kommen direkt von Resend und sind pro Domain eindeutig.

## 3. Environment-Variablen setzen

### Lokal (`.env.local`)

```env
RESEND_API_KEY=<Ihr Resend API Key>
RESEND_FROM_EMAIL=noreply@mail.fruehling-corporate.de
NEXT_PUBLIC_APP_URL=https://production-profit-tool.vercel.app
```

### In Vercel (Production)

Setzen Sie in `Project -> Settings -> Environment Variables` dieselben Werte:

- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL=noreply@mail.fruehling-corporate.de`
- `NEXT_PUBLIC_APP_URL=https://production-profit-tool.vercel.app`

Danach ein Redeploy auslösen.

## 4. Schnelltest nach Verifikation

1. Neue Registrierung mit einer echten E-Mail durchführen.
2. Prüfen, ob die Bestätigungs-Mail ankommt.
3. "Passwort vergessen" testen und Reset-Mail prüfen.
4. Falls Mails fehlen: In Resend unter `Logs` die Zustellversuche ansehen.

## 5. Häufige Fehler

- `onboarding.resend.dev` als Absender in Produktion: Sendet nur eingeschränkt.
- `RESEND_FROM_EMAIL` passt nicht zur verifizierten Domain: Versand schlägt fehl.
- DNS noch nicht propagiert: Verifikation dauert manchmal 5 bis 30 Minuten.

## 6. Sicherheit

- API Key nur serverseitig nutzen.
- API Key niemals ins Frontend oder in Git committen.

## Dokumentation

https://resend.com/docs
