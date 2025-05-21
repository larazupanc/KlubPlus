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
import MDTypography from "components/MDTypography";
import MDBox from "components/MDBox";

function PodrobnostiPlacil() {
  const [monthlyPayments, setMonthlyPayments] = useState([]);
  const [allPeople, setAllPeople] = useState([]);

  useEffect(() => {
    const fetchPlacila = async () => {
      const snapshot = await getDocs(collection(db, "placila"));
      const docs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const sortedDocs = docs.sort((a, b) => (a.id > b.id ? 1 : -1));
      setMonthlyPayments(sortedDocs);

      const peopleSet = new Set();
      docs.forEach((doc) => {
        doc.payments.forEach((p) => {
          peopleSet.add(`${p.name}|||${p.email}`);
        });
      });

      const peopleList = Array.from(peopleSet).map((entry) => {
        const [name, email] = entry.split("|||");
        return { name, email };
      });

      setAllPeople(peopleList);
    };

    fetchPlacila();
  }, []);

  const getAmountFor = (person, monthId) => {
    const monthData = monthlyPayments.find((m) => m.id === monthId);
    if (!monthData) return "";
    const payment = monthData.payments.find(
      (p) => p.name === person.name && p.email === person.email
    );
    return payment ? `${payment.amount}€` : "-";
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <Card sx={{ p: 3 }}>
          <MDTypography variant="h5" gutterBottom>
            Podrobnosti plačil po mesecih
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
                  {monthlyPayments.map((m) => (
                    <TableCell key={m.id}>
                      {m.month} {m.year}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {allPeople.map((person) => (
                  <TableRow key={person.email}>
                    <TableCell>{person.name}</TableCell>
                    <TableCell>{person.email}</TableCell>
                    {monthlyPayments.map((m) => (
                      <TableCell key={m.id}>{getAmountFor(person, m.id)}</TableCell>
                    ))}
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

export default PodrobnostiPlacil;
