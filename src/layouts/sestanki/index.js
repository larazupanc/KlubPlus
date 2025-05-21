import { useState } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import AddIcon from "@mui/icons-material/Add";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

import useSestankiData from "./data/sestankiData";
import SestankiForm from "./components/SestankiForm";

function Sestanki() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [editingMeeting, setEditingMeeting] = useState(null);
  const [openForm, setOpenForm] = useState(false);

  const handleAddMeeting = () => {
    setEditingMeeting(null);
    setRefreshKey((prev) => prev + 1);
    setOpenForm(false);
  };

  const handleEditMeeting = (meeting) => {
    setEditingMeeting(meeting);
    setOpenForm(true);
  };

  const { columns, rows } = useSestankiData(refreshKey, handleEditMeeting);

  return (
    <DashboardLayout>
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
              >
                <MDTypography variant="h6" color="white">
                  Tabela sestankov
                </MDTypography>
                <MDButton
                  variant="outlined"
                  color="white"
                  size="small"
                  onClick={() => setOpenForm(true)}
                  startIcon={<AddIcon />}
                >
                  Dodaj sestanek
                </MDButton>
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

      <Dialog open={openForm} onClose={() => setOpenForm(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingMeeting ? "Uredi sestanek" : "Dodaj sestanek"}</DialogTitle>
        <DialogContent>
          <SestankiForm onAdd={handleAddMeeting} editingMeeting={editingMeeting} />
        </DialogContent>
      </Dialog>

      <Footer />
    </DashboardLayout>
  );
}

export default Sestanki;
