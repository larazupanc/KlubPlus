import { useState } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import IconButton from "@mui/material/IconButton";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import CloseIcon from "@mui/icons-material/Close";
import Button from "@mui/material/Button";

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

  const handleEditProject = (project) => {
    setEditingProject(project);
    setFormOpen(true);
  };

  const { columns, rows } = useProjektiData(refreshKey, handleEditProject);
  const navigate = useNavigate();

  const handleAddOrUpdate = () => {
    setRefreshKey((prev) => prev + 1);
    setEditingProject(null);
    setFormOpen(false);
  };

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

      {/* Form Popup Modal */}
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

      {/* Fullscreen Table Modal */}
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
    </DashboardLayout>
  );
}
