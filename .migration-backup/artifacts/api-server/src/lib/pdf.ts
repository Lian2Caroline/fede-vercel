import PDFDocument from "pdfkit";

const BLEU = "#0D1F3C";
const GOLD = "#B5872A";
const GRIS_CLAIR = "#F5F6FA";
const GRIS_TEXTE = "#4A5568";
const BLANC = "#FFFFFF";

export interface DossierData {
  reference: string;
  titre: string;
  territoire: string;
  dispositif: string;
  secteur: string;
  montantDemande: number;
  description?: string | null;
  expertDesigne?: string | null;
  createdAt: string;
}

export interface UserData {
  prenom: string;
  nom: string;
  email: string;
  telephone?: string | null;
  organisation?: string | null;
  typePorteur?: string | null;
}

function bufferFromDoc(doc: InstanceType<typeof PDFDocument>): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });
}

function addLetterhead(doc: InstanceType<typeof PDFDocument>, dateStr?: string) {
  doc.rect(0, 0, doc.page.width, 90).fill(BLEU);
  doc.rect(0, 90, doc.page.width, 4).fill(GOLD);

  doc.fillColor(BLANC)
    .font("Helvetica-Bold")
    .fontSize(20)
    .text("CapSubvention", 50, 28);

  doc.fillColor("#B0BAD0")
    .font("Helvetica")
    .fontSize(9)
    .text("Financement public non remboursable · Outre-Mer · Article L1611-2 CGCT", 50, 52);

  const date = dateStr ?? new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
  doc.fillColor(BLANC)
    .font("Helvetica")
    .fontSize(9)
    .text(date, 0, 40, { align: "right", width: doc.page.width - 50 });

  doc.moveDown(0);
  doc.y = 120;
}

function addFooter(doc: InstanceType<typeof PDFDocument>) {
  const bottom = doc.page.height - 50;
  doc.rect(0, bottom - 10, doc.page.width, 1).fill("#E2E8F0");
  doc.fillColor(GRIS_TEXTE)
    .font("Helvetica")
    .fontSize(8)
    .text(
      "CapSubvention · support@capsubvention.com · www.capsubvention.com · Données protégées RGPD · © " + new Date().getFullYear(),
      50, bottom,
      { align: "center", width: doc.page.width - 100 }
    );
}

function sectionTitle(doc: InstanceType<typeof PDFDocument>, title: string) {
  doc.moveDown(0.5);
  doc.rect(50, doc.y, doc.page.width - 100, 28).fill(GRIS_CLAIR);
  doc.fillColor(BLEU)
    .font("Helvetica-Bold")
    .fontSize(10)
    .text(title.toUpperCase(), 60, doc.y + 8);
  doc.y += 36;
}

function infoRow(doc: InstanceType<typeof PDFDocument>, label: string, value: string) {
  const y = doc.y;
  doc.fillColor(GRIS_TEXTE).font("Helvetica").fontSize(9).text(label, 60, y, { width: 160 });
  doc.fillColor(BLEU).font("Helvetica-Bold").fontSize(9).text(value, 230, y, { width: doc.page.width - 280 });
  doc.y = y + 18;
}

function paragraph(doc: InstanceType<typeof PDFDocument>, text: string) {
  doc.fillColor("#1A202C").font("Helvetica").fontSize(10).text(text, 50, doc.y, {
    width: doc.page.width - 100,
    lineGap: 3,
  });
  doc.moveDown(0.5);
}

function articleTitle(doc: InstanceType<typeof PDFDocument>, num: string, title: string) {
  doc.moveDown(0.3);
  doc.fillColor(BLEU).font("Helvetica-Bold").fontSize(10)
    .text(`Article ${num} — ${title}`, 50, doc.y, { width: doc.page.width - 100 });
  doc.moveDown(0.2);
}

