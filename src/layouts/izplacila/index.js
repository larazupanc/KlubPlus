import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
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

function Izplacila() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [placila, setPlacila] = useState([]);
  const [projekti, setProjekti] = useState([]);

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

    placilaInMonth.forEach(({ name, email, amount }) => {
      const key = `${name}|||${email}`;
      if (!peopleMap.has(key)) peopleMap.set(key, { name, email, placila: 0, projekti: 0 });
      peopleMap.get(key).placila += amount;
    });

    projektiInMonth.forEach(({ vodja, vodjaEmail, znesekTRR }) => {
      const key = `${vodja}|||${vodjaEmail}`;
      if (!peopleMap.has(key))
        peopleMap.set(key, { name: vodja, email: vodjaEmail, placila: 0, projekti: 0 });
      peopleMap.get(key).projekti += znesekTRR;
    });

    return Array.from(peopleMap.values());
  };

  const combinedPeople = getAllPeopleCombined();
  const monthName = currentMonth.toLocaleString("default", { month: "long" });
  const year = currentMonth.getFullYear();

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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Izplacila;
