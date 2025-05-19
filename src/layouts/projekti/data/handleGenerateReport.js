import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { saveAs } from "file-saver";

const handleGenerateReport = async (project) => {
  try {
    const response = await fetch("/Projektno_porocilo.docx");
    const templateArrayBuffer = await response.arrayBuffer();

    const zip = new PizZip(templateArrayBuffer);
    const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

    doc.setData({
      stevilo: project.stevilo || "",
      naziv: project.naziv || "",
      datum: project.datum || "",
      vodja: project.vodja || "",
      lokacija: project.lokacija || "",
      ura: project.ura || "",
      opis: project.opis || "",
    });

    doc.render();
    const out = doc.getZip().generate({ type: "blob" });
    saveAs(out, `Projekt-${project.stevilo || "porocilo"}.docx`);
  } catch (error) {
    console.error("Document generation error", error);
  }
};

export default handleGenerateReport;
