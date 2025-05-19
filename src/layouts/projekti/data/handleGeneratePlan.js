import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { saveAs } from "file-saver";
const handleGeneratePlan = async (project) => {
  try {
    const { PizZip, Docxtemplater, saveAs } = await loadTemplateEngine();

    const response = await fetch("/Projektni_nacrt.docx");
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
    const fileName = `${project.stevilo || "neznano"}_Projektni_nacrt_${
      project.naziv || "nacrt"
    }.docx`;
    saveAs(blob, fileName);
  } catch (err) {
    console.error("Napaka pri generiranju načrta:", err);
  }
};
export default handleGeneratePlan;
