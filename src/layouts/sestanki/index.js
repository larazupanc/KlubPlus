import { useState } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

import useSestankiData from "./data/sestankiData";
import SestankiForm from "./components/SestankiForm";

function Sestanki() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [editingMeeting, setEditingMeeting] = useState(null);

  const handleAddMeeting = () => {
    setEditingMeeting(null); // Clear editing state
    setRefreshKey((prev) => prev + 1);
  };

  const handleEditMeeting = (meeting) => {
    setEditingMeeting(meeting);
  };

  const { columns, rows } = useSestankiData(refreshKey, handleEditMeeting);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <SestankiForm onAdd={handleAddMeeting} editingMeeting={editingMeeting} />
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
              >
                <MDTypography variant="h6" color="white">
                  Sestanki
                </MDTypography>
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
    </DashboardLayout>
  );
}

export default Sestanki;
