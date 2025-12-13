import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import ReportsBarChart from "examples/Charts/BarCharts/ReportsBarChart";
import ReportsLineChart from "examples/Charts/LineCharts/ReportsLineChart";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";
import reportsBarChartData from "layouts/dashboard/data/reportsBarChartData";
import ProjektiOverview from "layouts/dashboard/components/DogodkiOverview";
import SestankiOverview from "layouts/dashboard/components/SestankiOverview";
import reportSestanki from "./data/reportSestanki";
import reportDogodki from "./data/reportDogodki";
import { BrowserRouter } from "react-router-dom";

import { Navigate, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "firebaseConfig";

function Dashboard() {
  const navigate = useNavigate();

  const [projectCount, setProjectCount] = useState(0);
  const [meetingCount, setMeetingCount] = useState(0);
  const [tasks, setTasks] = useState(null);
  const [sales, setSales] = useState(null);

  useEffect(() => {
    const thisYear = new Date().getFullYear();

    const fetchCountsAndCharts = async () => {
      const projektiSnapshot = await getDocs(collection(db, "projekti"));
      const filteredProjects = projektiSnapshot.docs.filter((doc) => {
        const data = doc.data();
        const date = data.datum?.toDate?.() || new Date(data.datum);
        return date.getFullYear() === thisYear;
      });
      setProjectCount(filteredProjects.length);

      const sestankiSnapshot = await getDocs(collection(db, "sestanki"));
      const filteredMeetings = sestankiSnapshot.docs.filter((doc) => {
        const data = doc.data();
        const date = data.date?.toDate?.() || new Date(data.date);
        return date.getFullYear() === thisYear;
      });
      setMeetingCount(filteredMeetings.length);

      const sestankiChartData = await reportSestanki();
      setTasks(sestankiChartData);

      const dogodkiChartData = await reportDogodki();
      setSales(dogodkiChartData);
    };

    fetchCountsAndCharts();
  }, []);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDBox mb={4}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Dobrodošel v sistemu Laškega akademskega kluba!
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Tukaj najdeš vse informacije o projektih, dogodkih, sestankih in drugih aktivnostih
            kluba. Redno preverjaj obvestila in prihajajoče dogodke, da boš vedno na tekočem.
          </Typography>
        </MDBox>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="dark"
                icon="leaderboard"
                title="Projekti"
                count={projectCount}
              />
            </MDBox>
          </Grid>

          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="success"
                icon="weekend"
                title="Sestankov"
                count={meetingCount}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={6}>
            <MDBox mb={1.5} display="flex" justifyContent="center" alignItems="center">
              <MDBox display="flex" justifyContent="center" alignItems="center" height="100%">
                <MDButton
                  variant="gradient"
                  color="info"
                  onClick={() => navigate("/ure")}
                  sx={{
                    px: 5,
                    py: 2,
                    fontSize: "1.2rem",
                    fontWeight: "bold",
                    borderRadius: "16px",
                    textTransform: "none",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 6px 16px rgba(0,0,0,0.3)",
                    },
                    transition: "all 0.2s ease-in-out",
                  }}
                >
                  Začni uradne ure
                </MDButton>
              </MDBox>
            </MDBox>
          </Grid>
        </Grid>

        <MDBox>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={8}>
              <SestankiOverview />
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <ProjektiOverview />
            </Grid>
          </Grid>
        </MDBox>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Dashboard;
