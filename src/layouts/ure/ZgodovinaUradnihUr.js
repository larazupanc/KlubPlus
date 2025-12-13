import { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import { ResponsiveContainer } from "recharts";

import TextField from "@mui/material/TextField";
import Pagination from "@mui/material/Pagination";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import { db } from "firebaseConfig";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

const COLORS = ["#6a5acd", "#00c49f", "#ffbb28", "#ff8042", "#ff6666"];

function ZgodovinaUradnihUrModern() {
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [userFilter, setUserFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [searchCustomer, setSearchCustomer] = useState("");
  const [page, setPage] = useState(1);
  const recordsPerPage = 5;

  const [monthlyStats, setMonthlyStats] = useState([]);
  const [couponStats, setCouponStats] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const uradneUreRef = collection(db, "uradneUre");
        const q = query(uradneUreRef, orderBy("date", "desc"));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setRecords(data);
      } catch (err) {
        console.error("Napaka pri pridobivanju podatkov:", err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    let filtered = records;
    if (userFilter)
      filtered = filtered.filter((r) =>
        r.userName.toLowerCase().includes(userFilter.toLowerCase())
      );
    if (monthFilter) filtered = filtered.filter((r) => r.date.startsWith(monthFilter));
    if (searchCustomer)
      filtered = filtered.filter((r) =>
        r.issuedCoupons?.some((entry) =>
          entry.customer.toLowerCase().includes(searchCustomer.toLowerCase())
        )
      );
    setFilteredRecords(filtered);
    setPage(1);
    computeMonthlyStats(filtered);
    computeCouponStats(filtered);
    computeTopCustomers(filtered);
  }, [records, userFilter, monthFilter, searchCustomer]);

  const formatTime = (seconds) => {
    const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  const getDurationColor = (seconds) => {
    if (seconds < 3600) return "#ffe5e5";
    if (seconds < 7200) return "#fff4e5";
    return "#e5ffe5";
  };

  const computeMonthlyStats = (data) => {
    const stats = {};
    data.forEach((r) => {
      const month = r.date.slice(0, 7);
      stats[month] = (stats[month] || 0) + 1;
    });
    setMonthlyStats(Object.keys(stats).map((month) => ({ month, sessions: stats[month] })));
  };

  const computeCouponStats = (data) => {
    const stats = {};
    data.forEach((r) => {
      r.issuedCoupons?.forEach((entry) => {
        entry.coupons.forEach((c) => {
          const name = c.split(" x")[0].trim();
          stats[name] = (stats[name] || 0) + 1;
        });
      });
    });
    const sorted = Object.keys(stats)
      .map((name) => ({ name, value: stats[name] }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
    setCouponStats(sorted);
  };

  const computeTopCustomers = (data) => {
    const stats = {};
    data.forEach((r) => {
      r.issuedCoupons?.forEach((entry) => {
        const customer = entry.customer.trim();
        stats[customer] = (stats[customer] || 0) + entry.coupons.length;
      });
    });
    const sorted = Object.keys(stats)
      .map((customer) => ({ customer, coupons: stats[customer] }))
      .sort((a, b) => b.coupons - a.coupons)
      .slice(0, 5);
    setTopCustomers(sorted);
  };

  const paginatedRecords = filteredRecords.slice(
    (page - 1) * recordsPerPage,
    page * recordsPerPage
  );

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox mt={6} mb={3}>
        <MDTypography variant="h4" fontWeight="bold" gutterBottom>
          Zgodovina uradnih ur
        </MDTypography>

        <MDBox display="flex" gap={2} flexWrap="wrap" mb={4}>
          <TextField
            label="Uporabnik"
            variant="outlined"
            size="small"
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
          />
          <TextField
            label="Mesec (YYYY-MM)"
            variant="outlined"
            size="small"
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
          />
          <TextField
            label="Stranka"
            variant="outlined"
            size="small"
            value={searchCustomer}
            onChange={(e) => setSearchCustomer(e.target.value)}
          />
        </MDBox>

        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 3, borderRadius: 3, boxShadow: 4, height: 350 }}>
              <MDTypography variant="h6" mb={2}>
                Uradne ure po mesecih
              </MDTypography>

              <ResponsiveContainer width="100%" height="80%">
                <BarChart data={monthlyStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="sessions" fill="#6a5acd" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Grid>

          <Grid item xs={12} md={8}>
            <Card sx={{ p: 3, borderRadius: 3, boxShadow: 4, height: 350 }}>
              <MDTypography variant="h6" mb={2}>
                Najpogosteje izdani kuponi (Top 5)
              </MDTypography>

              <ResponsiveContainer width="100%" height="80%">
                <PieChart>
                  <Pie
                    data={couponStats}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    label
                  >
                    {couponStats.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card sx={{ p: 3, borderRadius: 3, boxShadow: 4, height: 380 }}>
              <MDTypography variant="h6" mb={2}>
                Top 5 strank (po številu izdanih kuponov)
              </MDTypography>

              <ResponsiveContainer width="100%" height="85%">
                <BarChart data={topCustomers}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="customer" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="coupons" fill="#00c49f" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {paginatedRecords.length === 0 ? (
            <MDTypography variant="body2" color="textSecondary" sx={{ ml: 2 }}>
              Ni najdenih zapisov.
            </MDTypography>
          ) : (
            paginatedRecords.map((record) => (
              <Grid item xs={12} md={6} key={record.id}>
                <Card
                  sx={{
                    backgroundColor: getDurationColor(record.lengthInSeconds),
                    borderRadius: 3,
                    boxShadow: 2,
                    transition: "transform 0.2s",
                    "&:hover": { transform: "scale(1.02)" },
                  }}
                >
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <MDTypography variant="h6">
                        {record.userName} - {record.date}
                      </MDTypography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <MDTypography variant="body2" color="textSecondary">
                        Začetek: {new Date(record.startTime).toLocaleTimeString()} <br />
                        Konec: {new Date(record.endTime).toLocaleTimeString()} <br />
                        Trajanje: {formatTime(record.lengthInSeconds)} <br />
                        Opomba: {record.note || "-"}
                      </MDTypography>
                      {record.issuedCoupons?.map((entry, idx) => (
                        <MDBox key={idx} component="ul" sx={{ pl: 3 }}>
                          <li>
                            <MDTypography variant="body2">{entry.customer}</MDTypography>
                            <ul>
                              {entry.coupons.map((c, i) => (
                                <li key={i}>
                                  <MDTypography variant="body2">{c}</MDTypography>
                                </li>
                              ))}
                            </ul>
                          </li>
                        </MDBox>
                      ))}
                    </AccordionDetails>
                  </Accordion>
                </Card>
              </Grid>
            ))
          )}
        </Grid>

        {filteredRecords.length > recordsPerPage && (
          <MDBox display="flex" justifyContent="center" mt={4}>
            <Pagination
              count={Math.ceil(filteredRecords.length / recordsPerPage)}
              page={page}
              onChange={(e, val) => setPage(val)}
              color="primary"
            />
          </MDBox>
        )}
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default ZgodovinaUradnihUrModern;
