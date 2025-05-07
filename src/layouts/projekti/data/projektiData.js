import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "firebaseConfig";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

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
        const { naziv, opis, vodja, datum, lokacija, ura, drugeInformacije, podrocje } =
          docSnap.data();
        return {
          id: docSnap.id,
          naziv,
          opis,
          vodja,
          datum,
          lokacija,
          ura,
          drugeInformacije,
          podrocje,
          action: (
            <>
              <IconButton onClick={() => onEdit({ id: docSnap.id, ...docSnap.data() })}>
                <EditIcon />
              </IconButton>
              <IconButton onClick={() => handleDelete(docSnap.id)}>
                <DeleteIcon />
              </IconButton>
            </>
          ),
        };
      });

      setData({
        columns: [
          { Header: "Naziv", accessor: "naziv", align: "left" },
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
