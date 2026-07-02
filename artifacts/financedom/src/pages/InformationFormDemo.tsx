import { InformationForm } from "@/components/documents";

const TODAY = new Date().toLocaleDateString("fr-FR", {
  day: "2-digit", month: "long", year: "numeric",
});

export default function InformationFormDemo() {
  return (
    <div style={{ background: "#E5E7EB", minHeight: "100vh", padding: "32px 0" }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        maxWidth: "794px", margin: "0 auto 20px", padding: "0 4px",
      }}>
        <div>
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#6B7280", margin: 0 }}>
            Prévisualisation — Fiche de renseignements complémentaires
          </p>
          <p style={{ fontFamily: "Inter, monospace", fontSize: "10px", color: "#9CA3AF", margin: 0 }}>
            Composant InformationForm.tsx
          </p>
        </div>
        <button
          onClick={() => window.print()}
          style={{
            background: "#0B1F4D", color: "#fff", border: "none", borderRadius: "4px",
            padding: "8px 18px", fontFamily: "Inter, sans-serif",
            fontSize: "11px", fontWeight: 600, cursor: "pointer",
          }}
        >
          Exporter PDF
        </button>
      </div>

      <div style={{ maxWidth: "794px", margin: "0 auto" }}>
        <InformationForm
          reference="FD-2026-83474"
          dateEmission={TODAY}
          porteur="Marc Lalan"
          nomProjet="Projet du Nord"
          territoire="France"
          montantCible="150 000 €"
        />
      </div>
    </div>
  );
}
