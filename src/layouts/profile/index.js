import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";

import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import InstagramIcon from "@mui/icons-material/Instagram";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import ProfileInfoCard from "examples/Cards/InfoCards/ProfileInfoCard";
import ProfilesList from "examples/Lists/ProfilesList";
import DefaultProjectCard from "examples/Cards/ProjectCards/DefaultProjectCard";

import Header from "layouts/profile/components/Header";

function Overview() {
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox mb={2} />
      <Header>
        <MDBox mt={5} mb={3}></MDBox>
        <MDBox pt={2} px={2} lineHeight={1.25}>
          <MDTypography variant="h6" fontWeight="medium">
            {/* Placeholder */}
          </MDTypography>
          <MDBox mb={1}>
            <MDTypography variant="button" color="text">
              {/* Placeholder */}
            </MDTypography>
          </MDBox>
        </MDBox>
        <MDBox p={2}></MDBox>
      </Header>
      <Footer />
    </DashboardLayout>
  );
}

export default Overview;
