---
name: Email reduction plan
description: Decision deferred — 18 emails currently sent; user wants to reduce but waiting until project is fully functional
---

## Status
**Deferred** — à revisiter en fin de projet. Rappeler à l'utilisateur.

## Inventaire des 18 mails

| # | Fonction | Déclencheur | Obligatoire |
|---|---|---|---|
| 1 | sendEmailVerification | Inscription | Oui |
| 2 | sendLoginVerification | Connexion nouvelle IP (2FA) | Oui |
| 3 | sendPasswordReset | Demande user | Oui |
| 4 | sendDossierCreated | User crée un dossier | Discutable |
| 5 | sendDossierSoumis | User soumet le dossier | Accusé de réception |
| 6 | sendStatutChange → éligible | Admin | Important |
| 7 | sendStatutChange → en_instruction | Admin | Redondant |
| 8 | sendStatutChange → décision | Admin | Important |
| 9 | sendStatutChange → paiement | Admin | Important |
| 10 | sendStatutChange → clôturé | Admin | Discutable |
| 11 | sendStatutChange → refusé | Admin | Important |
| 12 | sendDemandeDocuments | Admin demande docs | Action requise |
| 13 | sendDocumentRejected | Admin rejette un doc (× N docs) | Redondant si N > 1 |
| 14 | sendNewMessageNotification | Admin envoie message | Selon fréquence |
| 15 | sendFraisEmis | Admin émet les frais | Action requise |
| 16 | sendVirementCodeEmail | Code de virement user | Action requise |
| 17 | sendVirementComplete | Virement confirmé | Important |
| 18 | sendBroadcast | Admin broadcast | Voulu |

## Options discutées

**Option A — Jalons clés (recommandée)** : ~10 mails
- Supprimer : sendDossierCreated, statut en_instruction, statut clôturé
- Grouper : plusieurs docs rejetés → 1 seul mail récapitulatif

**Option B — Digest quotidien** : grouper statuts + rejets en 1 mail/jour (9h)
- Mails urgents (2FA, virement, frais) restent immédiats
- Complexité technique : file d'attente + cron

**Option C — Préférences user** : garder les 18, ajouter opt-out dans le profil

**Why deferred:** User préfère attendre que le projet soit stable avant de changer la logique mail.
