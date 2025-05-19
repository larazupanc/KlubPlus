import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import Header from "layouts/profile/components/Header";
import UserApprovalPanel from "layouts/profile/components/potrditev.js";

function Overview() {
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox mb={2} />
      <Header>
        <MDBox mt={5} mb={3}></MDBox>
        <MDBox pt={2} px={2} lineHeight={1.25}>
          <MDTypography variant="h6" fontWeight="medium">
            <UserApprovalPanel />

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
