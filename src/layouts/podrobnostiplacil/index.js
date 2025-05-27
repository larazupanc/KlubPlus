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

function PlacilaInProjektiPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [placila, setPlacila] = useState([]);
  const [projekti, setProjekti] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const placilaSnap = await getDocs(collection(db, "placila"));
      const projektiSnap = await getDocs(collection(db, "izplacani_projekti"));

      const placilaData = placilaSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      const projektiData = projektiSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setPlacila(placilaData);
      setProjekti(projektiData);
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

  const getAllPeople = (payments) => {
    const peopleSet = new Set();
    payments.forEach((p) => {
      peopleSet.add(`${p.name}|||${p.email}`);
    });
    return Array.from(peopleSet).map((entry) => {
      const [name, email] = entry.split("|||");
      return { name, email };
    });
  };

  const getAmountFor = (person, payments) => {
    const payment = payments.find((p) => p.name === person.name && p.email === person.email);
    return payment ? `${payment.amount}€` : "-";
  };

  const people = getAllPeople(placilaInMonth);
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
              Podatki za {monthName} {year}
            </MDTypography>
            <IconButton onClick={handleNextMonth}>
              <ArrowForwardIosIcon />
            </IconButton>
          </MDBox>

          {}
          <MDTypography variant="h6" mb={1}>
            Plačila iz mesečnih honorarjev
          </MDTypography>
          <TableContainer component={Paper} sx={{ mb: 5 }}>
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
                </TableRow>
              </TableHead>
              <TableBody>
                {people.map((person) => (
                  <TableRow key={person.email}>
                    <TableCell>{person.name}</TableCell>
                    <TableCell>{person.email}</TableCell>
                    <TableCell>{getAmountFor(person, placilaInMonth)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {}
          <MDTypography variant="h6" mb={1}>
            Izplačani projekti
          </MDTypography>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>
                    <strong>Naziv</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Vodja</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Metoda</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Znesek TRR</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {projektiInMonth.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.naziv}</TableCell>
                    <TableCell>{item.vodja}</TableCell>
                    <TableCell>{item.metoda}</TableCell>
                    <TableCell>{item.znesekTRR} €</TableCell>
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

export default PlacilaInProjektiPage;
