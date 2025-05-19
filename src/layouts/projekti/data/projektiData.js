import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "firebaseConfig";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";

import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { saveAs } from "file-saver";

const handleGenerateReport = async (project) => {
  try {
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
    saveAs(blob, `Projektno_porocilo_${project.stevilo || "neznano"}.docx`);
  } catch (err) {
    console.error("Napaka pri generiranju poročila:", err);
  }
};

export default function useProjektiData(refreshKey, onEdit) {
  const [data, setData] = useState({ columns: [], rows: [] });

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "projekti", id));
      setData((prev) => ({
        ...prev,
        rows: prev.rows.filter((row) => row.id !== id),
      }));
    } catch (err) {
      console.error("Error deleting project:", err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const querySnapshot = await getDocs(collection(db, "projekti"));
      const rows = querySnapshot.docs.map((docSnap) => {
        const project = docSnap.data();

        return {
          id: docSnap.id,
          ...project,
          action: (
            <>
              <IconButton onClick={() => onEdit({ id: docSnap.id, ...project })}>
                <EditIcon />
              </IconButton>
              <IconButton onClick={() => handleDelete(docSnap.id)}>
                <DeleteIcon />
              </IconButton>
              <IconButton onClick={() => handleGenerateReport({ id: docSnap.id, ...project })}>
                <DownloadIcon />
              </IconButton>
            </>
          ),
        };
      });

      setData({
        columns: [
          { Header: "Naziv", accessor: "naziv", align: "left" },
          { Header: "Število projekta", accessor: "stevilo", align: "left" },
          { Header: "Opis", accessor: "opis", align: "left" },
          { Header: "Vodja", accessor: "vodja", align: "left" },
          { Header: "Datum", accessor: "datum", align: "left" },
          { Header: "Lokacija", accessor: "lokacija", align: "left" },
          { Header: "Ura", accessor: "ura", align: "left" },
          { Header: "Druge info", accessor: "drugeInformacije", align: "left" },
          { Header: "Področje", accessor: "podrocje", align: "left" },
          { Header: "Več", accessor: "action", align: "center" },
        ],
        rows,
      });
    };

    fetchData();
  }, [refreshKey]);

  return data;
}
