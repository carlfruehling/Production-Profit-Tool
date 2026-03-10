# Vercel Deployment Guide

## Voraussetzungen

- GitHub Account
- Vercel Account (kostenlos)
- Code auf GitHub gepusht

## 1. GitHub Repository erstellen

```bash
cd production-profit-tool
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/production-profit-tool.git
git push -u origin main
```

## 2. Vercel Project erstellen

1. Gehen Sie zu https://vercel.com
2. Melden Sie sich an oder registrieren Sie sich
3. Klicken Sie auf "New Project"
4. Wählen Sie "Import Git Repository"
5. Wählen Sie GitHub und verbinden Sie
6. Wählen Sie Ihr Repository aus
7. Klicken Sie auf "Import"

## 3. Environment-Variablen hinzufügen

Im Vercel Dashboard:
1. Gehen Sie zu "Settings" des Projekts
2. Klicken Sie auf "Environment Variables"
3. Fügen Sie folgende Variablen hinzu:

```
NEXT_PUBLIC_SUPABASE_URL = <Supabase URL>
SUPABASE_SERVICE_ROLE_KEY = <Supabase Service Role Key>
RESEND_API_KEY = <Resend API Key>
NEXT_PUBLIC_APP_URL = https://your-domain.vercel.app
```

**Wichtig**: Die Variablen mit `NEXT_PUBLIC_` sind öffentlich, andere sind geheim.

## 4. Deploy

1. Nach dem Hinzufügen der Environment-Variablen wird der Deploy automatisch gestartet
2. Sie können den Fortschritt im "Deployments" Tab verfolgen
3. Nach Abschluss erhalten Sie eine URL wie: `https://production-profit-tool.vercel.app`

## 5. Domain verbinden (optional)

1. In Vercel: "Settings" → "Domains"
2. Geben Sie Ihre Domain ein
3. Folgen Sie den DNS-Einweisungen
4. Domain wird nach DNS-Verifizierung verbunden

## 6. Automatische Deployments

Jeder Push zu `main` wird automatisch deployed:
- Push zu GitHub
- Vercel erkennt den Push
- Automatischer Build und Deploy
- Neue URL verfügbar nach ~2-3 Minuten

## Umgebungen

- **Production**: `main` Branch
- **Preview**: Pull Requests und andere Branches
- **Development**: Lokal mit `npm run dev`

## Logs anschauen

Im Vercel Dashboard:
1. Wählen Sie ein Deployment
2. Klicken Sie auf "Logs"
3. Sie sehen Build- und Runtime-Logs

## Tipps

- Verwenden Sie Vercel Analytics (optional) für Performance-Monitoring
- Aktivieren Sie "Automatic Git failsafe" für Sicherheit
- Regelmäßig prüfen auf Security Updates

## Troubleshooting

### Build fehlgeschlagen
- Logs in Vercel prüfen
- Lokales `npm run build` testen
- Warte auf längere Build-Zeiten

### Environment-Variablen nicht geladen
- Überprüfen Sie die Variablennamen (case-sensitive)
- Starten Sie einen neuen Deploy nach Änderungen
- Verwenden Sie `NEXT_PUBLIC_` für Client-seitige Variablen

## Support

Dokumentation: https://vercel.com/docs
