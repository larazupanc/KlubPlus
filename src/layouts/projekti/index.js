import { useState } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import IconButton from "@mui/material/IconButton";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import CloseIcon from "@mui/icons-material/Close";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Typography from "@mui/material/Typography";

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
    let pribitekUdelezba = selectedPribitekUdelezba ? selectedPribitekUdelezba.pribitek : 0;
    let pribitekUre = selectedUrniPribitek ? selectedUrniPribitek.pribitek : 0;
    return osnova + pribitekUdelezba + pribitekUre;
  };

  const confirmPayment = async () => {
    if (!selectedProject) return;

    const pribitek =
      (selectedPribitekUdelezba?.pribitek || 0) + (selectedUrniPribitek?.pribitek || 0);
    const skupniZnesek = osnova + pribitek;

    let znesekUgodnosti = 0;
    let znesekTRR = 0;

    if (payMethod === "100ugodnosti") {
      znesekUgodnosti = skupniZnesek;
    } else if (payMethod === "50ugodnosti50trr") {
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
      osnova: osnova,
      pribitek: pribitek,
      stevilo: selectedProject.stevilo,
      timestamp: serverTimestamp(),
      vodja: selectedProject.vodja,
      znesek: skupniZnesek,
      znesekUgodnosti,
      znesekTRR,
      metoda: payMethod,
    };

    await setDoc(projectRef, recentProject);
    alert(
      `Projekt izplačan (${skupniZnesek} EUR): ${znesekUgodnosti}€ ugodnosti, ${znesekTRR}€ TRR.`
    );
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

  const { columns, rows } = useProjektiData(refreshKey, handleEditProject, openPayDialog);
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <DashboardNavbar />

      <Button
        variant="contained"
        color="info"
        onClick={() =>
          window.open(
            "https://drive.google.com/drive/folders/1JhrreQM3fF9CJDTHk-dB_JVpKPFYCoLX",
            "_blank"
          )
        }
        style={{ margin: "16px" }}
      >
        Pojdi na Google Drive
      </Button>

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
              >
                <MDTypography variant="h6" color="white">
                  Projekti
                </MDTypography>

                <MDBox display="flex" alignItems="center" gap={1}>
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
                  table={{ columns, rows }}
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
          <MDTypography variant="h5">
            {editingProject ? "Uredi projekt" : "Dodaj projekt"}
          </MDTypography>
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

      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} fullScreen>
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px",
          }}
        >
          <MDTypography variant="h5">Delovna tabela projektov</MDTypography>
          <IconButton onClick={() => setModalOpen(false)} color="inherit">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <DataTable
            table={{ columns, rows }}
            isSorted={false}
            entriesPerPage={false}
            showTotalEntries={false}
            noEndBorder
          />
        </DialogContent>
      </Dialog>

      {}
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
            <MenuItem value="">
              <em>Ni izbire</em>
            </MenuItem>
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
            <MenuItem value="">
              <em>Ni izbire</em>
            </MenuItem>
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
