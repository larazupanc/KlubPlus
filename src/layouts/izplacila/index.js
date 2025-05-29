import { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "firebaseConfig";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import Card from "@mui/material/Card";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
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

function Izplacila() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [placila, setPlacila] = useState([]);
  const [projekti, setProjekti] = useState([]);
  const navigate = useNavigate();

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
      const key = `${name}|||${email}`;
      if (!peopleMap.has(key))
        peopleMap.set(key, { name, email, placila: 0, projekti: 0, izplacano: false });
      const person = peopleMap.get(key);
      person.placila += amount;
      person.izplacano = izplacano || false;
    });

    projektiInMonth.forEach(({ vodja, vodjaEmail, znesekTRR }) => {
      const key = `${vodja}|||${vodjaEmail}`;
      if (!peopleMap.has(key))
        peopleMap.set(key, {
          name: vodja,
          email: vodjaEmail,
          placila: 0,
          projekti: 0,
          izplacano: false,
        });
      peopleMap.get(key).projekti += znesekTRR;
    });

    return Array.from(peopleMap.values());
  };

  const combinedPeople = getAllPeopleCombined();

  const toggleIzplacano = async (person) => {
    const paymentIndex = placilaInMonth.findIndex(
      (p) => p.name === person.name && p.email === person.email
    );
    if (paymentIndex === -1) return;

    placilaInMonth[paymentIndex].izplacano = !placilaInMonth[paymentIndex].izplacano;

    const docRef = doc(db, "placila", currentPlacilaDoc.id);
    await updateDoc(docRef, {
      payments: placilaInMonth,
    });

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

    const monthIdFormatted = `${currentMonth.getFullYear()}-${String(
      currentMonth.getMonth() + 1
    ).padStart(2, "0")}`;
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });

    saveAs(blob, `Pregled_${monthIdFormatted}.xlsx`);
  };

  const handlePrevMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(currentMonth.getMonth() - 1);
    setCurrentMonth(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(currentMonth.getMonth() + 1);
    setCurrentMonth(newDate);
  };

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

          <MDTypography variant="h6" mb={1}>
            Skupna plačila in projekti
          </MDTypography>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>
                    <strong>Ime</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Email</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Iz honorarjev</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Iz projektov</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Skupaj</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Izplačano</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {combinedPeople.map((person) => (
                  <TableRow key={person.email}>
                    <TableCell>{person.name}</TableCell>
                    <TableCell>{person.email}</TableCell>
                    <TableCell>{person.placila.toFixed(2)} €</TableCell>
                    <TableCell>{person.projekti.toFixed(2)} €</TableCell>
                    <TableCell>{(person.placila + person.projekti).toFixed(2)} €</TableCell>
                    <TableCell>
                      <Switch
                        checked={person.izplacano}
                        onChange={() => toggleIzplacano(person)}
                        color="success"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

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
