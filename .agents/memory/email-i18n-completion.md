---
name: Email i18n completion
description: État final de l'internationalisation des 18 emails et du portail utilisateur
---

## Règle

Toutes les strings **user-facing** (emails + portail) doivent utiliser `t()`. Les emails admin (9, 9b, 10, 12) peuvent rester hardcodés en français — décision acceptée.

**Why:** L'appli sert 27 pays EU. Les utilisateurs voient les emails dans leur langue via `territoireToLang(user.territoire)`.

## Comment appliquer

- API emails: passer `lang: territoireToLang(user.territoire)` à toute fonction `send*Email` qui prend un `lang?` optionnel
- `sendVirementCodeEmail`: utilise `t(lang, "virement_etape_X")` pour les libellés d'étape (1–4)
- Layout email: `t(lang, "email_subtitle")` dans le header (plus de string hardcodée FR)
- Formatage montants: `lang === "fr" ? "fr-FR" : lang === "en" ? "en-GB" : \`${lang}-${lang.toUpperCase()}\``
- Portail React: `useTranslation()` → `t("invoice.*")`, `t("docs.pdf_generating")` etc.

## Clés i18n API ajoutées (api-server/src/lib/i18n.ts, 22 langues)

`email_subtitle`, `virement_etape_1`, `virement_etape_2`, `virement_etape_3`, `virement_etape_4`

## Clés i18n frontend ajoutées (22 locales JSON)

`invoice.echeance_reception`, `invoice.mission_designation`, `invoice.mission_description`, `docs.pdf_generating`

## Fichiers clés

- `artifacts/api-server/src/lib/mailer.ts` — toutes les fonctions `send*Email`
- `artifacts/api-server/src/lib/i18n.ts` — dictionnaire API (structure `mk([val1..val22])`)
- `artifacts/api-server/src/routes/virements.ts` — passer `lang` aux 2 appels `sendVirementCodeEmail`
- `artifacts/financedom/src/pages/UserDocumentPreview.tsx` — facture user-facing