function signatureBlock(doc: InstanceType<typeof PDFDocument>, leftLabel: string, rightLabel: string) {
  doc.moveDown(1.5);
  const y = doc.y;
  const col = (doc.page.width - 100) / 2;

  doc.rect(50, y, col - 10, 70).stroke("#CBD5E0");
  doc.rect(50 + col + 10, y, col - 10, 70).stroke("#CBD5E0");

  doc.fillColor(GRIS_TEXTE).font("Helvetica").fontSize(9)
    .text(leftLabel, 60, y + 8, { width: col - 20 })
    .text(rightLabel, 60 + col + 10, y + 8, { width: col - 20 });

  doc.fillColor(GRIS_TEXTE).font("Helvetica").fontSize(8)
    .text("Signature :", 60, y + 40)
    .text("Signature :", 60 + col + 10, y + 40);

  doc.y = y + 80;
}

function stampBox(doc: InstanceType<typeof PDFDocument>, label: string, value: string, color = BLEU) {
  const w = 200;
  const x = doc.page.width - 50 - w;
  const y = doc.y;
  doc.rect(x, y, w, 50).fill(color);
  doc.fillColor(BLANC).font("Helvetica").fontSize(8).text(label, x + 10, y + 8, { width: w - 20 });
  doc.fillColor(BLANC).font("Helvetica-Bold").fontSize(16).text(value, x + 10, y + 22, { width: w - 20 });
  doc.y = y + 60;
}

// ─── 1. ACCUSÉ DE RÉCEPTION ──────────────────────────────────────────────────

export async function generateAccuseReception(dossier: DossierData, user: UserData): Promise<Buffer> {
  const doc = new PDFDocument({ margin: 0, size: "A4" });
  const promise = bufferFromDoc(doc);

  addLetterhead(doc);
  doc.moveDown(1);

  doc.fillColor(BLEU).font("Helvetica-Bold").fontSize(16)
    .text("ACCUSÉ DE RÉCEPTION", { align: "center" });
  doc.fillColor(GOLD).font("Helvetica").fontSize(10)
    .text("Demande de financement non remboursable", { align: "center" });
  doc.moveDown(1);

  paragraph(doc, `Nous accusons réception de votre demande de financement non remboursable déposée sur la plateforme CapSubvention. Votre dossier a bien été enregistré dans nos systèmes et est actuellement en cours d'analyse par nos équipes.`);

  sectionTitle(doc, "Récapitulatif de votre demande");
  infoRow(doc, "Référence du dossier", dossier.reference);
  infoRow(doc, "Porteur du projet", `${user.prenom} ${user.nom}`);
  infoRow(doc, "Territoire", dossier.territoire);
  infoRow(doc, "Dispositif sollicité", dossier.dispositif);
  infoRow(doc, "Secteur d'activité", dossier.secteur);
  infoRow(doc, "Montant demandé", `${Number(dossier.montantDemande).toLocaleString("fr-FR")} €`);
  infoRow(doc, "Date de dépôt", new Date(dossier.createdAt).toLocaleDateString("fr-FR"));

  doc.moveDown(0.5);
  sectionTitle(doc, "Prochaines étapes");
  paragraph(doc, "Nos équipes procèdent à l'analyse de votre dossier. Vous serez notifié par e-mail de toute évolution du traitement. Un conseiller CapSubvention vous contactera dans les meilleurs délais pour vous communiquer les résultats de l'analyse d'éligibilité.");
  paragraph(doc, "Pour toute question relative à votre dossier, vous pouvez contacter notre équipe à l'adresse suivante : support@capsubvention.com ou via la messagerie de votre espace personnel.");

  doc.moveDown(1);
  doc.fillColor(GRIS_TEXTE).font("Helvetica").fontSize(9)
    .text(`Ce document a été généré automatiquement le ${new Date().toLocaleDateString("fr-FR")} par la plateforme CapSubvention.`, 50, doc.y, { align: "center", width: doc.page.width - 100 });

  addFooter(doc);
  doc.end();
  return promise;
}

// ─── 2. RAPPORT D'ÉLIGIBILITÉ ─────────────────────────────────────────────────

