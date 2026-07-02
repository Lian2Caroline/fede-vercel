---
name: Cloudflare + Vercel security setup
description: Étapes complètes pour configurer Cloudflare devant Vercel — à faire après que le déploiement Vercel fonctionne
---

## Pré-requis
- Domaine final enregistré (fede-financement.com ou autre)
- Déploiement Vercel fonctionnel sur *.vercel.app

## Étapes dans l'ordre

1. **Créer un compte Cloudflare** (free tier suffit) sur cloudflare.com
2. **Ajouter le domaine** → "Add a Site" → entrer le domaine → plan Free
3. **Changer les nameservers** chez le registrar (ex: OVH, Namecheap) → pointer vers les NS Cloudflare fournis
4. **Créer l'enregistrement DNS** dans Cloudflare :
   - Type : CNAME
   - Name : @ (ou www selon le domaine)
   - Target : `cname.vercel-dns.com`
   - Proxy : activé (nuage ORANGE — pas gris)
5. **SSL/TLS → Overview** → Mode : **Full (Strict)** (pas Flexible !)
6. **SSL/TLS → Edge Certificates** → Always Use HTTPS : ON
7. **Security → Bots** → Bot Fight Mode : ON
8. **Speed → Optimization** → Auto Minify : HTML + CSS + JS : ON
9. **Dans Vercel** : Settings → Domains → ajouter le domaine custom
10. **Mettre à jour les env vars Vercel** :
    - `CORS_ORIGIN` → `https://fede-financement.com` (ou le vrai domaine)
    - `FRONTEND_URL` → idem

## Code déjà préparé
- `app.ts` : `trust proxy` passe à 2 en production (Cloudflare hop + Vercel hop) ✅
- `vercel.json` : headers Cache-Control sur /api/* ✅

## Pourquoi Full Strict
Flexible = pas de chiffrement entre Cloudflare et Vercel → attaque possible.
Full Strict = chiffrement end-to-end, Vercel a son propre cert valide.
