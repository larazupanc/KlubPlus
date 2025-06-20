import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { saveAs } from "file-saver";
const handleGenerateReport = async (project) => {
  try {
    const { PizZip, Docxtemplater, saveAs } = await loadTemplateEngine();

    const response = await fetch("/Projektno_porocilo.docx");
    const arrayBuffer = await response.arrayBuffer();
    const zip = new PizZip(arrayBuffer);
    const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

    doc.setData({
      naziv: project.naziv || "",
      stevilo: project.stevilo || "",
      opis: project.opis || "",
      vodja: project.vodja || "",
      datum: project.datum || "",
      lokacija: project.lokacija || "",
      ura: project.ura || "",
      drugeInformacije: project.drugeInformacije || "",
      podrocje: project.podrocje || "",
    });

    doc.render();
    const blob = doc.getZip().generate({ type: "blob" });
    const fileName = `${project.stevilo || "neznano"}_projektni_plan_${
      project.naziv || "projekt"
    }.docx`;
    saveAs(blob, fileName);
  } catch (err) {
    console.error("Napaka pri generiranju poročila:", err);
  }
};
export default handleGenerateReport;
