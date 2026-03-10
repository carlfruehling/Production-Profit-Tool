# 🚀 Quickstart Guide

Dieses Projekt ist vollständig konfiguriert und bereit zum Starten!

## 1️⃣ Schnell starten (Entwicklung)

```bash
npm run dev
```

Die Anwendung öffnet sich unter http://localhost:3000

## 2️⃣ Bevor Sie in Produktion gehen

Sie müssen einige externe Dienste einrichten:

### A) Supabase Datenbank

- Datei: [SUPABASE_SETUP.md](SUPABASE_SETUP.md)
- Dauert: ~5 Minuten
- Brauut: Supabase Account (kostenlos)

### B) Resend E-Mail Service

- Datei: [RESEND_SETUP.md](RESEND_SETUP.md) 
- Dauert: ~2 Minuten
- Brauut: Resend Account (kostenlos)

### C) Environment-Variablen

Bearbeiten Sie `.env.local` mit Ihren Keys von A) und B):

```env
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
RESEND_API_KEY=...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 3️⃣ Testing

```bash
# Lokaler Development Server
npm run dev

# Production Build testen
npm run build
npm start

# Linting
npm run lint

# TypeScript Check
npx tsc --noEmit
```

## 4️⃣ Deploy auf Vercel

- Datei: [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md)
- Dauert: ~10 Minuten
- Brauut: GitHub + Vercel Account (kostenlos)

## 📊 Was ist im MVP enthalten?

✅ Landingpage mit Hero-Section  
✅ Berechnung ungenutzter Maschinenkapazität  
✅ Registrierungsformular mit Validierung  
✅ E-Mail Double-Opt-In (mit Resend)  
✅ Datenschutzerklärung & Impressum  
✅ Responsive Design  
✅ TypeScript  
✅ Database (Supabase)  

## 🎯 Was ist noch zu tun?

Optional für mehr Features:

- [ ] Analytics Integration (PostHog/Plausible)
- [ ] User Login/Dashboard
- [ ] Payment Integration (Stripe)
- [ ] Admin Panel
- [ ] More detailed reports
- [ ] API Documentation

## 🆘 Häufige Probleme

### "Cannot find module '@supabase/supabase-js'"
```bash
npm install
```

### "Supabase URL fehlt"
Überprüfen Sie `.env.local` und starten Sie den Server neu.

### "Component 'X' not found"
Stellen Sie sicher, dass alle Komponenten-Importe korrekt sind.

## 💡 Tipps

- Verwende TypeScript für Typsicherheit
- TailwindCSS für schnelle Styles
- Supabase SQL Editor für Datenbank-Tests
- Vercel für einfaches Deployment

## 📝 Nächste Schritte

1. **Lokal starten**: `npm run dev`
2. **Services einrichten**: Supabase + Resend
3. **Environment-Variablen** hinzufügen
4. **GitHub Repo** erstellen
5. **Zu Vercel deployen**
6. **Domain verbinden**

## ❓ Fragen?

Siehe die technischen Guides:
- [SUPABASE_SETUP.md](SUPABASE_SETUP.md)
- [RESEND_SETUP.md](RESEND_SETUP.md)
- [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md)
- [README.md](README.md)

---

**Status**: ✅ MVP vollständig - bereit zum Deploy!
