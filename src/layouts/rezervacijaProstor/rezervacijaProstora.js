import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { db } from "firebaseConfig";
import { format, parse } from "date-fns";

import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";

import MDBox from "components/MDBox";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

function RezervacijaSkupnegaProstora() {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [reservations, setReservations] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    reason: "",
    startTime: "",
    endTime: "",
  });

  useEffect(() => {
    fetchReservations();
  }, [selectedDate]);

  const fetchReservations = async () => {
    const q = query(collection(db, "skupniProstorRezervacije"), where("date", "==", selectedDate));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map((doc) => doc.data());
    setReservations(data);
  };

  const handleOpenDialog = () => {
    setFormData({
      fullName: "",
      reason: "",
      startTime: "",
      endTime: "",
    });
    setOpenDialog(true);
  };

  const handleReserve = async () => {
    const { fullName, reason, startTime, endTime } = formData;
    if (!fullName || !reason || !startTime || !endTime) {
      alert("Prosim izpolni vsa polja.");
      return;
    }

    const newStart = parse(startTime, "HH:mm", new Date());
    const newEnd = parse(endTime, "HH:mm", new Date());

    for (const r of reservations) {
      const existingStart = parse(r.startTime, "HH:mm", new Date());
      const existingEnd = parse(r.endTime, "HH:mm", new Date());

      const overlap =
        (newStart >= existingStart && newStart < existingEnd) ||
        (newEnd > existingStart && newEnd <= existingEnd) ||
        (newStart <= existingStart && newEnd >= existingEnd);

      if (overlap) {
        alert("Termin se prekriva z obstoječo rezervacijo.");
        return;
      }
    }

    await addDoc(collection(db, "skupniProstorRezervacije"), {
      fullName,
      reason,
      startTime,
      endTime,
      date: selectedDate,
      createdAt: new Date().toISOString(),
    });

    setOpenDialog(false);
    fetchReservations();
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h4" gutterBottom>
              Rezervacija skupnega prostora
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ p: 3 }}>
              <MDBox mb={2}>
                <TextField
                  type="date"
                  fullWidth
                  label="Izberi datum"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </MDBox>
              <MDBox>
                <Button variant="contained" onClick={handleOpenDialog}>
                  Nova rezervacija
                </Button>
              </MDBox>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" mb={2}>
                Obstoječe rezervacije ({format(new Date(selectedDate), "dd. MM. yyyy")}):
              </Typography>
              {reservations.length === 0 ? (
                <Typography>Ni rezervacij za izbran datum.</Typography>
              ) : (
                reservations.map((r, i) => (
                  <MDBox key={i} mb={2} borderBottom="1px solid #eee" pb={1}>
                    <Typography variant="subtitle1">
                      <strong>{r.fullName}</strong>
                    </Typography>
                    <Typography variant="body2">
                      {r.startTime} – {r.endTime} | {r.reason}
                    </Typography>
                  </MDBox>
                ))
              )}
            </Card>
          </Grid>
        </Grid>
      </MDBox>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>Nova rezervacija prostora</DialogTitle>
        <DialogContent>
          <MDBox component="form" display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              label="Ime in priimek"
              fullWidth
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            />
            <TextField
              label="Razlog rezervacije"
              fullWidth
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            />
            <TextField
              label="Ura začetka"
              type="time"
              fullWidth
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Ura konca"
              type="time"
              fullWidth
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </MDBox>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Prekliči</Button>
          <Button variant="contained" onClick={handleReserve}>
            Potrdi rezervacijo
          </Button>
        </DialogActions>
      </Dialog>

      <Footer />
    </DashboardLayout>
  );
}

export default RezervacijaSkupnegaProstora;
