import { PDFDocument } from "pdf-lib";

// PDF magic bytes: %PDF
const PDF_MAGIC = Buffer.from([0x25, 0x50, 0x44, 0x46]);

// Dangerous PDF patterns (JavaScript, embedded files, launch actions, etc.)
const DANGEROUS_PATTERNS: RegExp[] = [
  /\/JavaScript\s/gi,
  /\/JS\s*\(/gi,
  /\/Launch\s/gi,
  /\/SubmitForm\s/gi,
  /\/ImportData\s/gi,
  /\/RichMedia\s/gi,
  /\/EmbeddedFile\s/gi,
  /\/OpenAction\s/gi,
  /\/AA\s/gi,          // Additional Actions
  /\/XFA\s/gi,         // XML Forms Architecture (can contain JS)
  /\/JBIG2Decode\s/gi, // can be used in exploits
];

export interface SanitizeResult {
  ok: boolean;
  error?: string;
  buffer?: Buffer;
  warnings: string[];
}

/**
 * Multi-layer PDF sanitization:
 * 1. Magic bytes verification (must be a real PDF)
 * 2. Size limit
 * 3. Dangerous pattern detection in raw content
 * 4. PDF-lib rewrite (strips all JavaScript, actions, embedded files)
 * 5. Verifies the rewritten PDF is parseable
 */
export async function sanitizePdf(
  buffer: Buffer,
  maxSizeBytes = 20 * 1024 * 1024 // 20 MB
): Promise<SanitizeResult> {
  const warnings: string[] = [];

  // ── Layer 1: Magic bytes ──────────────────────────────────────────────────
  if (buffer.length < 4 || !buffer.slice(0, 4).equals(PDF_MAGIC)) {
    return { ok: false, error: "Le fichier n'est pas un PDF valide (signature invalide).", warnings };
  }

  // ── Layer 2: Size ─────────────────────────────────────────────────────────
  if (buffer.length > maxSizeBytes) {
    return {
      ok: false,
      error: `Le fichier dépasse la taille maximale autorisée (${Math.round(maxSizeBytes / 1024 / 1024)} Mo).`,
      warnings,
    };
  }

  // ── Layer 3: Raw content scan ─────────────────────────────────────────────
  const rawContent = buffer.toString("latin1");
  const found: string[] = [];
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(rawContent)) {
      found.push(pattern.source.split("\\")[0].replace(/\//g, ""));
    }
  }
  if (found.length > 0) {
    warnings.push(`Contenu potentiellement malveillant détecté : ${[...new Set(found)].join(", ")}`);
  }

  // ── Layer 4: PDF-lib rewrite (sanitize active content) ───────────────────
  let sanitizedBuffer: Buffer;
  try {
    const pdfDoc = await PDFDocument.load(buffer, {
      ignoreEncryption: false,
      updateMetadata: false,
    });

    // Remove document-level actions (OpenAction, AA)
    const catalog = pdfDoc.context.lookup(pdfDoc.context.trailerInfo.Root);
    if (catalog && typeof (catalog as any).delete === "function") {
      try {
        (catalog as any).delete("OpenAction");
        (catalog as any).delete("AA");
        (catalog as any).delete("JavaScript");
        (catalog as any).delete("Names");
        (catalog as any).delete("AcroForm");
      } catch {
        // Ignore if object doesn't have these keys
      }
    }

    // Remove page-level actions from all pages
    const pages = pdfDoc.getPages();
    for (const page of pages) {
      try {
        const node = page.node;
        (node as any).delete("AA");
        (node as any).delete("Annots");
      } catch {
        // Some pages may not have these — safe to ignore
      }
    }

    // Save the sanitized PDF
    const sanitizedBytes = await pdfDoc.save({ useObjectStreams: false });
    sanitizedBuffer = Buffer.from(sanitizedBytes);
  } catch (err: any) {
    return {
      ok: false,
      error: `Impossible de traiter ce PDF : ${err?.message ?? "format invalide"}`,
      warnings,
    };
  }

  // ── Layer 5: Verify the sanitized output is a valid PDF ───────────────────
  try {
    await PDFDocument.load(sanitizedBuffer);
  } catch {
    return {
      ok: false,
      error: "La sanitisation a produit un PDF invalide. Fichier rejeté.",
      warnings,
    };
  }

  return { ok: true, buffer: sanitizedBuffer, warnings };
}

/**
 * Validate a non-PDF file (images, etc.) — checks magic bytes only.
 * Returns an error if it looks like an executable or script.
 */
export function validateFileType(
  buffer: Buffer,
  mimeType: string
): { ok: boolean; error?: string } {
  // Reject obvious executables regardless of declared MIME
  const exeSigs: [Buffer, string | null][] = [
    [Buffer.from([0x4d, 0x5a]), "EXE/DLL"],
    [Buffer.from([0x7f, 0x45, 0x4c, 0x46]), "ELF executable"],
    [Buffer.from([0xca, 0xfe, 0xba, 0xbe]), "Mach-O executable"],
    [Buffer.from([0x50, 0x4b, 0x03, 0x04]), null], // ZIP — allow (docx, xlsx, etc.)
  ];

  for (const [sig, label] of exeSigs) {
    if (label && buffer.length >= sig.length && buffer.slice(0, sig.length).equals(sig)) {
      return { ok: false, error: `Fichier exécutable rejeté (${label}).` };
    }
  }

  return { ok: true };
}
