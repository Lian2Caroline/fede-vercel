import React from "react";
import i18n from "@/i18n";

interface SignatureParty {
  role: string;
  name?: string;
  title?: string;
  location?: string;
  date?: string;
}

interface SignatureBlockProps {
  parties: SignatureParty[];
  intro?: string;
  className?: string;
}

export function SignatureBlock({ parties, intro, className = "" }: SignatureBlockProps) {
  return (
    <div className={`doc-signature-block ${className}`}>
      {intro && <p className="doc-signature-intro">{intro}</p>}
      <div className="doc-signature-grid" style={{ gridTemplateColumns: `repeat(${parties.length}, 1fr)` }}>
        {parties.map((party, i) => (
          <div key={i} className="doc-signature-party">
            <p className="doc-signature-role">{party.role}</p>
            {(party.name || party.title) && (
              <div className="doc-signature-identity">
                {party.name && <p className="doc-signature-name">{party.name}</p>}
                {party.title && <p className="doc-signature-title">{party.title}</p>}
              </div>
            )}
            {party.location && (
              <p className="doc-signature-location">
                {i18n.t("docs.signature.made_in")} {party.location}
                {party.date ? `${i18n.t("docs.signature.on_date")}${party.date}` : ""}
              </p>
            )}
            <div className="doc-signature-line-zone">
              <div className="doc-signature-line" />
              <p className="doc-signature-hint">Signature</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
