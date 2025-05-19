import React, { useEffect, useState } from "react";

import { startOfDay } from "date-fns";
import MDButton from "components/MDButton";

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
} from "@mui/material";
import { ArrowBack, ArrowForward } from "@mui/icons-material";

import * as XLSX from "xlsx";

import { db } from "firebaseConfig";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";

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
  const [selectedDate, setSelectedDate] = useState(null);
  const [name, setName] = useState("");
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    generateCalendar();
    fetchBookings();
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

  const isBookable = (date) => {
    const day = getDay(date);
    return allowedSlots[day - 1] !== undefined;
  };

  const getBookedName = (date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const match = bookedDates.find((b) => b.date === dateStr);
    return match?.name || null;
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
    setName("");
    setOpenDialog(true);
  };

  const handleBooking = async () => {
    if (!name.trim() || !selectedDate) return;

    const dateStr = format(selectedDate, "yyyy-MM-dd");
    const weekday = getDay(selectedDate);
    const shifted = weekday === 0 ? 6 : weekday - 1;

    await addDoc(collection(db, "rezervacije"), {
      name: name.trim(),
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
          const shifted = weekday === 0 ? 6 : weekday - 1;
          const bookable = allowedSlots[shifted];
          const bookedName = getBookedName(date);

          return (
            <Grid item xs={1.7} key={index}>
              <Paper
                sx={{
                  height: 100,
                  p: 1,
                  backgroundColor: !inMonth
                    ? "white"
                    : bookedName
                    ? "#ffcdd2"
                    : bookable
                    ? "#c8e6c9"
                    : "#ffffff",
                  visibility: inMonth ? "visible" : "hidden",
                  cursor: bookable && !bookedName ? "pointer" : "default",
                }}
                elevation={3}
                onClick={() => handleDayClick(date)}
              >
                <Typography align="center" variant="subtitle2">
                  {format(date, "d")}
                </Typography>
                {inMonth && bookable && (
                  <Typography align="center" variant="caption" display="block">
                    {allowedSlots[shifted].label}
                  </Typography>
                )}
                {inMonth && bookedName && (
                  <Typography align="center" variant="caption" display="block">
                    {bookedName}
                  </Typography>
                )}
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
            Termin:{" "}
            {selectedDate &&
              allowedSlots[getDay(selectedDate) === 0 ? 6 : getDay(selectedDate) - 1].time}
          </Typography>
          <TextField
            label="Ime in priimek"
            fullWidth
            margin="dense"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
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
