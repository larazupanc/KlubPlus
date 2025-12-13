import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Box, Button, TextField, Grid, Typography, Snackbar, Alert } from "@mui/material";
import { doc, getDoc } from "firebase/firestore";
import { db } from "firebaseConfig";
import MDBox from "components/MDBox";
import { Card, CardContent } from "@mui/material";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import Footer from "examples/Footer";

import MDTypography from "components/MDTypography";

function VodjaStran() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [realPassword, setRealPassword] = useState("");
  const [showSnackbar, setShowSnackbar] = useState(false);

  useEffect(() => {
    const savedTime = localStorage.getItem("vodjaAuthTime");
    if (savedTime && Date.now() - savedTime < 10 * 60 * 1000) {
      setAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    const fetchPassword = async () => {
      const ref = doc(db, "settings", "access");
      const snapshot = await getDoc(ref);
      if (snapshot.exists()) {
        setRealPassword(snapshot.data().overviewPassword);
      }
    };
    fetchPassword();
  }, []);

  const handlePasswordSubmit = () => {
    if (password === realPassword) {
      setAuthenticated(true);
      localStorage.setItem("vodjaAuthTime", Date.now());
    } else {
      setShowSnackbar(true);
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") return;
    setShowSnackbar(false);
  };

  if (!authenticated) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox py={6}>
          <Grid container justifyContent="center">
            <Grid item xs={12} sm={8} md={5} lg={8}>
              {" "}
              <Card sx={{ p: 2 }}>
                <CardContent>
                  <MDTypography variant="h5" gutterBottom>
                    Za dostop vnesite geslo
                  </MDTypography>

                  <TextField
                    label="Geslo"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    fullWidth
                  />

                  <MDBox mt={2}>
                    <Button variant="contained" onClick={handlePasswordSubmit}>
                      Potrdi
                    </Button>
                  </MDBox>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Snackbar
            open={showSnackbar}
            autoHideDuration={3000}
            onClose={handleCloseSnackbar}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
          >
            <Alert
              onClose={handleCloseSnackbar}
              severity="error"
              variant="filled"
              sx={{ width: "100%", mt: 8 }}
            >
              Napačno geslo!
            </Alert>
          </Snackbar>
        </MDBox>

        <Footer />
      </DashboardLayout>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "80vh",
        gap: 3,
      }}
    >
      <Typography variant="h4">Dobrodošli!</Typography>

      <Button
        component={Link}
        to="/uporabniki"
        variant="contained"
        color="info"
        sx={{
          width: 200,
          backgroundColor: "#f0f0f0",
          color: "black",
          "&:hover": { backgroundColor: "#e0e0e0" },
        }}
      >
        Uporabniki
      </Button>

      <Button
        component={Link}
        to="/izplacila"
        variant="contained"
        sx={{
          width: 200,
          backgroundColor: "#f0f0f0",
          color: "black",
          "&:hover": { backgroundColor: "#e0e0e0" },
        }}
      >
        Izplačila
      </Button>

      <Button
        component={Link}
        to="/ugodnosti"
        variant="contained"
        color="secondary"
        sx={{
          width: 200,
          backgroundColor: "#f0f0f0",
          color: "black",
          "&:hover": { backgroundColor: "#e0e0e0" },
        }}
      >
        Ugodnosti
      </Button>
      <Button
        component={Link}
        to="/konstante"
        variant="contained"
        color="secondary"
        sx={{
          width: 200,
          backgroundColor: "#f0f0f0",
          color: "black",
          "&:hover": { backgroundColor: "#e0e0e0" },
        }}
      >
        Konstante
      </Button>

      <Button
        component={Link}
        to="/vloge"
        variant="contained"
        color="success"
        sx={{
          width: 200,
          backgroundColor: "#f0f0f0",
          color: "black",
          "&:hover": { backgroundColor: "#e0e0e0" },
        }}
      >
        Vloge
      </Button>
    </Box>
  );
}

export default VodjaStran;
