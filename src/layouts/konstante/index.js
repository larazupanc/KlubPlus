import React, { useState, useEffect } from "react";
import {
  TextField,
  Divider,
  Button,
  Card as MuiCard,
  CardContent,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { db } from "firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { serverTimestamp, collection, addDoc } from "firebase/firestore";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

const defaultKonstante = {
  osnova: 5,
  pribitekNaUdelezbo: [
    { udelezeni: 1, pribitek: 0 },
    { udelezeni: 2, pribitek: 0 },
  ],
  urniPribitek: [
    { ure: 5, pribitek: 0 },
    { ure: 10, pribitek: 0 },
  ],
  delezi: {
    transakcijskiRacun: 0.5,
    klubskeUgodnosti: 0.5,
  },
  mesecniHonorarji: {
    predsednik: 10,
    podpredsednik: 10,
    član: 10,
    tajnik: 10,
    blagajnik: 10,
    grafičnioblikovalec: 10,
    sociala: 10,
  },
};

export default function KonstantePage() {
  const [konstante, setKonstante] = useState(defaultKonstante);
  const [editing, setEditing] = useState(false);
  const [password, setPassword] = useState("");

  const konstanteRef = doc(db, "nastavitve", "konstante");

  useEffect(() => {
    const fetchKonstante = async () => {
      const snapshot = await getDoc(konstanteRef);
      if (snapshot.exists()) {
        const data = snapshot.data();
        setKonstante({ ...defaultKonstante, ...data });
      }
    };
    fetchKonstante();
  }, []);

  const handlePasswordSubmit = () => {
    if (password === "Lara123") setEditing(true);
    else alert("Napačno geslo!");
  };

  const handleSave = async () => {
    const dataWithTimestamp = {
      ...konstante,
      lastUpdated: serverTimestamp(),
    };

    try {
      await setDoc(konstanteRef, dataWithTimestamp);
      const historyRef = collection(db, "nastavitve", "konstante", "history");
      await addDoc(historyRef, {
        ...konstante,
        timestamp: serverTimestamp(),
      });

      alert("Shranjeno in zabeleženo!");
      setEditing(false);
    } catch (error) {
      console.error("Napaka pri shranjevanju:", error);
      alert("Napaka pri shranjevanju!");
    }
  };

  const handleNestedChange = (section, index, field, value) => {
    const updated = [...konstante[section]];
    updated[index][field] = parseFloat(value);
    setKonstante((prev) => ({ ...prev, [section]: updated }));
  };

  const handleSimpleChange = (section, value) => {
    setKonstante((prev) => ({ ...prev, [section]: parseFloat(value) }));
  };

  const handleDelezChange = (field, value) => {
    setKonstante((prev) => ({
      ...prev,
      delezi: {
        ...prev.delezi,
        [field]: parseFloat(value),
      },
    }));
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <MuiCard>
              <MDBox p={3}>
                <MDTypography variant="h4" gutterBottom>
                  Konstante dogodkov
                </MDTypography>

                {!editing ? (
                  <>
                    <TextField
                      label="Geslo za urejanje"
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
                  </>
                ) : (
                  <CardContent style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6">Dogodki</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <TextField
                          label="Osnovna vrednost (€)"
                          type="number"
                          value={konstante.osnova}
                          onChange={(e) => handleSimpleChange("osnova", e.target.value)}
                          fullWidth
                        />

                        <Divider sx={{ my: 2 }} />
                        <MDTypography variant="h6">Pribitek na udeležbo</MDTypography>
                        {konstante.pribitekNaUdelezbo.map((item, i) => (
                          <Grid container spacing={2} key={i}>
                            <Grid item xs={6}>
                              <TextField
                                label={`Udeleženi (${item.udelezeni})`}
                                type="number"
                                value={item.udelezeni}
                                disabled
                                fullWidth
                              />
                            </Grid>
                            <Grid item xs={6}>
                              <TextField
                                label="Pribitek (€)"
                                type="number"
                                value={item.pribitek}
                                onChange={(e) =>
                                  handleNestedChange(
                                    "pribitekNaUdelezbo",
                                    i,
                                    "pribitek",
                                    e.target.value
                                  )
                                }
                                fullWidth
                              />
                            </Grid>
                          </Grid>
                        ))}

                        <Divider sx={{ my: 2 }} />
                        <MDTypography variant="h6" gutterBottom>
                          Deleži izplačila
                        </MDTypography>
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <TextField
                              label="Na transakcijski račun"
                              type="number"
                              value={konstante.delezi?.transakcijskiRacun ?? 0}
                              onChange={(e) =>
                                handleDelezChange("transakcijskiRacun", e.target.value)
                              }
                              fullWidth
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              label="V klubskih ugodnostih"
                              type="number"
                              value={konstante.delezi?.klubskeUgodnosti ?? 0}
                              onChange={(e) =>
                                handleDelezChange("klubskeUgodnosti", e.target.value)
                              }
                              fullWidth
                            />
                          </Grid>
                        </Grid>
                      </AccordionDetails>
                    </Accordion>

                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6">Mesečni honorarji</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Grid container spacing={2}>
                          {konstante.mesecniHonorarji &&
                            Object.entries(konstante.mesecniHonorarji).map(
                              ([key, value], index) => (
                                <Grid item xs={6} key={index}>
                                  <TextField
                                    label={key}
                                    type="number"
                                    value={value}
                                    onChange={(e) =>
                                      setKonstante((prev) => ({
                                        ...prev,
                                        mesecniHonorarji: {
                                          ...prev.mesecniHonorarji,
                                          [key]: parseFloat(e.target.value),
                                        },
                                      }))
                                    }
                                    fullWidth
                                  />
                                </Grid>
                              )
                            )}
                        </Grid>
                      </AccordionDetails>
                    </Accordion>

                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6">Uradne ure</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        {konstante.urniPribitek.map((item, i) => (
                          <Grid container spacing={2} key={i}>
                            <Grid item xs={6}>
                              <TextField
                                label={`Ure do ${item.ure}`}
                                type="number"
                                value={item.ure}
                                disabled
                                fullWidth
                              />
                            </Grid>
                            <Grid item xs={6}>
                              <TextField
                                label="Pribitek (€)"
                                type="number"
                                value={item.pribitek}
                                onChange={(e) =>
                                  handleNestedChange("urniPribitek", i, "pribitek", e.target.value)
                                }
                                fullWidth
                              />
                            </Grid>
                          </Grid>
                        ))}
                      </AccordionDetails>
                    </Accordion>

                    <MDBox mt={3}>
                      <Button variant="contained" color="primary" onClick={handleSave}>
                        Shrani
                      </Button>
                    </MDBox>
                  </CardContent>
                )}
              </MDBox>
            </MuiCard>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}
