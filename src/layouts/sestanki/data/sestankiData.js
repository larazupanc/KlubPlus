import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "firebaseConfig";

import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export default function useSestankiData(refreshKey, onEdit, activeFilters = {}) {
  const [data, setData] = useState({ columns: [], rows: [], filters: {} });

  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedMeeting, setSelectedMeeting] = useState(null);

  const openMenu = Boolean(menuAnchor);

  const handleMenuOpen = (event, meeting) => {
    setMenuAnchor(event.currentTarget);
    setSelectedMeeting(meeting);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedMeeting(null);
  };

  const handleDelete = async () => {
    if (!selectedMeeting) return;
    try {
      await deleteDoc(doc(db, "sestanki", selectedMeeting.id));
      setData((prev) => ({
        ...prev,
        rows: prev.rows.filter((row) => row.id !== selectedMeeting.id),
      }));
    } catch (err) {
      console.error("Error deleting:", err);
    } finally {
      handleMenuClose();
    }
  };

  const handleEdit = () => {
    if (selectedMeeting) {
      onEdit(selectedMeeting);
    }
    handleMenuClose();
  };

  useEffect(() => {
    const fetchData = async () => {
      const querySnapshot = await getDocs(collection(db, "sestanki"));
      const raw = querySnapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

      const yearsSet = new Set();
      const monthsSet = new Set();
      const leadersSet = new Set();
      const placesSet = new Set();
      const titlesSet = new Set();

      raw.forEach((r) => {
        const date = r.date || "";
        const parts = String(date).split("-");
        if (parts.length >= 3) {
          const [y, m] = parts;
          if (y) yearsSet.add(y);
          if (m) monthsSet.add(m);
        }
        if (r.leader) leadersSet.add(r.leader);
        if (r.place) placesSet.add(r.place);
        if (r.title) titlesSet.add(r.title);
      });

      const years = Array.from(yearsSet).sort();
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

      const leaders = Array.from(leadersSet).sort();
      const places = Array.from(placesSet).sort();
      const titles = Array.from(titlesSet).sort();

      let rows = raw.map((r) => {
        const meeting = { ...r };
        return {
          ...meeting,
          action: (
            <IconButton onClick={(e) => handleMenuOpen(e, meeting)} size="small">
              <MoreVertIcon />
            </IconButton>
          ),
        };
      });

      const {
        filterYear = "",
        filterMonth = "",
        filterLeader = "",
        filterPlace = "",
        filterTitle = "",
      } = activeFilters || {};

      if (filterYear || filterMonth || filterLeader || filterPlace || filterTitle) {
        rows = rows.filter((row) => {
          const date = row.date || "";
          let year = "";
          let month = "";
          const parts = String(date).split("-");
          if (parts.length >= 3) {
            year = parts[0];
            month = parts[1];
          }

          if (filterYear && year !== filterYear) return false;
          if (filterMonth && month !== filterMonth) return false;
          if (filterLeader && row.leader !== filterLeader) return false;
          if (filterPlace && row.place !== filterPlace) return false;
          if (filterTitle && row.title !== filterTitle) return false;

          return true;
        });
      }

      setData({
        columns: [
          { Header: "Naziv", accessor: "title", align: "left" },
          { Header: "Vodja", accessor: "leader", align: "left" },
          { Header: "Opis", accessor: "caption", align: "left" },
          { Header: "Lokacija", accessor: "place", align: "left" },
          { Header: "Datum", accessor: "date", align: "left" },
          { Header: "Ura", accessor: "startTime", align: "left" },
          { Header: "Več", accessor: "action", align: "center", disableSortBy: true },
        ],
        rows,
        filters: { years, months, leaders, places, titles },
      });
    };

    fetchData();
  }, [
    refreshKey,
    activeFilters.filterYear,
    activeFilters.filterMonth,
    activeFilters.filterLeader,
    activeFilters.filterPlace,
    activeFilters.filterTitle,
  ]);

  return {
    ...data,
    actionsMenu: (
      <Menu
        anchorEl={menuAnchor}
        open={openMenu}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem onClick={handleEdit}>
          <EditIcon fontSize="small" style={{ marginRight: 8 }} />
          Uredi
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <DeleteIcon fontSize="small" style={{ marginRight: 8 }} />
          Izbriši
        </MenuItem>
      </Menu>
    ),
  };
}
