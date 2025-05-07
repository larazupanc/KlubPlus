import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "firebaseConfig";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export default function useSestankiData(refreshKey, onEdit) {
  const [data, setData] = useState({ columns: [], rows: [] });

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "sestanki", id));
      setData((prev) => ({
        ...prev,
        rows: prev.rows.filter((row) => row.id !== id),
      }));
    } catch (err) {
      console.error("Error deleting:", err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const querySnapshot = await getDocs(collection(db, "sestanki"));
      const rows = querySnapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        const meeting = {
          id: docSnap.id,
          ...data,
        };

        return {
          ...meeting,
          action: (
            <>
              <IconButton onClick={() => onEdit(meeting)}>
                <EditIcon />
              </IconButton>
              <IconButton onClick={() => handleDelete(meeting.id)}>
                <DeleteIcon />
              </IconButton>
            </>
          ),
        };
      });

      setData({
        columns: [
          { Header: "naziv", accessor: "title", align: "left" },
          { Header: "vodja", accessor: "leader", align: "left" },
          { Header: "opis", accessor: "caption", align: "left" },
          { Header: "lokacija", accessor: "place", align: "left" },
          { Header: "datum", accessor: "date", align: "left" },
          { Header: "ura", accessor: "startTime", align: "left" },
          { Header: "več", accessor: "action", align: "center" },
        ],
        rows,
      });
    };

    fetchData();
  }, [refreshKey]);

  return data;
}
