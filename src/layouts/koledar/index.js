import React, { useEffect, useState } from "react";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  format,
  isSameMonth,
  addMonths,
  subMonths,
  getDay,
  startOfDay,
} from "date-fns";
import {
  Grid,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Menu,
} from "@mui/material";
import { ArrowBack, ArrowForward } from "@mui/icons-material";
import * as XLSX from "xlsx";
import { db } from "firebaseConfig";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import MDButton from "components/MDButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

const weekDays = ["Pon", "Tor", "Sre", "Čet", "Pet", "Sob", "Ned"];
const allowedSlots = {
  4: { label: "18:30–19:30", time: "18:30–19:30" },
  5: { label: "10:00–12:00", time: "10:00–12:00" },
};

function Koledar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState([]);
  const [bookedDates, setBookedDates] = useState([]);
  const [sestanki, setSestanki] = useState([]);
  const [dogodki, setDogodki] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [filters, setFilters] = useState({ uradneUre: true, dogodki: true, sestanki: true });
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  useEffect(() => {
    generateCalendar();
    fetchBookings();
    fetchSestanki();
    fetchDogodki();
    fetchUsers();
  }, [currentMonth]);

  const generateCalendar = () => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });
    const days = [];
    let day = start;
    while (day <= end) {
      days.push(day);
      day = addDays(day, 1);
    }
    setCalendarDays(days);
  };

  const fetchUsers = async () => {
    const snapshot = await getDocs(collection(db, "vloge"));
    setUsers(snapshot.docs.map((doc) => doc.data()));
  };

  const fetchBookings = async () => {
    const start = format(startOfMonth(currentMonth), "yyyy-MM-dd");
    const end = format(endOfMonth(currentMonth), "yyyy-MM-dd");
    const q = query(
      collection(db, "rezervacije"),
      where("date", ">=", start),
      where("date", "<=", end)
    );
    const snapshot = await getDocs(q);
    setBookedDates(snapshot.docs.map((doc) => doc.data()));
  };

  const fetchSestanki = async () => {
    const snapshot = await getDocs(collection(db, "sestanki"));
    setSestanki(snapshot.docs.map((doc) => doc.data()));
  };

  const fetchDogodki = async () => {
    const snapshot = await getDocs(collection(db, "projekti"));
    setDogodki(snapshot.docs.map((doc) => doc.data()));
  };

  const getBookedName = (date) =>
    bookedDates.find((b) => b.date === format(date, "yyyy-MM-dd"))?.name || null;
  const getSestankiForDate = (date) =>
    sestanki.filter((s) => s.date === format(date, "yyyy-MM-dd"));
  const getDogodkiForDate = (date) => dogodki.filter((d) => d.datum === format(date, "yyyy-MM-dd"));

  const handleDayClick = (date) => {
    const today = new Date();
    if (!isSameMonth(date, currentMonth) || date < startOfDay(today)) return;
    const shifted = (getDay(date) + 6) % 7;
    if (!allowedSlots[shifted] || getBookedName(date)) return;
    setSelectedDate(date);
    setOpenDialog(true);
  };

  const handleBooking = async () => {
    if (!selectedUser || !selectedDate) return;
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    const shifted = (getDay(selectedDate) + 6) % 7;
    await addDoc(collection(db, "rezervacije"), {
      name: selectedUser.name,
      email: selectedUser.email,
      date: dateStr,
      slot: allowedSlots[shifted].time,
      createdAt: new Date().toISOString(),
    });
    setOpenDialog(false);
    fetchBookings();
  };

  const downloadExcel = () => {
    const data = bookedDates.map((b) => ({
      Datum: b.date,
      Termin: b.slot,
      Ime: b.name,
      Email: b.email || "",
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Rezervacije");
    XLSX.writeFile(workbook, `rezervacije_${format(currentMonth, "MM_yyyy")}.xlsx`);
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox display="flex" justifyContent="space-between" alignItems="center" mt={4}>
        <Typography variant="h4">Koledar uradnih ur, sestankov in projektov</Typography>
        <MDButton onClick={(e) => setAnchorEl(e.currentTarget)} size="small">
          Filtri
        </MDButton>
      </MDBox>

      <MDTypography variant="body2" color="textSecondary" gutterBottom>
        Uradne ure potekajo vsak petek od 18:30 do 20:30 in v soboto od 10:00 do 12:00. Sestanki
        potekajo enkrat mesečno.
      </MDTypography>

      <Grid container justifyContent="center" mt={2}>
        <Menu anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)}>
          {["uradneUre", "sestanki", "projekti"].map((key) => (
            <MenuItem key={key}>
              <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="checkbox"
                  checked={filters[key]}
                  onChange={() => setFilters((prev) => ({ ...prev, [key]: !prev[key] }))}
                />
                {key === "uradneUre" ? "Uradne ure" : key === "sestanki" ? "Sestanki" : "Dogodki"}
              </label>
            </MenuItem>
          ))}
        </Menu>
      </Grid>

      <Grid container justifyContent="center" alignItems="center" mt={2}>
        <IconButton onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h6" sx={{ mx: 2 }}>
          {format(currentMonth, "MMMM yyyy")}
        </Typography>
        <IconButton onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
          <ArrowForward />
        </IconButton>
      </Grid>

      <Grid container spacing={1} justifyContent="center" mt={2}>
        {weekDays.map((day) => (
          <Grid item xs={1.7} key={day}>
            <Typography align="center" variant="subtitle2">
              {day}
            </Typography>
          </Grid>
        ))}

        {calendarDays.map((date, index) => {
          const inMonth = isSameMonth(date, currentMonth);
          const weekday = getDay(date);
          const shifted = (weekday + 6) % 7;
          const bookable = allowedSlots[shifted];
          const bookedName = filters.uradneUre ? getBookedName(date) : null;
          const meetings = filters.sestanki ? getSestankiForDate(date) : [];
          const events = filters.dogodki ? getDogodkiForDate(date) : [];

          const getBackgroundColor = () => {
            if (!inMonth) return "white";
            if (bookedName) return "#fff176";
            if (events.length) return "#64b5f6";
            if (meetings.length) return "#ffb74d";
            if (bookable && filters.uradneUre) return "#c8e6c9";
            return "#ffffff";
          };

          return (
            <Grid item xs={1.7} key={index}>
              <Paper
                sx={{
                  height: 90,
                  fontSize: "0.7rem",
                  p: 1,
                  backgroundColor: getBackgroundColor(),
                  visibility: inMonth ? "visible" : "hidden",
                  cursor: bookable && !bookedName ? "pointer" : "default",
                  overflow: "hidden",
                }}
                elevation={3}
                onClick={() => handleDayClick(date)}
              >
                <Typography align="left" sx={{ fontSize: "0.7rem" }}>
                  {format(date, "d")}
                </Typography>
                {bookable && inMonth && filters.uradneUre && (
                  <Typography align="left" sx={{ fontSize: "0.7rem" }}>
                    🕒 {allowedSlots[shifted].label}
                  </Typography>
                )}
                {bookedName && (
                  <Typography align="left" sx={{ fontSize: "0.7rem" }}>
                    {bookedName}
                  </Typography>
                )}
                {meetings.map((m, i) => (
                  <Typography key={i} align="left" sx={{ fontSize: "0.7rem", mt: 0.5 }}>
                    💼 {m.title} ({m.startTime})
                  </Typography>
                ))}
                {events.map((e, i) => (
                  <Typography key={i} align="left" sx={{ fontSize: "0.7rem" }}>
                    🎉 {e.naziv}
                  </Typography>
                ))}
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      <Grid container justifyContent="center" mt={4}>
        <MDButton variant="gradient" color="info" onClick={downloadExcel}>
          Prenesi Excel za mesec
        </MDButton>
      </Grid>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Vpis na uradne ure</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Datum: {selectedDate && format(selectedDate, "dd.MM.yyyy")}
          </Typography>
          <Typography gutterBottom>
            Termin: {selectedDate && allowedSlots[(getDay(selectedDate) + 6) % 7].time}
          </Typography>
          <FormControl fullWidth margin="dense">
            <InputLabel id="user-select-label">Izberi osebo</InputLabel>
            <Select
              labelId="user-select-label"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              label="Izberi osebo"
              renderValue={(user) => user?.name || ""}
            >
              {users.map((user) => (
                <MenuItem key={user.email} value={user}>
                  {user.name} ({user.role})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Prekliči</Button>
          <Button onClick={handleBooking}>Vpis</Button>
        </DialogActions>
      </Dialog>

      <Footer />
    </DashboardLayout>
  );
}

export default Koledar;
