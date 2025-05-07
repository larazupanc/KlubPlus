import { useState, useEffect } from "react";
import { collection, addDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "firebaseConfig";
import PropTypes from "prop-types";

import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import MDTypography from "components/MDTypography";

export default function SestankiForm({ onAdd, editingMeeting }) {
  const [formData, setFormData] = useState({
    title: "",
    leader: "",
    caption: "",
    place: "",
    date: "",
    startTime: "",
  });

  // When editingMeeting changes, populate form
  useEffect(() => {
    if (editingMeeting) {
      setFormData({
        title: editingMeeting.title || "",
        leader: editingMeeting.leader || "",
        caption: editingMeeting.caption || "",
        place: editingMeeting.place || "",
        date: editingMeeting.date || "",
        startTime: editingMeeting.startTime || "",
      });
    } else {
      setFormData({
        title: "",
        leader: "",
        caption: "",
        place: "",
        date: "",
        startTime: "",
      });
    }
  }, [editingMeeting]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingMeeting) {
        // Update existing meeting
        const docRef = doc(db, "sestanki", editingMeeting.id);
        await updateDoc(docRef, formData);
      } else {
        // Add new meeting
        await addDoc(collection(db, "sestanki"), formData);
      }

      onAdd(); // Refresh data
      setFormData({
        title: "",
        leader: "",
        caption: "",
        place: "",
        date: "",
        startTime: "",
      });
    } catch (err) {
      console.error("Error saving meeting:", err);
    }
  };

  return (
    <Card sx={{ p: 3, mb: 4 }}>
      <MDTypography variant="h6" gutterBottom>
        {editingMeeting ? "Uredi sestanek" : "Dodaj nov sestanek"}
      </MDTypography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              label="Naziv"
              name="title"
              fullWidth
              value={formData.title}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="Vodja"
              name="leader"
              fullWidth
              value={formData.leader}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="Opis"
              name="caption"
              fullWidth
              value={formData.caption}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="Lokacija"
              name="place"
              fullWidth
              value={formData.place}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="Datum"
              name="date"
              type="date"
              fullWidth
              value={formData.date}
              onChange={handleChange}
              required
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="Ura"
              name="startTime"
              type="time"
              fullWidth
              value={formData.startTime}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <Button type="submit" variant="contained" color="primary">
              {editingMeeting ? "Posodobi sestanek" : "Dodaj sestanek"}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Card>
  );
}

SestankiForm.propTypes = {
  onAdd: PropTypes.func.isRequired,
  editingMeeting: PropTypes.object, // Can be null or an object
};