export async function generateRapportEligibilite(dossier: DossierData, user: UserData, note?: string): Promise<Buffer> {
  const doc = new PDFDocument({ margin: 0, size: "A4" });
  const promise = bufferFromDoc(doc);

  addLetterhead(doc);
  doc.moveDown(1);

  doc.fillColor(BLEU).font("Helvetica-Bold").fontSize(16)
    .text("RAPPORT D'ÉLIGIBILITÉ", { align: "center" });
  doc.fillColor(GOLD).font("Helvetica").fontSize(10)
    .text("Analyse préliminaire des dispositifs de financement", { align: "center" });
  doc.moveDown(1);

  paragraph(doc, `Après analyse de votre dossier (réf. ${dossier.reference}), nos équipes ont procédé à l'examen de votre éligibilité aux différents dispositifs de financement non remboursable disponibles pour votre territoire et votre secteur d'activité.`);

  sectionTitle(doc, "Identification du porteur de projet");
  infoRow(doc, "Porteur", `${user.prenom} ${user.nom}`);
  infoRow(doc, "Organisation", user.organisation ?? "Porteur individuel");
  infoRow(doc, "Territoire", dossier.territoire);
  infoRow(doc, "Secteur", dossier.secteur);
  infoRow(doc, "Référence dossier", dossier.reference);

  doc.moveDown(0.5);
  sectionTitle(doc, "Résultat de l'analyse d'éligibilité");
  doc.rect(50, doc.y, doc.page.width - 100, 36).fill("#ECFDF5");
  doc.fillColor("#065F46").font("Helvetica-Bold").fontSize(11)
    .text("✓  Votre projet est éligible à des financements non remboursables", 65, doc.y + 12);
  doc.y += 46;

  doc.moveDown(0.3);
  paragraph(doc, `Votre projet "${dossier.titre}" présente des caractéristiques compatibles avec plusieurs dispositifs de financement public en vigueur sur le territoire de ${dossier.territoire}. Les dispositifs identifiés sont susceptibles de financer tout ou partie de votre projet, sous réserve de la constitution d'un dossier complet conforme aux exigences des organismes financeurs.`);

  sectionTitle(doc, "Dispositifs identifiés");
  infoRow(doc, "Dispositif principal", dossier.dispositif);
  infoRow(doc, "Montant potentiel", `Jusqu'à ${Number(dossier.montantDemande).toLocaleString("fr-FR")} €`);
  infoRow(doc, "Taux de financement estimé", "40 % à 80 % selon les critères du dispositif");
  infoRow(doc, "Organisme financeur", "À confirmer selon le dispositif retenu");

  if (note) {
    doc.moveDown(0.5);
    sectionTitle(doc, "Observations du conseiller");
    paragraph(doc, note);
  }

  doc.moveDown(0.5);
  sectionTitle(doc, "Prochaines étapes");
  paragraph(doc, "Suite à ce rapport favorable, votre conseiller CapSubvention vous adresse la fiche de renseignements complémentaires à compléter et retourner signée. Cette fiche permettra la constitution de votre dossier de demande officiel auprès des organismes financeurs compétents.");

  doc.moveDown(0.5);
  stampBox(doc, "Décision d'éligibilité", "FAVORABLE", "#065F46");

  addFooter(doc);
  doc.end();
  return promise;
}

// ─── 3. CONTRAT DE MISSION ────────────────────────────────────────────────────

