# ✅ Checkliste für Launch

Verwenden Sie diese Checkliste, um sicherzustellen, dass alles vor dem Launch konfiguriert ist.

## Phase 1: Lokale Entwicklung ✓

- [x] Next.js Projekt erstellt
- [x] Alle Pakete installiert
- [x] TypeScript konfiguriert
- [x] TailwindCSS eingerichtet
- [x] Komponenten erstellt
- [x] API Routes implementiert
- [x] Berechnungslogik implementiert
- [x] Build erfolgreich (no TS errors)

✅ **Status**: Alles läuft lokal!

## Phase 2: Externe Services (TODO)

- [ ] **Supabase Account**
  - [ ] Projekt erstellen
  - [ ] Users-Tabelle anlegen
  - [ ] API Keys kopieren
  - [ ] `.env.local` aktualisieren
  - Siehe: [SUPABASE_SETUP.md](SUPABASE_SETUP.md)

- [ ] **Resend Account**
  - [ ] Account erstellen
  - [ ] API Key erstellen
  - [ ] Test-Domain verifizieren
  - [ ] `.env.local` aktualisieren
  - Siehe: [RESEND_SETUP.md](RESEND_SETUP.md)

- [ ] **Vercel Account**
  - [ ] Account erstellen
  - [ ] GitHub verbinden
  - [ ] Repository erstellen
  - Siehe: [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md)

## Phase 3: Lokale Tests (TODO)

Nach Supabase + Resend Setup:

- [ ] `npm run dev` starten
- [ ] http://localhost:3000 öffnen
- [ ] Calculator ausprobieren
  - [ ] Daten eingeben
  - [ ] Berechnung ausführen
  - [ ] Ergebnisse anzeigen
- [ ] Registration testen
  - [ ] Registrierungsformular ausfüllen
  - [ ] Verifikations-E-Mail empfangen
  - [ ] E-Mail-Link klicken
  - [ ] Bestätigungsseite sehen
- [ ] Fehlerbehandlung prüfen
  - [ ] Invalide Daten eingeben (sollte Error zeigen)
  - [ ] Duplikate E-Mail (sollte Error zeigen)

## Phase 4: Produktion (TODO)

- [ ] **GitHub Repository**
  - [ ] Repository erstellen
  - [ ] Code pushen
  - [ ] `.env.local` in `.gitignore` (WICHTIG!)
  - Siehe: [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md)

- [ ] **Vercel Deployment**
  - [ ] GitHub mit Vercel verbinden
  - [ ] Environment-Variablen setzen
  - [ ] Deploy ausführen
  - [ ] Build erfolgreich
  - [ ] https://production-profit-tool.vercel.app geöffnet?

- [ ] **Datenschutz & Legal**
  - [ ] Impressum ausfüllen (/impressum)
  - [ ] Datenschutzerklärung anpassen (/datenschutz)
  - [ ] AGB erstellen (optional)
  - [ ] Impressum & Datenschutz in live
  - [ ] GDPR Compliant

- [ ] **Domain (Optional)**
  - [ ] Domain kaufen
  - [ ] Zu Vercel verbinden
  - [ ] CNAME/A Records setzen
  - [ ] SSL/TLS vergewissert (automatisch)

- [ ] **Production Testing**
  - [ ] Öffnieren Sie https://production-profit-tool.vercel.app
  - [ ] Calculator testen
  - [ ] Registration testen
  - [ ] E-Mail prüfen
  - [ ] Mobil testen
  - [ ] Browser-Kompatibilität prüfen

## Phase 5: Optional - Analytics

- [ ] PostHog oder Plausible Setup
- [ ] Event Tracking:
  - [ ] `calculator_started`
  - [ ] `result_calculated`
  - [ ] `registration_started`
  - [ ] `registration_completed`

## Phase 6: Monitoring

- [ ] Vercel Logs prüfen
- [ ] Supabase Error Logs prüfen
- [ ] Resend Bounce Reports prüfen
- [ ] Error Tracking einrichten (Sentry optional)

## vor Launch Checklist

```
Sicherheit:
  ✓ Keine Secrets in Git-Repo
  ✓ HTTPS aktiviert (Vercel)
  ✓ Environment-Variablen sicher gespeichert
  ✓ API Keys rotiert vor Deploy

Funktionalität:
  ✓ Calculator arbeitet korrekt
  ✓ Registration funktioniert
  ✓ E-Mail-Verifikation funktioniert
  ✓ Fehlerbehandlung aktiv

Performance:
  ✓ Build-Zeit < 60s
  ✓ API Response < 200ms
  ✓ Seiten-Load < 3s

SEO/UX:
  ✓ Meta-Tags gesetzt (Next.js head)
  ✓ Mobile-friendly
  ✓ Accessibility (labels, etc)
```

## nach Launch

- [ ] Monitor Vercel Logs täglich
- [ ] Überprüfen Sie E-Mail-Deliverability
- [ ] Überprüfen Sie Datenbank-Performance
- [ ] Sammeln Sie User Feedback
- [ ] A/B Testing Ideen notieren

## Commands Cheat Sheet

```bash
# Development
npm run dev              # Starten Sie Server auf :3000

# Production
npm run build            # Build erstelle
npm start                # Start production server

# Linting
npm run lint             # Prüfen Sie auf Fehler

# Debugging
npx tsc --noEmit        # TypeScript Check
npm run build -- --debug  # Build mit Debug Info
```

## Wichtige URLs

- 🏠 Homepage: http://localhost:3000
- 📱 Register: http://localhost:3000/register
- ⚖️ Impressum: http://localhost:3000/impressum
- 🔐 Datenschutz: http://localhost:3000/datenschutz
- 📊 Supabase DB: https://app.supabase.com
- 📧 Resend Dashboard: https://resend.com
- 🚀 Vercel: https://vercel.com

## Support & Hilfe

❓ **Fragen?** Siehe:
- [QUICKSTART.md](QUICKSTART.md)
- [ARCHITECTURE.md](ARCHITECTURE.md)
- [SUPABASE_SETUP.md](SUPABASE_SETUP.md)
- [RESEND_SETUP.md](RESEND_SETUP.md)
- [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md)

---

**Viel Erfolg beim Launch! 🚀**
