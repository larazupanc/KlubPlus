import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
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

import DataTable from "examples/Tables/DataTable";

function PlacilaInProjektiPage() {
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
    return payment ? `${payment.amount} €` : "-";
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

  const columnsPlacila = [
    { Header: "Ime", accessor: "name" },
    { Header: "Email", accessor: "email" },
    { Header: "Znesek", accessor: "amount" },
  ];

  const rowsPlacila = people.map((person) => ({
    name: person.name,
    email: person.email,
    amount: getAmountFor(person, placilaInMonth),
  }));

  const columnsProjekti = [
    { Header: "Naziv", accessor: "naziv" },
    { Header: "Vodja", accessor: "vodja" },
    { Header: "Način", accessor: "metoda" },
    { Header: "Znesek TRR", accessor: "znesek" },
  ];

  const rowsProjekti = projektiInMonth.map((item) => ({
    naziv: item.naziv,
    vodja: item.vodja,
    metoda: item.metoda,
    znesek: `${item.znesekTRR} €`,
  }));

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

          <MDTypography variant="h6" mb={2}>
            Plačila iz mesečnih honorarjev
          </MDTypography>

          <DataTable
            table={{ columns: columnsPlacila, rows: rowsPlacila }}
            isSorted={false}
            entriesPerPage={false}
            showTotalEntries={false}
            noEndBorder
          />

          <MDTypography variant="h6" mt={5} mb={2}>
            Izplačani projekti
          </MDTypography>

          <DataTable
            table={{ columns: columnsProjekti, rows: rowsProjekti }}
            isSorted={false}
            entriesPerPage={false}
            showTotalEntries={false}
            noEndBorder
          />
        </Card>
      </MDBox>

      <Footer />
    </DashboardLayout>
  );
}

export default PlacilaInProjektiPage;
