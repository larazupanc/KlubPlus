import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "firebaseConfig";

import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import PaidIcon from "@mui/icons-material/Paid";

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
    const fileName = `${project.stevilo || "neznano"}_projektni_plan_${
      project.naziv || "porocilo"
    }.docx`;
    saveAs(blob, fileName);
  } catch (err) {
    console.error("Napaka pri generiranju poročila:", err);
  }
};

const handleGeneratePlan = async (project) => {
  try {
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

export default function useProjektiData(
  refreshKey,
  onEdit,
  openPayDialog,
  filterYear = "",
  filterMonth = "",
  filterPodrocje = "",
  filterVodja = ""
) {
  const [data, setData] = useState({ columns: [], rows: [], filters: {} });

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "projekti", id));
      setData((prev) => ({
        ...prev,
        rows: prev.rows.filter((row) => row.id !== id),
      }));
    } catch (err) {
      console.error("Napaka pri brisanju projekta:", err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const querySnapshot = await getDocs(collection(db, "projekti"));

      const rawRows = querySnapshot.docs.map((docSnap) => {
        const project = docSnap.data();

        return {
          id: docSnap.id,
          ...project,
        };
      });

      const yearsSet = new Set();
      const monthsSet = new Set();
      const podrocjaSet = new Set();
      const vodjeSet = new Set();

      rawRows.forEach((row) => {
        const datum = row.datum || "";
        const parts = String(datum).split("-");
        if (parts.length >= 3) {
          const [y, m] = parts;
          if (y) yearsSet.add(y);
          if (m) monthsSet.add(m);
        }
        if (row.podrocje) podrocjaSet.add(row.podrocje);
        if (row.vodja) vodjeSet.add(row.vodja);
      });

      const months = Array.from(monthsSet)
        .sort()
        .map((m) => {
          const labels = {
            "01": "Januar",
            "02": "Februar",
            "03": "Marec",
            "04": "April",
            "05": "Maj",
            "06": "Junij",
            "07": "Julij",
            "08": "Avgust",
            "09": "September",
            10: "Oktober",
            11: "November",
            12: "December",
          };
          return { value: m, label: labels[m] || m };
        });

      const years = Array.from(yearsSet).sort();
      const podrocja = Array.from(podrocjaSet).sort();
      const vodje = Array.from(vodjeSet).sort();

      let rows = rawRows.map((row) => {
        return {
          ...row,
          action: (
            <>
              <IconButton onClick={() => onEdit({ id: row.id, ...row })} title="Uredi">
                <EditIcon />
              </IconButton>
              <IconButton onClick={() => handleDelete(row.id)} title="Izbriši">
                <DeleteIcon />
              </IconButton>
              <IconButton
                onClick={() => handleGeneratePlan({ id: row.id, ...row })}
                title="Prenesi načrt"
              >
                <DownloadIcon />
              </IconButton>
              <IconButton
                onClick={() => handleGenerateReport({ id: row.id, ...row })}
                title="Prenesi poročilo"
              >
                <DownloadIcon />
              </IconButton>
              <IconButton
                onClick={() => openPayDialog({ id: row.id, ...row })}
                title="Odpri plačilni dialog"
              >
                <PaidIcon />
              </IconButton>
            </>
          ),
        };
      });

      if (filterYear || filterMonth || filterPodrocje || filterVodja) {
        rows = rows.filter((row) => {
          const datum = row.datum || "";
          let year = "";
          let month = "";

          const parts = String(datum).split("-");
          if (parts.length >= 3) {
            year = parts[0];
            month = parts[1];
          }

          if (filterYear && year !== filterYear) return false;
          if (filterMonth && month !== filterMonth) return false;
          if (filterPodrocje && row.podrocje !== filterPodrocje) return false;
          if (filterVodja && row.vodja !== filterVodja) return false;

          return true;
        });
      }

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
          { Header: "Več", accessor: "action", align: "center", disableSortBy: true },
        ],
        rows,
        filters: {
          years,
          months,
          podrocja,
          vodje,
        },
      });
    };

    fetchData();
  }, [refreshKey, onEdit, openPayDialog, filterYear, filterMonth, filterPodrocje, filterVodja]);

  return data;
}
