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

function UgodnostiPodrobnostiPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [izplacaniData, setIzplacaniData] = useState([]);

  useEffect(() => {
    const fetchIzplacani = async () => {
      const snapshot = await getDocs(collection(db, "izplacani"));
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setIzplacaniData(data);
    };
    fetchIzplacani();
  }, []);

  const monthId = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(
    2,
    "0"
  )}`;
  const filteredByMonth = izplacaniData.filter((doc) => doc.id.includes(monthId));

  const ugodnostiList = [];

  filteredByMonth.forEach((doc) => {
    const projekti = doc.projekti || [];
    projekti.forEach((proj) => {
      if (proj.znesekUgodnosti) {
        ugodnostiList.push({
          ime: doc.ime || "-",
          email: doc.email || "-",
          projekt: proj.naziv || "-",
          znesekUgodnosti: proj.znesekUgodnosti || 0,
        });
      }
    });
  });

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
              Podrobnosti ugodnosti za {monthName} {year}
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
                    <strong>Projekt</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Znesek ugodnosti (€)</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ugodnostiList.map((entry, index) => (
                  <TableRow key={index}>
                    <TableCell>{entry.ime}</TableCell>
                    <TableCell>{entry.email}</TableCell>
                    <TableCell>{entry.projekt}</TableCell>
                    <TableCell>{entry.znesekUgodnosti}</TableCell>
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

export default UgodnostiPodrobnostiPage;
