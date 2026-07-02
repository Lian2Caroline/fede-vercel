import { MissionContract } from "@/components/documents";

const TODAY = new Date().toLocaleDateString("fr-FR", {
  day: "2-digit", month: "long", year: "numeric",
});

export default function MissionContractDemo() {
  return (
    <div style={{ background: "#E5E7EB", minHeight: "100vh", padding: "32px 0" }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        maxWidth: "794px", margin: "0 auto 20px", padding: "0 4px",
      }}>
        <div>
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#6B7280", margin: 0 }}>
            Prévisualisation — Convention de mission de conseil
          </p>
          <p style={{ fontFamily: "Inter, monospace", fontSize: "10px", color: "#9CA3AF", margin: 0 }}>
            Composant MissionContract.tsx
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
        <MissionContract
          reference="FD-2026-83474"
          dateEmission={TODAY}
          porteur="Marc Lalan"
          nomProjet="Projet du Nord"
          territoire="France"
          porteurTerritoire="France"
          montantCible="150 000 €"
          dureeMois={12}
          honorairesTTC="456,00 € TTC"
          honorairesHT="380,00 € HT + TVA 20 %"
        />
      </div>
    </div>
  );
}
