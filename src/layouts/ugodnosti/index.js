import { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc, addDoc } from "firebase/firestore";
import { db } from "firebaseConfig";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

import Card from "@mui/material/Card";
import IconButton from "@mui/material/IconButton";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import Switch from "@mui/material/Switch";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";

import MDTypography from "components/MDTypography";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";

import DataTable from "examples/Tables/DataTable";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useNavigate } from "react-router-dom";

function Ugodnosti() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [placila, setPlacila] = useState([]);
  const [projekti, setProjekti] = useState([]);
  const navigate = useNavigate();

  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const [porabaZnesek, setPorabaZnesek] = useState("");
  const [porabaRazlog, setPorabaRazlog] = useState("");

  const [historyItems, setHistoryItems] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const placilaSnap = await getDocs(collection(db, "ugodnosti"));
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

    placilaInMonth.forEach(({ name, amount, ugodnost }) => {
      const key = name.toLowerCase().trim();
      if (!peopleMap.has(key))
        peopleMap.set(key, {
          name,
          email: "",
          placila: 0,
          projekti: 0,
          ugodnost: false,
        });

      const person = peopleMap.get(key);
      const parsedAmount = parseFloat(amount) || 0;

      person.placila += parsedAmount;
      person.ugodnost = ugodnost || person.ugodnost;
    });

    projektiInMonth.forEach(({ vodja, znesekTRR }) => {
      const key = vodja.toLowerCase().trim();

      if (!peopleMap.has(key))
        peopleMap.set(key, {
          name: vodja,
          email: "",
          placila: 0,
          projekti: 0,
          ugodnost: false,
        });

      const person = peopleMap.get(key);
      const parsedZnesek = parseFloat(znesekTRR) || 0;

      person.projekti += parsedZnesek;
    });

    return Array.from(peopleMap.values());
  };

  const combinedPeople = getAllPeopleCombined();

  const toggleUgodnost = async (person) => {
    const index = placilaInMonth.findIndex(
      (p) => p.name === person.name && p.email === person.email
    );
    if (index === -1) return;

    placilaInMonth[index].ugodnost = !placilaInMonth[index].ugodnost;

    const docRef = doc(db, "ugodnosti", currentPlacilaDoc.id);
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

    saveAs(blob, `Pregled_ugodnosti_${monthId}.xlsx`);
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

  const openPorabaModal = (user) => {
    setSelectedUser(user);
    setPorabaZnesek("");
    setPorabaRazlog("");
    setShowModal(true);
  };
  const handlePoraba = async () => {
    if (!porabaZnesek || isNaN(porabaZnesek)) return alert("Vnesi veljaven znesek.");

    const znesek = parseFloat(porabaZnesek);

    await addDoc(collection(db, "ugodnosti_zgodovina"), {
      name: selectedUser.name,
      email: selectedUser.email,
      znesek,
      razlog: porabaRazlog,
      timestamp: new Date(),
    });

    const docWithUser = placila.find((docItem) =>
      docItem.payments?.some((p) => p.name === selectedUser.name)
    );

    if (!docWithUser) {
      alert("Uporabnik nima ugodnosti.");
      return;
    }

    const updatedPayments = docWithUser.payments.map((p) => {
      if (p.name === selectedUser.name) {
        return {
          ...p,
          amount: Math.max(0, p.amount - znesek),
        };
      }
      return p;
    });

    const docRef = doc(db, "ugodnosti", docWithUser.id);
    await updateDoc(docRef, { payments: updatedPayments });

    setPlacila((prev) =>
      prev.map((d) => (d.id === docWithUser.id ? { ...d, payments: updatedPayments } : d))
    );

    setShowModal(false);
  };

  const openHistory = async (user) => {
    setSelectedUser(user);

    const qSnap = await getDocs(collection(db, "ugodnosti_zgodovina"));

    const items = qSnap.docs.map((d) => d.data()).filter((x) => x.email === user.email);

    setHistoryItems(items);
    setShowHistory(true);
  };

  const columns = [
    { Header: "Ime", accessor: "name" },
    { Header: "Iz honorarjev", accessor: "placila" },
    { Header: "Iz projektov", accessor: "projekti" },
    { Header: "Skupaj", accessor: "skupaj" },
  ];

  const rows = combinedPeople.map((person) => ({
    name: person.name,
    email: person.email,
    placila: `${person.placila.toFixed(2)} €`,
    projekti: `${person.projekti.toFixed(2)} €`,
    skupaj: `${(person.placila + person.projekti).toFixed(2)} €`,
    ugodnost: (
      <Switch checked={person.ugodnost} onChange={() => toggleUgodnost(person)} color="success" />
    ),
  }));

  const totalUgodnosti = placila.reduce((acc, doc) => {
    doc.payments.forEach(({ name, email, amount }) => {
      const key = `${name}|||${email}`;
      if (!acc[key]) acc[key] = { name, email, total: 0 };
      acc[key].total += amount;
    });
    return acc;
  }, {});

  const rowsTotal = Object.values(totalUgodnosti).map((person) => ({
    name: person.name,
    email: person.email,
    total: `${person.total.toFixed(2)} €`,
    porabi: (
      <MDButton color="error" size="small" onClick={() => openPorabaModal(person)}>
        Porabi
      </MDButton>
    ),
    zgodovina: (
      <MDButton color="info" size="small" onClick={() => openHistory(person)}>
        Zgodovina
      </MDButton>
    ),
  }));

  const columnsTotal = [
    { Header: "Ime", accessor: "name" },
    { Header: "Email", accessor: "email" },
    { Header: "Skupaj ugodnosti (€)", accessor: "total" },
    { Header: "Porabi", accessor: "porabi" },
    { Header: "Zgodovina", accessor: "zgodovina" },
  ];

  const monthName = currentMonth.toLocaleString("default", { month: "long" });

  return (
    <DashboardLayout>
      <DashboardNavbar />

      <Dialog open={showModal} onClose={() => setShowModal(false)}>
        <DialogTitle>Porabi ugodnosti – {selectedUser?.name}</DialogTitle>

        <DialogContent>
          <TextField
            fullWidth
            type="number"
            label="Znesek"
            value={porabaZnesek}
            onChange={(e) => setPorabaZnesek(e.target.value)}
            sx={{ mt: 1 }}
          />

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Razlog"
            value={porabaRazlog}
            onChange={(e) => setPorabaRazlog(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>

        <DialogActions>
          <MDButton color="secondary" onClick={() => setShowModal(false)}>
            Zapri
          </MDButton>
          <MDButton color="success" onClick={handlePoraba}>
            Shrani
          </MDButton>
        </DialogActions>
      </Dialog>

      <Dialog open={showHistory} onClose={() => setShowHistory(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Zgodovina porab – {selectedUser?.name}</DialogTitle>

        <DialogContent>
          {historyItems.length === 0 ? (
            <MDTypography>Ni zabeleženih porab.</MDTypography>
          ) : (
            historyItems.map((h, i) => (
              <Card key={i} sx={{ p: 2, mb: 2, background: "#f9f9f9" }}>
                <MDTypography>
                  <b>Znesek:</b> {h.znesek} €
                </MDTypography>
                <MDTypography>
                  <b>Razlog:</b> {h.razlog}
                </MDTypography>
                <MDTypography>
                  <b>Datum:</b> {new Date(h.timestamp.seconds * 1000).toLocaleString()}
                </MDTypography>
              </Card>
            ))
          )}
        </DialogContent>

        <DialogActions>
          <MDButton color="secondary" onClick={() => setShowHistory(false)}>
            Zapri
          </MDButton>
        </DialogActions>
      </Dialog>

      <MDBox py={3}>
        <Card sx={{ p: 3 }}>
          <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={4}>
            <IconButton onClick={handlePrevMonth}>
              <ArrowBackIosIcon />
            </IconButton>

            <MDTypography variant="h5">
              Skupne ugodnosti za {monthName} {currentMonth.getFullYear()}
            </MDTypography>

            <IconButton onClick={handleNextMonth}>
              <ArrowForwardIosIcon />
            </IconButton>
          </MDBox>

          <MDTypography variant="h6" mb={2}>
            Skupne ugodnosti iz honorarjev in projektov
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

          <MDBox mt={5}>
            <MDTypography variant="h6" mb={2}>
              Skupna vsota vseh ugodnosti vseh uporabnikov
            </MDTypography>

            <DataTable
              table={{ columns: columnsTotal, rows: rowsTotal }}
              isSorted={false}
              entriesPerPage={false}
              showTotalEntries={false}
              noEndBorder
            />
          </MDBox>
        </Card>
      </MDBox>

      <Footer />
    </DashboardLayout>
  );
}

export default Ugodnosti;
