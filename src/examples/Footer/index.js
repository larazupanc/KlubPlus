import Link from "@mui/material/Link";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

function Footer() {
  return (
    <MDBox
      width="100%"
      display="flex"
      justifyContent="flex-end"
      alignItems="center"
      px={1.5}
      py={2}
    >
      <Link href="https://drustvo-lak.si/" target="_blank">
        <MDTypography variant="button" fontWeight="regular" color="text">
          Spletna stran
        </MDTypography>
      </Link>
    </MDBox>
  );
}

export default Footer;
