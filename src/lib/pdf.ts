import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

export async function exportToPdf(
  element: HTMLElement,
  filename: string = "etiquette.pdf",
) {
  const clone = element.cloneNode(true) as HTMLElement;
  clone.style.transform = "none";
  clone.style.position = "absolute";
  clone.style.left = "-9999px";
  clone.style.top = "0px";
  document.body.appendChild(clone);

  try {
    const canvas = await html2canvas(clone, {
      scale: 3,
      useCORS: true,
      backgroundColor: "#ffffff",
    });

    const pdf = new jsPDF("p", "mm", "a4");
    const imgData = canvas.toDataURL("image/png");
    pdf.addImage(imgData, "PNG", 0, 0, 210, 297);
    pdf.save(filename);
  } finally {
    document.body.removeChild(clone);
  }
}
