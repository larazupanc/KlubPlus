import { useState, useEffect } from "react";
import { collection, getDocs, setDoc, doc, query, where } from "firebase/firestore";
import { db } from "firebaseConfig";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import Switch from "@mui/material/Switch";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

function Izplacila() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [vloge, setVloge] = useState([]);
  const [paymentStatus, setPaymentStatus] = useState({});

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();
  const monthName = currentDate.toLocaleString("default", { month: "long" });

  const fetchVloge = async () => {
    const snapshot = await getDocs(collection(db, "vloge"));
    const list = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setVloge(list);
  };

  const fetchPaymentStatus = async () => {
    const q = query(
      collection(db, "izplacila"),
      where("year", "==", year),
      where("month", "==", month)
    );
    const querySnapshot = await getDocs(q);
    const status = {};
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      status[data.vlogaId] = data.paid;
    });
    setPaymentStatus(status);
  };

  const handleToggle = async (vloga) => {
    const docId = `${vloga.id}_${year}_${month}`;
    const paid = !paymentStatus[vloga.id];

    await setDoc(doc(db, "izplacila", docId), {
      vlogaId: vloga.id,
      name: vloga.name,
      email: vloga.email,
      role: vloga.role,
      amount: paid ? vloga.amount : 0,
      paid,
      year,
      month,
      timestamp: new Date().toISOString(),
    });

    setPaymentStatus((prev) => ({ ...prev, [vloga.id]: paid }));
  };

  const changeMonth = (offset) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setCurrentDate(newDate);
  };

  useEffect(() => {
    fetchVloge();
  }, []);

  useEffect(() => {
    fetchPaymentStatus();
  }, [month, year]);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <MDBox display="flex" justifyContent="space-between" alignItems="center" p={2}>
                <IconButton onClick={() => changeMonth(-1)}>
                  <ArrowBackIcon />
                </IconButton>
                <MDTypography variant="h5">
                  Izplačila za {monthName} {year}
                </MDTypography>
                <IconButton onClick={() => changeMonth(1)}>
                  <ArrowForwardIcon />
                </IconButton>
              </MDBox>
              <MDBox px={3} pb={3}>
                <TableContainer component={Paper}>
                  <Table>
                    <TableBody>
                      {vloge.map((vloga) => (
                        <TableRow key={vloga.id}>
                          <TableCell>{vloga.name}</TableCell>
                          <TableCell>{vloga.role}</TableCell>
                          <TableCell>{vloga.amount}€</TableCell>
                          <TableCell>
                            <Switch
                              checked={paymentStatus[vloga.id] || false}
                              onChange={() => handleToggle(vloga)}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Izplacila;
