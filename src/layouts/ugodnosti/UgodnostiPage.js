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
import UgodnostiPodrobnostiPage from "./UgodnostiPodrobnostiPage";

function UgodnostiPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [ugodnosti, setUgodnosti] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const ugodnostiSnap = await getDocs(collection(db, "ugodnosti"));
      setUgodnosti(ugodnostiSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    fetchData();
  }, []);

  const monthId = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(
    2,
    "0"
  )}`;
  const currentUgodnostiDoc = ugodnosti.find((doc) => doc.id.includes(monthId));
  const ugodnostiInMonth = currentUgodnostiDoc?.benefits || [];

  const getAllPeople = () => {
    const peopleMap = new Map();
    ugodnostiInMonth.forEach(({ name, email, amount, izplacano }) => {
      const key = `${name}|||${email}`;
      if (!peopleMap.has(key))
        peopleMap.set(key, { name, email, amount, izplacano: izplacano || false });
    });
    return Array.from(peopleMap.values());
  };

  const people = getAllPeople();

  const toggleIzplacano = async (person) => {
    const benefitIndex = ugodnostiInMonth.findIndex(
      (b) => b.name === person.name && b.email === person.email
    );
    if (benefitIndex === -1) return;

    ugodnostiInMonth[benefitIndex].izplacano = !ugodnostiInMonth[benefitIndex].izplacano;

    const docRef = doc(db, "ugodnosti", currentUgodnostiDoc.id);
    await updateDoc(docRef, {
      benefits: ugodnostiInMonth,
    });

    setUgodnosti((prev) =>
      prev.map((doc) =>
        doc.id === currentUgodnostiDoc.id ? { ...doc, benefits: [...ugodnostiInMonth] } : doc
      )
    );
  };

  const downloadExcel = () => {
    const data = people.map((person) => ({
      Ime: person.name,
      Email: person.email,
      "Znesek (€)": person.amount.toFixed(2),
      Izplačano: person.izplacano ? "Da" : "Ne",
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Ugodnosti");

    const monthIdFormatted = `${currentMonth.getFullYear()}-${String(
      currentMonth.getMonth() + 1
    ).padStart(2, "0")}`;
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });

    saveAs(blob, `Ugodnosti_${monthIdFormatted}.xlsx`);
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
              Ugodnosti za {monthName} {year}
            </MDTypography>
            <IconButton onClick={handleNextMonth}>
              <ArrowForwardIosIcon />
            </IconButton>
          </MDBox>

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
                    <strong>Znesek</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Izplačano</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {people.map((person) => (
                  <TableRow key={person.email}>
                    <TableCell>{person.name}</TableCell>
                    <TableCell>{person.email}</TableCell>
                    <TableCell>{person.amount.toFixed(2)} €</TableCell>
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
            <MDButton color="info" onClick={() => navigate("/ugodnosti/podrobnosti")}>
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

export default UgodnostiPage;
