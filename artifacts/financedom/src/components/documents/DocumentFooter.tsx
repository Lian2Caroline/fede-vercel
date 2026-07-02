import React from "react";
import i18n from "@/i18n";

interface DocumentFooterProps {
  reference: string;
  page?: number;
  totalPages?: number;
  legalNote?: string;
  lang?: string;
}

export function DocumentFooter({
  reference,
  page,
  totalPages,
  legalNote,
  lang,
}: DocumentFooterProps) {
  const lng = lang || i18n.language || "fr";
  const T = (key: string) => i18n.t(key, { lng });
  const resolvedLegal = legalNote ?? T("docs.footer_legal");
  return (
    <footer className="doc-footer">
      <div className="doc-footer-line" />
      <div className="doc-footer-content">
        <span className="doc-footer-legal">{resolvedLegal}</span>
        <span className="doc-footer-ref">{T("docs.footer_ref")} {reference}</span>
        {page !== undefined && (
          <span className="doc-footer-page">
            {T("docs.footer_page")} {page}{totalPages ? ` / ${totalPages}` : ""}
          </span>
        )}
      </div>
    </footer>
  );
}