export async function generateContratMission(dossier: DossierData, user: UserData): Promise<Buffer> {
  const doc = new PDFDocument({ margin: 0, size: "A4" });
  const promise = bufferFromDoc(doc);

  addLetterhead(doc);
  doc.moveDown(1);

  doc.fillColor(BLEU).font("Helvetica-Bold").fontSize(15)
    .text("CONTRAT DE MISSION DE CONSEIL", { align: "center" });
  doc.fillColor(BLEU).font("Helvetica-Bold").fontSize(12)
    .text("EN FINANCEMENT PUBLIC NON REMBOURSABLE", { align: "center" });
  doc.fillColor(GOLD).font("Helvetica").fontSize(9)
    .text("Établi conformément à l'article L1611-2 du Code général des collectivités territoriales", { align: "center" });
  doc.moveDown(1);

  sectionTitle(doc, "Les parties");
  paragraph(doc, `D'une part : CapSubvention, plateforme de conseil en financement public, ci-après dénommée « le Prestataire ».\n\nD'autre part : ${user.prenom} ${user.nom}${user.organisation ? `, représentant ${user.organisation}` : ""}, ci-après dénommé(e) « le Client ».\n\nEnsemble désignées « les Parties ».`);

  articleTitle(doc, "1", "Objet de la mission");
  paragraph(doc, `Le Prestataire est mandaté par le Client pour l'accompagnement à la recherche, à l'identification et au montage de dossiers de demande de financement public non remboursable, dans le cadre du projet « ${dossier.titre} » sur le territoire de ${dossier.territoire}, pour un montant cible de ${Number(dossier.montantDemande).toLocaleString("fr-FR")} €.`);

  articleTitle(doc, "2", "Durée de la mission");
  paragraph(doc, "Le présent contrat prend effet à compter de sa signature par les deux parties et est conclu pour une durée de douze (12) mois, renouvelable par accord écrit des parties.");

  articleTitle(doc, "3", "Honoraires et modalités de paiement");
  paragraph(doc, "Les honoraires du Prestataire sont fixés à 456,00 € TTC (trois cent quatre-vingt euros hors taxes, soit 380,00 € HT + 76,00 € de TVA à 20 %), conformément à l'article L1611-2 du Code général des collectivités territoriales.\n\nLes honoraires sont exigibles à réception de la première notification d'attribution de subvention. Aucun paiement n'est dû en l'absence de résultat favorable.");

  articleTitle(doc, "4", "Obligations du Prestataire");
  paragraph(doc, "Le Prestataire s'engage à : (i) identifier les dispositifs de financement auxquels le projet est éligible ; (ii) constituer et soumettre les dossiers de demande auprès des organismes financeurs compétents ; (iii) assurer le suivi des demandes et tenir le Client informé de toute évolution ; (iv) transmettre au Client toute décision rendue par les organismes financeurs.");

  articleTitle(doc, "5", "Obligations du Client");
  paragraph(doc, "Le Client s'engage à : (i) fournir au Prestataire l'ensemble des documents et informations nécessaires dans les délais impartis ; (ii) certifier l'exactitude des informations communiquées ; (iii) informer le Prestataire de toute modification de situation susceptible d'affecter l'éligibilité du projet.");

  articleTitle(doc, "6", "Confidentialité et protection des données");
  paragraph(doc, "Les Parties s'engagent à traiter confidentiellement les informations échangées dans le cadre de la présente mission. Les données personnelles collectées sont traitées conformément au Règlement général sur la protection des données (RGPD — Règlement UE 2016/679).");

  doc.moveDown(0.5);
  signatureBlock(doc,
    "Pour CapSubvention\nLe Prestataire",
    `Pour le Client\n${user.prenom} ${user.nom}`
  );

  doc.fillColor(GRIS_TEXTE).font("Helvetica").fontSize(8)
    .text(`Fait en deux exemplaires originaux. Référence dossier : ${dossier.reference}`, { align: "center" });

  addFooter(doc);
  doc.end();
  return promise;
}

// ─── 4. NOTIFICATION D'ATTRIBUTION ───────────────────────────────────────────

