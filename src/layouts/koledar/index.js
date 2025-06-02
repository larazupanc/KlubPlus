import React, { useEffect, useState } from "react";
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
  Button,
  TextField,
  Paper,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
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
  4: { label: "Petek 18:30–19:30", time: "18:30–19:30" },
  5: { label: "Sobota 10:00–12:00", time: "10:00–12:00" },
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
  const [filters, setFilters] = useState({
    uradneUre: true,
    dogodki: true,
    sestanki: true,
  });

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
    const fetchedUsers = snapshot.docs.map((doc) => doc.data());
    setUsers(fetchedUsers);
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
    const booked = snapshot.docs.map((doc) => doc.data());
    setBookedDates(booked);
  };

  const fetchSestanki = async () => {
    const snapshot = await getDocs(collection(db, "sestanki"));
    const meetings = snapshot.docs.map((doc) => doc.data());
    setSestanki(meetings);
  };

  const fetchDogodki = async () => {
    const snapshot = await getDocs(collection(db, "dogodki"));
    const events = snapshot.docs.map((doc) => doc.data());
    setDogodki(events);
  };

  const isBookable = (date) => {
    const day = getDay(date);
    return allowedSlots[day - 1] !== undefined;
  };

  const getBookedName = (date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const match = bookedDates.find((b) => b.date === dateStr);
    return match?.name || null;
  };

  const getSestankiForDate = (date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return sestanki.filter((s) => s.date === dateStr);
  };

  const getDogodkiForDate = (date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return dogodki.filter((d) => d.date === dateStr);
  };

  const handleDayClick = (date) => {
    const today = new Date();
    if (!isSameMonth(date, currentMonth)) return;
    if (date < startOfDay(today)) return;
    const weekday = getDay(date);
    const shifted = weekday === 0 ? 6 : weekday - 1;
    const isAllowed = allowedSlots[shifted];
    if (!isAllowed || getBookedName(date)) return;

    setSelectedDate(date);
    setOpenDialog(true);
  };

  const handleBooking = async () => {
    if (!selectedUser || !selectedDate) return;

    const dateStr = format(selectedDate, "yyyy-MM-dd");
    const weekday = getDay(selectedDate);
    const shifted = weekday === 0 ? 6 : weekday - 1;

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
      <Typography variant="h4" align="center" mt={4}>
        Koledar uradnih ur
      </Typography>

      {/* Filters */}
      <Grid container justifyContent="center" spacing={2} mt={2}>
        <Grid item>
          <label>
            <input
              type="checkbox"
              checked={filters.uradneUre}
              onChange={() => setFilters((prev) => ({ ...prev, uradneUre: !prev.uradneUre }))}
            />
            Uradne ure
          </label>
        </Grid>
        <Grid item>
          <label>
            <input
              type="checkbox"
              checked={filters.sestanki}
              onChange={() => setFilters((prev) => ({ ...prev, sestanki: !prev.sestanki }))}
            />
            Sestanki
          </label>
        </Grid>
        <Grid item>
          <label>
            <input
              type="checkbox"
              checked={filters.dogodki}
              onChange={() => setFilters((prev) => ({ ...prev, dogodki: !prev.dogodki }))}
            />
            Dogodki
          </label>
        </Grid>
      </Grid>

      {/* Calendar Controls */}
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

      {/* Calendar */}
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
          const shifted = weekday === 0 ? 6 : weekday - 1;
          const bookable = allowedSlots[shifted];
          const bookedName = filters.uradneUre ? getBookedName(date) : null;
          const meetings = filters.sestanki ? getSestankiForDate(date) : [];
          const events = filters.dogodki ? getDogodkiForDate(date) : [];

          return (
            <Grid item xs={1.7} key={index}>
              <Paper
                sx={{
                  height: 120,
                  p: 1,
                  backgroundColor: !inMonth
                    ? "white"
                    : bookedName
                    ? "#ffcdd2"
                    : meetings.length
                    ? "#bbdefb"
                    : events.length
                    ? "#ffe0b2"
                    : bookable && filters.uradneUre
                    ? "#c8e6c9"
                    : "#ffffff",
                  visibility: inMonth ? "visible" : "hidden",
                  cursor: bookable && !bookedName ? "pointer" : "default",
                  overflow: "hidden",
                }}
                elevation={3}
                onClick={() => handleDayClick(date)}
              >
                <Typography align="center" variant="subtitle2">
                  {format(date, "d")}
                </Typography>

                {bookable && inMonth && filters.uradneUre && (
                  <Typography align="center" variant="caption" display="block">
                    {allowedSlots[shifted].label}
                  </Typography>
                )}

                {bookedName && inMonth && (
                  <Typography align="center" variant="caption" display="block">
                    {bookedName}
                  </Typography>
                )}

                {meetings.map((m, i) => (
                  <Typography
                    key={i}
                    align="center"
                    variant="caption"
                    display="block"
                    sx={{ fontSize: "0.65rem", mt: 0.5 }}
                  >
                    📌 {m.title} ({m.startTime})
                  </Typography>
                ))}

                {events.map((e, i) => (
                  <Typography
                    key={i}
                    align="center"
                    variant="caption"
                    display="block"
                    sx={{ fontSize: "0.65rem", mt: 0.5 }}
                  >
                    🎉 {e.title}
                  </Typography>
                ))}
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      {/* Download */}
      <Grid container justifyContent="center" mt={4}>
        <MDButton variant="gradient" color="info" onClick={downloadExcel}>
          Prenesi Excel za mesec
        </MDButton>
      </Grid>

      {/* Booking Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Vpis na uradne ure</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Datum: {selectedDate && format(selectedDate, "dd.MM.yyyy")}
          </Typography>
          <Typography gutterBottom>
            Termin:{" "}
            {selectedDate &&
              allowedSlots[getDay(selectedDate) === 0 ? 6 : getDay(selectedDate) - 1].time}
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
