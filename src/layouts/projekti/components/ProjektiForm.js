import { useState, useEffect } from "react";
import { collection, addDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "firebaseConfig";
import PropTypes from "prop-types";

import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import MDTypography from "components/MDTypography";

export default function ProjektiForm({ onAdd, editingProject }) {
  const [formData, setFormData] = useState({
    naziv: "",
    opis: "",
    vodja: "",
    datum: "",
    lokacija: "",
    ura: "",
    drugeInformacije: "",
    podrocje: "",
  });

  useEffect(() => {
    if (editingProject) {
      setFormData({
        naziv: editingProject.naziv || "",
        opis: editingProject.opis || "",
        vodja: editingProject.vodja || "",
        datum: editingProject.datum || "",
        lokacija: editingProject.lokacija || "",
        ura: editingProject.ura || "",
        drugeInformacije: editingProject.drugeInformacije || "",
        podrocje: editingProject.podrocje || "",
      });
    } else {
      setFormData({
        naziv: "",
        opis: "",
        vodja: "",
        datum: "",
        lokacija: "",
        ura: "",
        drugeInformacije: "",
        podrocje: "",
      });
    }
  }, [editingProject]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProject) {
        const docRef = doc(db, "projekti", editingProject.id);
        await updateDoc(docRef, formData);
      } else {
        await addDoc(collection(db, "projekti"), formData);
      }

      onAdd();
    } catch (err) {
      console.error("Error saving project:", err);
    }
  };

  return (
    <Card sx={{ p: 3, mb: 4 }}>
      <MDTypography variant="h6" gutterBottom>
        {editingProject ? "Uredi projekt" : "Dodaj nov projekt"}
      </MDTypography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          {[
            { label: "Naziv", name: "naziv" },
            { label: "Opis", name: "opis" },
            { label: "Vodja", name: "vodja" },
            { label: "Datum", name: "datum", type: "date" },
            { label: "Lokacija", name: "lokacija" },
            { label: "Ura", name: "ura", type: "time" },
            { label: "Druge informacije", name: "drugeInformacije" },
            { label: "Področje", name: "podrocje" },
          ].map(({ label, name, type }) => (
            <Grid item xs={12} md={6} key={name}>
              <TextField
                label={label}
                name={name}
                fullWidth
                type={type || "text"}
                value={formData[name]}
                onChange={handleChange}
                required
                InputLabelProps={type === "date" || type === "time" ? { shrink: true } : {}}
              />
            </Grid>
          ))}

          <Grid item xs={12}>
            <Button type="submit" variant="contained" color="primary">
              {editingProject ? "Posodobi projekt" : "Dodaj projekt"}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Card>
  );
}

ProjektiForm.propTypes = {
  onAdd: PropTypes.func.isRequired,
  editingProject: PropTypes.object,
};