export async function generateNotificationAttribution(dossier: DossierData, user: UserData, montantAccorde?: number, note?: string): Promise<Buffer> {
  const doc = new PDFDocument({ margin: 0, size: "A4" });
  const promise = bufferFromDoc(doc);

  addLetterhead(doc);
  doc.moveDown(1);

  doc.fillColor(BLEU).font("Helvetica-Bold").fontSize(16)
    .text("NOTIFICATION D'ATTRIBUTION", { align: "center" });
  doc.fillColor(GOLD).font("Helvetica").fontSize(10)
    .text("Décision favorable de financement non remboursable", { align: "center" });
  doc.moveDown(0.5);

  doc.rect(50, doc.y, doc.page.width - 100, 44).fill("#ECFDF5");
  doc.fillColor("#065F46").font("Helvetica-Bold").fontSize(12)
    .text("✓  DÉCISION FAVORABLE — Subvention accordée", 65, doc.y + 14);
  doc.y += 54;

  paragraph(doc, `Nous avons le plaisir de vous informer que votre demande de financement non remboursable pour le projet « ${dossier.titre} » a reçu une décision favorable de la part de l'organisme financeur compétent.`);

  sectionTitle(doc, "Récapitulatif de la décision");
  infoRow(doc, "Bénéficiaire", `${user.prenom} ${user.nom}${user.organisation ? ` — ${user.organisation}` : ""}`);
  infoRow(doc, "Territoire", dossier.territoire);
  infoRow(doc, "Dispositif", dossier.dispositif);
  infoRow(doc, "Projet financé", dossier.titre);
  infoRow(doc, "Référence dossier", dossier.reference);
  infoRow(doc, "Montant attribué", `${(montantAccorde ?? dossier.montantDemande).toLocaleString("fr-FR")} €`);
  infoRow(doc, "Date de décision", new Date().toLocaleDateString("fr-FR"));

  if (note) {
    sectionTitle(doc, "Conditions d'attribution");
    paragraph(doc, note);
  }

  sectionTitle(doc, "Obligations post-attribution");
  paragraph(doc, "En acceptant cette subvention, vous vous engagez à : (i) utiliser les fonds exclusivement aux fins du projet décrit dans le dossier de demande ; (ii) respecter les délais de réalisation convenus ; (iii) fournir les justificatifs de dépenses et rapports d'avancement selon le calendrier fixé par la convention d'attribution ; (iv) informer l'organisme financeur de tout changement significatif du projet.");

  sectionTitle(doc, "Prochaines étapes — Frais d'instruction CapSubvention");
  paragraph(doc, `Suite à cette décision favorable, les frais d'instruction CapSubvention s'élèvent à 456,00 € TTC, conformément au contrat de mission signé et à l'article L1611-2 du Code général des collectivités territoriales. Vous recevrez séparément un lien de paiement sécurisé.`);

  addFooter(doc);
  doc.end();
  return promise;
}

// ─── 5. FACTURE ──────────────────────────────────────────────────────────────

export async function generateFacture(dossier: DossierData, user: UserData, fraisRef: string): Promise<Buffer> {
  const doc = new PDFDocument({ margin: 0, size: "A4" });
  const promise = bufferFromDoc(doc);

  addLetterhead(doc);
  doc.moveDown(1);

  doc.fillColor(BLEU).font("Helvetica-Bold").fontSize(18)
    .text("FACTURE", 50, doc.y);
  doc.fillColor(GRIS_TEXTE).font("Helvetica").fontSize(10)
    .text(`N° ${fraisRef}`, 50, doc.y);
  doc.moveDown(1);

  const colX = doc.page.width - 50 - 220;
  const yStart = doc.y - 60;
  doc.rect(colX, yStart, 220, 80).fill(GRIS_CLAIR);
  doc.fillColor(GRIS_TEXTE).font("Helvetica").fontSize(9)
    .text("Facturé à :", colX + 12, yStart + 8, { width: 200 });
  doc.fillColor(BLEU).font("Helvetica-Bold").fontSize(10)
    .text(`${user.prenom} ${user.nom}`, colX + 12, yStart + 22, { width: 200 });
  if (user.organisation) {
    doc.fillColor(GRIS_TEXTE).font("Helvetica").fontSize(9)
      .text(user.organisation, colX + 12, yStart + 36, { width: 200 });
  }
  doc.fillColor(GRIS_TEXTE).font("Helvetica").fontSize(9)
    .text(`Territoire : ${dossier.territoire}`, colX + 12, yStart + (user.organisation ? 50 : 36), { width: 200 });

  doc.y = yStart + 90;
  doc.moveDown(0.5);

  sectionTitle(doc, "Détail de la prestation");

  const tX = 50;
  const tW = doc.page.width - 100;
  const y0 = doc.y;
  doc.rect(tX, y0, tW, 26).fill(BLEU);
  doc.fillColor(BLANC).font("Helvetica-Bold").fontSize(9)
    .text("Désignation", tX + 10, y0 + 8, { width: tW * 0.55 })
    .text("Qté", tX + tW * 0.58, y0 + 8, { width: 40, align: "center" })
    .text("P.U. HT", tX + tW * 0.68, y0 + 8, { width: 70, align: "right" })
    .text("Total HT", tX + tW * 0.84, y0 + 8, { width: 60, align: "right" });
  doc.y = y0 + 30;

  const y1 = doc.y;
  doc.rect(tX, y1, tW, 22).fill(GRIS_CLAIR);
  doc.fillColor("#1A202C").font("Helvetica").fontSize(9)
    .text("Mission de conseil en financement public non remboursable", tX + 10, y1 + 6, { width: tW * 0.55 })
    .text("1", tX + tW * 0.58, y1 + 6, { width: 40, align: "center" })
    .text("380,00 €", tX + tW * 0.68, y1 + 6, { width: 70, align: "right" })
    .text("380,00 €", tX + tW * 0.84, y1 + 6, { width: 60, align: "right" });
  doc.y = y1 + 26;

  doc.moveDown(0.5);
  const sumX = doc.page.width - 50 - 220;
  const sumY = doc.y;
  doc.rect(sumX, sumY, 220, 72).fill(GRIS_CLAIR);
  doc.fillColor(GRIS_TEXTE).font("Helvetica").fontSize(9)
    .text("Total HT :", sumX + 10, sumY + 8, { width: 100 })
    .text("380,00 €", sumX + 110, sumY + 8, { width: 100, align: "right" })
    .text("TVA (20 %) :", sumX + 10, sumY + 26, { width: 100 })
    .text("76,00 €", sumX + 110, sumY + 26, { width: 100, align: "right" });
  doc.rect(sumX, sumY + 46, 220, 26).fill(BLEU);
  doc.fillColor(BLANC).font("Helvetica-Bold").fontSize(11)
    .text("TOTAL TTC :", sumX + 10, sumY + 52, { width: 100 })
    .text("456,00 €", sumX + 110, sumY + 52, { width: 100, align: "right" });
  doc.y = sumY + 82;

  doc.moveDown(1);
  doc.rect(50, doc.y, doc.page.width - 100, 40).fill("#EBF4FF");
  doc.fillColor("#1E40AF").font("Helvetica").fontSize(9)
    .text(`Base légale : article L1611-2 du Code général des collectivités territoriales · Référence dossier : ${dossier.reference} · Dossier : ${dossier.titre}`, 60, doc.y + 12, { width: doc.page.width - 120 });
  doc.y += 50;

  addFooter(doc);
  doc.end();
  return promise;
}

