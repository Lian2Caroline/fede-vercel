import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export async function exportElementAsPdf(element: HTMLElement, filename: string): Promise<void> {
  await document.fonts.ready;
  await new Promise(resolve => setTimeout(resolve, 200));

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: "#ffffff",
  });

  const A4_WIDTH_MM  = 210;
  const A4_HEIGHT_MM = 297;
  const canvasW = canvas.width;
  const canvasH = canvas.height;

  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const a4HeightPx = Math.round(canvasW * (A4_HEIGHT_MM / A4_WIDTH_MM));

  // If content is only slightly over one page (≤ 8% overflow), scale to fit one page.
  const ONE_PAGE_TOLERANCE = 1.08;
  const pageCount = canvasH / a4HeightPx;

  if (pageCount <= ONE_PAGE_TOLERANCE) {
    // Scale entire canvas to fit exactly one A4 page
    const imgDataUrl = canvas.toDataURL("image/jpeg", 0.96);
    const renderedHeightMm = (canvasH / canvasW) * A4_WIDTH_MM;
    const scale = Math.min(1, A4_HEIGHT_MM / renderedHeightMm);
    const finalW = A4_WIDTH_MM * scale;
    const finalH = renderedHeightMm * scale;
    pdf.addImage(imgDataUrl, "JPEG", 0, 0, finalW, finalH);
  } else {
    // Multi-page: slice canvas into A4-sized pages
    const numPages = Math.ceil(pageCount);
    for (let i = 0; i < numPages; i++) {
      if (i > 0) pdf.addPage();

      const srcY = i * a4HeightPx;
      const srcH = Math.min(a4HeightPx, canvasH - srcY);

      const slice = document.createElement("canvas");
      slice.width = canvasW;
      slice.height = srcH;
      const ctx = slice.getContext("2d")!;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvasW, srcH);
      ctx.drawImage(canvas, 0, srcY, canvasW, srcH, 0, 0, canvasW, srcH);

      const sliceHeightMm = (srcH / canvasW) * A4_WIDTH_MM;
      pdf.addImage(slice.toDataURL("image/jpeg", 0.96), "JPEG", 0, 0, A4_WIDTH_MM, sliceHeightMm);
    }
  }

  pdf.save(filename);
}
