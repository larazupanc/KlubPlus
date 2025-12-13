import { useState } from "react";
import {
  Grid,
  Card,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  Typography,
  Box,
  Button,
  TextField,
} from "@mui/material";
import { Fullscreen as FullscreenIcon, Close as CloseIcon } from "@mui/icons-material";
import { getDoc, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "firebaseConfig";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";
import { useNavigate } from "react-router-dom";

import useProjektiData from "./data/projektiData";
import ProjektiForm from "./components/ProjektiForm";

export default function Projekti() {
  const backgroundStyle = {
    backgroundImage:
      'url("https://drustvo-lak.si/wp-content/uploads/2024/07/3AD585E4-A62F-4ECE-B342-6C748F65EB6E-1-scaled.jpeg")',
    backgroundSize: "cover",
    backgroundPosition: "center",
    minHeight: "100vh",
    width: "100%",
    position: "fixed",
    opacity: 0.2,
    top: 0,
    left: 0,
    zIndex: -1,
  };

  const [refreshKey, setRefreshKey] = useState(0);
  const [editingProject, setEditingProject] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [payMethod, setPayMethod] = useState("pribitekNaUdelezbo");
  const [payDialogOpen, setPayDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [osnova, setOsnova] = useState(0);
  const [pribitekNaUdelezbo, setPribitekNaUdelezbo] = useState([]);
  const [urniPribitek, setUrniPribitek] = useState([]);
  const [selectedPribitekUdelezba, setSelectedPribitekUdelezba] = useState(null);
  const [selectedUrniPribitek, setSelectedUrniPribitek] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterPodrocje, setFilterPodrocje] = useState("");
  const [filterVodja, setFilterVodja] = useState("");

  const navigate = useNavigate();

  const fetchConstants = async () => {
    const konstDoc = await getDoc(doc(db, "nastavitve", "konstante"));
    if (!konstDoc.exists()) return;
    const data = konstDoc.data();
    setOsnova(data.osnova || 0);
    setPribitekNaUdelezbo(data.pribitekNaUdelezbo || []);
    setUrniPribitek(data.urniPribitek || []);
  };

  const openPayDialog = async (project) => {
    setSelectedProject(project);
    await fetchConstants();
    setSelectedPribitekUdelezba(null);
    setSelectedUrniPribitek(null);
    setPayDialogOpen(true);
  };

  const calculatePayout = () => {
    const pribitekUdelezba = selectedPribitekUdelezba?.pribitek || 0;
    const pribitekUre = selectedUrniPribitek?.pribitek || 0;
    return osnova + pribitekUdelezba + pribitekUre;
  };

  const confirmPayment = async () => {
    if (!selectedProject) return;

    const pribitek =
      (selectedPribitekUdelezba?.pribitek || 0) + (selectedUrniPribitek?.pribitek || 0);
    const skupniZnesek = osnova + pribitek;
    let znesekUgodnosti = 0;
    let znesekTRR = 0;

    if (payMethod === "100ugodnosti") znesekUgodnosti = skupniZnesek;
    else if (payMethod === "50ugodnosti50trr") {
      znesekUgodnosti = skupniZnesek / 2;
      znesekTRR = skupniZnesek / 2;
    }

    const projectRef = doc(db, "izplacani_projekti", selectedProject.id);
    const existingPayment = await getDoc(projectRef);
    if (existingPayment.exists()) {
      alert("Izplačilo za ta projekt je že bilo izvedeno!");
      return;
    }

    const recentProject = {
      naziv: selectedProject.naziv,
      osnova,
      pribitek,
      stevilo: selectedProject.stevilo,
      timestamp: serverTimestamp(),
      vodja: selectedProject.vodja,
      email: selectedProject.email || "",
      znesek: skupniZnesek,
      znesekUgodnosti,
      znesekTRR,
      metoda: payMethod,
    };

    await setDoc(projectRef, recentProject);

    setPayDialogOpen(false);
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    setFormOpen(true);
  };

  const handleAddOrUpdate = () => {
    setRefreshKey((prev) => prev + 1);
    setEditingProject(null);
    setFormOpen(false);
  };

  const { columns, rows, filters } = useProjektiData(
    refreshKey,
    handleEditProject,
    openPayDialog,
    filterYear,
    filterMonth,
    filterPodrocje,
    filterVodja
  );

  const { years = [], months = [], podrocja = [], vodje = [] } = filters || {};

  const sortedRows = [...rows].sort((a, b) => {
    const numA = Number(a.stevilo) || 0;
    const numB = Number(b.stevilo) || 0;
    return numA - numB;
  });

  const filteredRows = sortedRows.filter((row) =>
    Object.values(row).some((val) => String(val).toLowerCase().includes(searchText.toLowerCase()))
  );

  return (
    <DashboardLayout>
      <div style={backgroundStyle} />
      <DashboardNavbar />

      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <MDBox
                mx={2}
                mt={-3}
                py={3}
                px={2}
                variant="gradient"
                bgColor="info"
                borderRadius="lg"
                coloredShadow="info"
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                flexWrap="wrap"
                gap={2}
              >
                <MDTypography variant="h6" color="white">
                  Projekti
                </MDTypography>

                <MDBox display="flex" alignItems="center" gap={1}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Select
                      size="small"
                      value={filterYear}
                      onChange={(e) => setFilterYear(e.target.value)}
                      displayEmpty
                      sx={{
                        borderRadius: 1,
                        height: "34px",
                        background: "white",
                        minWidth: 100,
                      }}
                    >
                      <MenuItem value="">Vsa leta</MenuItem>
                      {years.map((y) => (
                        <MenuItem key={y} value={y}>
                          {y}
                        </MenuItem>
                      ))}
                    </Select>

                    <Select
                      size="small"
                      value={filterMonth}
                      onChange={(e) => setFilterMonth(e.target.value)}
                      displayEmpty
                      sx={{
                        borderRadius: 1,
                        height: "34px",
                        background: "white",
                        minWidth: 120,
                      }}
                    >
                      <MenuItem value="">Vsi meseci</MenuItem>
                      {months.map((m) => (
                        <MenuItem key={m.value} value={m.value}>
                          {m.label}
                        </MenuItem>
                      ))}
                    </Select>

                    <Select
                      size="small"
                      value={filterPodrocje}
                      onChange={(e) => setFilterPodrocje(e.target.value)}
                      displayEmpty
                      sx={{
                        borderRadius: 1,
                        height: "34px",
                        background: "white",
                        minWidth: 120,
                      }}
                    >
                      <MenuItem value="">Vsa področja</MenuItem>
                      {podrocja.map((p) => (
                        <MenuItem key={p} value={p}>
                          {p}
                        </MenuItem>
                      ))}
                    </Select>

                    <Select
                      size="small"
                      value={filterVodja}
                      onChange={(e) => setFilterVodja(e.target.value)}
                      displayEmpty
                      sx={{
                        borderRadius: 1,
                        height: "34px",
                        background: "white",
                        minWidth: 140,
                      }}
                    >
                      <MenuItem value="">Vsi vodje</MenuItem>
                      {vodje.map((v) => (
                        <MenuItem key={v} value={v}>
                          {v}
                        </MenuItem>
                      ))}
                    </Select>

                    <TextField
                      size="small"
                      placeholder="Išči..."
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      sx={{
                        borderRadius: 1,
                        height: "34px",
                        "& .MuiInputBase-input": { padding: "8px 8px" },
                        minWidth: 180,
                        background: "white",
                      }}
                    />
                  </Box>

                  <MDButton
                    variant="outlined"
                    color="white"
                    size="small"
                    onClick={() => setFormOpen(true)}
                  >
                    Dodaj projekt
                  </MDButton>

                  <IconButton color="inherit" onClick={() => setModalOpen(true)}>
                    <FullscreenIcon />
                    <MDTypography variant="caption" color="white" ml={1}>
                      Odpri tabelo projektov
                    </MDTypography>
                  </IconButton>
                </MDBox>
              </MDBox>

              <MDBox pt={3}>
                <DataTable
                  table={{ columns, rows: filteredRows }}
                  isSorted={false}
                  entriesPerPage={false}
                  showTotalEntries={false}
                  noEndBorder
                />
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>

      <Footer />

      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <MDTypography variant="h5">{editingProject ? "" : ""}</MDTypography>
          <IconButton
            onClick={() => setFormOpen(false)}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <ProjektiForm onAdd={handleAddOrUpdate} editingProject={editingProject} />
        </DialogContent>
      </Dialog>

      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        fullScreen
        PaperProps={{
          sx: { bgcolor: "background.default" },
        }}
      >
        <MDBox
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          px={3}
          py={2}
          sx={{
            background: (theme) =>
              `linear-gradient(90deg, ${theme.palette.info.main}, ${theme.palette.info.dark})`,
          }}
        >
          <MDTypography variant="h5" color="white">
            Delovna tabela projektov
          </MDTypography>
          <IconButton onClick={() => setModalOpen(false)} sx={{ color: "white" }}>
            <CloseIcon />
          </IconButton>
        </MDBox>

        <DialogContent sx={{ p: 3 }}>
          <Card sx={{ boxShadow: 4, borderRadius: 2 }}>
            <MDBox p={2}>
              <DataTable
                table={{ columns, rows: filteredRows }}
                isSorted={false}
                entriesPerPage={false}
                showTotalEntries={false}
                noEndBorder
              />
            </MDBox>
          </Card>
        </DialogContent>
      </Dialog>

      <Dialog open={payDialogOpen} onClose={() => setPayDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Izplačilo projekta</DialogTitle>
        <DialogContent dividers>
          <Typography variant="h6">{selectedProject?.naziv}</Typography>
          <Typography variant="subtitle1" gutterBottom>
            Vodja: {selectedProject?.vodja}
          </Typography>

          <Typography variant="body1" mt={2}>
            Osnova: {osnova} €
          </Typography>

          <Typography variant="body2" mt={2}>
            Pribitek na udeležbo:
          </Typography>
          <Select
            fullWidth
            value={selectedPribitekUdelezba ? selectedPribitekUdelezba.udelezeni : ""}
            onChange={(e) => {
              const val = pribitekNaUdelezbo.find((p) => p.udelezeni === e.target.value);
              setSelectedPribitekUdelezba(val || null);
            }}
            displayEmpty
          >
            <MenuItem value="">Ni izbire</MenuItem>
            {pribitekNaUdelezbo.map((item) => (
              <MenuItem key={item.udelezeni} value={item.udelezeni}>
                {item.udelezeni} udeležencev - {item.pribitek} €
              </MenuItem>
            ))}
          </Select>

          <Typography variant="body2" mt={2}>
            Urni pribitek:
          </Typography>
          <Select
            fullWidth
            value={selectedUrniPribitek ? selectedUrniPribitek.ure : ""}
            onChange={(e) => {
              const val = urniPribitek.find((p) => p.ure === e.target.value);
              setSelectedUrniPribitek(val || null);
            }}
            displayEmpty
          >
            <MenuItem value="">Ni izbire</MenuItem>
            {urniPribitek.map((item) => (
              <MenuItem key={item.ure} value={item.ure}>
                {item.ure} ure - {item.pribitek} €
              </MenuItem>
            ))}
          </Select>

          <Typography variant="h6" mt={3}>
            Skupno izplačilo: {calculatePayout()} €
          </Typography>
          <Typography variant="body2" mt={2}>
            Način izplačila:
          </Typography>
          <Select fullWidth value={payMethod} onChange={(e) => setPayMethod(e.target.value)}>
            <MenuItem value="100ugodnosti">100 % v ugodnosti</MenuItem>
            <MenuItem value="50ugodnosti50trr">50 % ugodnosti / 50 % TRR</MenuItem>
          </Select>
          <Typography variant="body2" mt={1}>
            Ugodnosti: {payMethod === "100ugodnosti" ? calculatePayout() : calculatePayout() / 2} €
          </Typography>
          <Typography variant="body2">
            TRR: {payMethod === "50ugodnosti50trr" ? calculatePayout() / 2 : 0} €
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPayDialogOpen(false)}>Prekliči</Button>
          <Button variant="contained" color="primary" onClick={confirmPayment}>
            Izplačaj
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}