// ─── 6. FICHE DE COLLECTE ────────────────────────────────────────────────────

export async function generateFicheCollecte(dossier: DossierData, user: UserData): Promise<Buffer> {
  const doc = new PDFDocument({ margin: 0, size: "A4" });
  const promise = bufferFromDoc(doc);

  addLetterhead(doc);
  doc.moveDown(1);

  doc.fillColor(BLEU).font("Helvetica-Bold").fontSize(15)
    .text("FICHE DE RENSEIGNEMENTS COMPLÉMENTAIRES", { align: "center" });
  doc.fillColor(GOLD).font("Helvetica").fontSize(9)
    .text(`Référence dossier : ${dossier.reference} · À retourner complétée et signée`, { align: "center" });
  doc.moveDown(1);

  paragraph(doc, "Afin de constituer votre dossier de demande de financement, veuillez compléter les sections ci-dessous et retourner ce document signé à votre conseiller CapSubvention.");

  const fields: [string, string][] = [
    ["Raison sociale / Dénomination", ""],
    ["SIRET / RNA (pour les associations)", ""],
    ["Forme juridique", ""],
    ["Date de création de la structure", ""],
    ["Adresse du siège social", ""],
    ["Nom et qualité du représentant légal", ""],
    ["Description détaillée du projet", ""],
    ["Localisation exacte du projet", ""],
    ["Date de début prévisionnelle des travaux/activités", ""],
    ["Durée prévisionnelle de réalisation", ""],
    ["Montant total du projet (en €)", ""],
    ["Apport personnel ou fonds propres (en €)", ""],
    ["Autres financements sollicités ou obtenus", ""],
  ];

  sectionTitle(doc, "Informations à compléter");

  for (const [label] of fields) {
    const y = doc.y;
    doc.fillColor(GRIS_TEXTE).font("Helvetica").fontSize(9).text(label, 60, y, { width: 220 });
    doc.rect(290, y - 2, doc.page.width - 340, 18).stroke("#CBD5E0");
    doc.y = y + 22;
  }

  doc.moveDown(1);
  signatureBlock(doc,
    "Signature et cachet (si applicable)\nDate :",
    `Conseiller CapSubvention\n${dossier.expertDesigne ?? "À désigner"}`
  );

  addFooter(doc);
  doc.end();
  return promise;
}
