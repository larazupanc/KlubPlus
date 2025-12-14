import { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "firebaseConfig";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import Card from "@mui/material/Card";
import IconButton from "@mui/material/IconButton";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

import MDTypography from "components/MDTypography";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";

import Switch from "@mui/material/Switch";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useNavigate } from "react-router-dom";

import DataTable from "examples/Tables/DataTable";

function Izplacila() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [placila, setPlacila] = useState([]);
  const [projekti, setProjekti] = useState([]);
  const navigate = useNavigate();
  const key = name.toLowerCase().trim();

  useEffect(() => {
    const fetchData = async () => {
      const placilaSnap = await getDocs(collection(db, "placila"));
      const projektiSnap = await getDocs(collection(db, "izplacani_projekti"));

      setPlacila(placilaSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setProjekti(projektiSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    fetchData();
  }, []);

  const monthId = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(
    2,
    "0"
  )}`;

  const currentPlacilaDoc = placila.find((doc) => doc.id.includes(monthId));
  const placilaInMonth = currentPlacilaDoc?.payments || [];

  const projektiInMonth = projekti.filter((item) => {
    if (!item.timestamp?.toDate) return false;
    const date = item.timestamp.toDate();
    return (
      date.getMonth() === currentMonth.getMonth() &&
      date.getFullYear() === currentMonth.getFullYear()
    );
  });
  const getAllPeopleCombined = () => {
    const peopleMap = new Map();

    placilaInMonth.forEach(({ name, email, amount, izplacano }) => {
      const key = name.toLowerCase().trim();

      if (!peopleMap.has(key)) {
        peopleMap.set(key, {
          name,
          email: email || "",
          placila: 0,
          projekti: 0,
          izplacano: false,
        });
      }

      const person = peopleMap.get(key);
      person.placila += amount || 0;
      person.izplacano = person.izplacano || izplacano;
    });

    // PROJEKTI
    projektiInMonth.forEach(({ vodja, vodjaEmail, znesekTRR }) => {
      const key = vodja.toLowerCase().trim();

      if (!peopleMap.has(key)) {
        peopleMap.set(key, {
          name: vodja,
          email: vodjaEmail || "",
          placila: 0,
          projekti: 0,
          izplacano: false,
        });
      }

      const person = peopleMap.get(key);
      person.projekti += znesekTRR || 0;
    });

    return Array.from(peopleMap.values());
  };

  const combinedPeople = getAllPeopleCombined();

  const toggleIzplacano = async (person) => {
    const index = placilaInMonth.findIndex(
      (p) => p.name === person.name && p.email === person.email
    );
    if (index === -1) return;

    placilaInMonth[index].izplacano = !placilaInMonth[index].izplacano;

    const docRef = doc(db, "placila", currentPlacilaDoc.id);
    await updateDoc(docRef, { payments: placilaInMonth });

    setPlacila((prev) =>
      prev.map((doc) =>
        doc.id === currentPlacilaDoc.id ? { ...doc, payments: [...placilaInMonth] } : doc
      )
    );
  };

  const downloadExcel = () => {
    const data = combinedPeople.map((person) => ({
      Ime: person.name,
      Email: person.email,
      "Iz honorarjev (€)": person.placila.toFixed(2),
      "Iz projektov (€)": person.projekti.toFixed(2),
      "Skupaj (€)": (person.placila + person.projekti).toFixed(2),
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Podatki");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });

    saveAs(blob, `Pregled_${monthId}.xlsx`);
  };

  const handlePrevMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentMonth(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentMonth(newDate);
  };

  const columns = [
    { Header: "Ime", accessor: "name" },
    { Header: "Iz honorarjev", accessor: "placila" },
    { Header: "Iz projektov", accessor: "projekti" },
    { Header: "Skupaj", accessor: "skupaj" },
    { Header: "Izplačano", accessor: "izplacano" },
  ];

  const rows = combinedPeople.map((person) => ({
    name: person.name,
    placila: `${person.placila.toFixed(2)} €`,
    projekti: `${person.projekti.toFixed(2)} €`,
    skupaj: `${(person.placila + person.projekti).toFixed(2)} €`,
    izplacano: (
      <Switch checked={person.izplacano} onChange={() => toggleIzplacano(person)} color="success" />
    ),
  }));

  const monthName = currentMonth.toLocaleString("default", { month: "long" });
  const year = currentMonth.getFullYear();

  return (
    <DashboardLayout>
      <DashboardNavbar />

      <MDBox py={3}>
        <Card sx={{ p: 3 }}>
          <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={4}>
            <IconButton onClick={handlePrevMonth}>
              <ArrowBackIosIcon />
            </IconButton>

            <MDTypography variant="h5">
              Skupni podatki za {monthName} {year}
            </MDTypography>

            <IconButton onClick={handleNextMonth}>
              <ArrowForwardIosIcon />
            </IconButton>
          </MDBox>

          <MDTypography variant="h6" mb={2}>
            Skupna plačila in projekti
          </MDTypography>

          <DataTable
            table={{ columns, rows }}
            isSorted={false}
            entriesPerPage={false}
            showTotalEntries={false}
            noEndBorder
          />

          <MDBox display="flex" justifyContent="space-between" mt={4}>
            <MDButton color="info" onClick={() => navigate("/podrobnosti")}>
              Poglej podrobnosti
            </MDButton>

            <MDButton color="success" onClick={downloadExcel}>
              Prenesi Excel
            </MDButton>
          </MDBox>
        </Card>
      </MDBox>

      <Footer />
    </DashboardLayout>
  );
}

export default Izplacila;
