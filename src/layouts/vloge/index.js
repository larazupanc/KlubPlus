import { useState, useEffect } from "react";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "firebaseConfig";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";

const predefinedRoles = [
  "predsednik",
  "podpredsednik",
  "blagajnik",
  "član",
  "svetnik",
  "grafični oblikovalec",
  "skrbnik socialnih omrežjih",
  "drugo",
];

function UrediVloge() {
  const [vloge, setVloge] = useState([]);
  const [retired, setRetired] = useState([]);
  const [newVloga, setNewVloga] = useState({
    name: "",
    email: "",
    role: "",
    customRole: "",
    amount: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [editedData, setEditedData] = useState({});

  const fetchVloge = async () => {
    const snapshot = await getDocs(collection(db, "vloge"));
    const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setVloge(list);
  };

  const fetchRetired = async () => {
    const snapshot = await getDocs(collection(db, "retiredVloge"));
    const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setRetired(list);
  };

  useEffect(() => {
    fetchVloge();
    fetchRetired();
  }, []);

  const handleAdd = async () => {
    const finalRole = newVloga.role === "drugo" ? newVloga.customRole : newVloga.role;
    if (!newVloga.name || !newVloga.email || !finalRole || !newVloga.amount) return;

    await addDoc(collection(db, "vloge"), {
      name: newVloga.name,
      email: newVloga.email,
      role: finalRole,
      amount: Number(newVloga.amount),
      startedAt: new Date().toISOString(),
    });

    setNewVloga({ name: "", email: "", role: "", customRole: "", amount: "" });
    fetchVloge();
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "vloge", id));
    fetchVloge();
  };

  const handleEdit = (vloga) => {
    setEditingId(vloga.id);
    setEditedData({ ...vloga });
  };

  const handleSave = async () => {
    await updateDoc(doc(db, "vloge", editingId), {
      ...editedData,
      amount: Number(editedData.amount),
    });
    setEditingId(null);
    fetchVloge();
  };

  const handleRetire = async (vloga) => {
    await addDoc(collection(db, "retiredVloge"), {
      ...vloga,
      retiredAt: new Date().toISOString(),
    });
    await deleteDoc(doc(db, "vloge", vloga.id));
    fetchVloge();
    fetchRetired();
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card sx={{ p: 3 }}>
              <MDTypography variant="h5" mb={2}>
                Uredi vloge
              </MDTypography>

              {/* Input Form */}
              <Grid container spacing={2} mb={3}>
                <Grid item xs={12} md={3}>
                  <MDInput
                    label="Ime osebe"
                    value={newVloga.name}
                    onChange={(e) => setNewVloga({ ...newVloga, name: e.target.value })}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <MDInput
                    label="Email"
                    value={newVloga.email}
                    onChange={(e) => setNewVloga({ ...newVloga, email: e.target.value })}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <select
                    value={newVloga.role}
                    onChange={(e) => setNewVloga({ ...newVloga, role: e.target.value })}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px" }}
                  >
                    <option value="">Izberi vlogo</option>
                    {predefinedRoles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                  {newVloga.role === "drugo" && (
                    <MDInput
                      label="Vnesi drugo vlogo"
                      value={newVloga.customRole}
                      onChange={(e) => setNewVloga({ ...newVloga, customRole: e.target.value })}
                      fullWidth
                      sx={{ mt: 1 }}
                    />
                  )}
                </Grid>
                <Grid item xs={12} md={3}>
                  <MDInput
                    label="Znesek (€)"
                    type="number"
                    value={newVloga.amount}
                    onChange={(e) => setNewVloga({ ...newVloga, amount: e.target.value })}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                  <MDButton variant="gradient" color="info" onClick={handleAdd}>
                    Dodaj vlogo
                  </MDButton>
                </Grid>
              </Grid>

              {/* Active Roles Table */}
              <TableContainer component={Paper}>
                <Table>
                  <TableBody>
                    {vloge.map((v) => (
                      <TableRow key={v.id}>
                        {editingId === v.id ? (
                          <>
                            <TableCell>
                              <MDInput
                                value={editedData.name}
                                onChange={(e) =>
                                  setEditedData({ ...editedData, name: e.target.value })
                                }
                                fullWidth
                              />
                            </TableCell>
                            <TableCell>
                              <MDInput
                                value={editedData.email}
                                onChange={(e) =>
                                  setEditedData({ ...editedData, email: e.target.value })
                                }
                                fullWidth
                              />
                            </TableCell>
                            <TableCell>
                              <MDInput
                                value={editedData.role}
                                onChange={(e) =>
                                  setEditedData({ ...editedData, role: e.target.value })
                                }
                                fullWidth
                              />
                            </TableCell>
                            <TableCell>
                              <MDInput
                                type="number"
                                value={editedData.amount}
                                onChange={(e) =>
                                  setEditedData({ ...editedData, amount: e.target.value })
                                }
                                fullWidth
                              />
                            </TableCell>
                            <TableCell>
                              <IconButton color="success" onClick={handleSave}>
                                <SaveIcon />
                              </IconButton>
                            </TableCell>
                          </>
                        ) : (
                          <>
                            <TableCell>{v.name}</TableCell>
                            <TableCell>{v.email}</TableCell>
                            <TableCell>{v.role}</TableCell>
                            <TableCell>{v.amount}€</TableCell>
                            <TableCell>
                              <IconButton onClick={() => handleEdit(v)}>
                                <EditIcon />
                              </IconButton>
                              <IconButton onClick={() => handleDelete(v.id)}>
                                <DeleteIcon />
                              </IconButton>
                              <MDButton
                                size="small"
                                color="warning"
                                onClick={() => handleRetire(v)}
                                sx={{ ml: 1 }}
                              >
                                Upokoji
                              </MDButton>
                            </TableCell>
                          </>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Retired Roles Table */}
              <MDTypography variant="h5" mt={4} mb={2}>
                Upokojeni člani
              </MDTypography>
              <TableContainer component={Paper}>
                <Table>
                  <TableBody>
                    {retired.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell>{r.name}</TableCell>
                        <TableCell>{r.email}</TableCell>
                        <TableCell>{r.role}</TableCell>
                        <TableCell>{r.amount}€</TableCell>
                        <TableCell>
                          {r.startedAt ? new Date(r.startedAt).toLocaleDateString() : "-"}
                        </TableCell>
                        <TableCell>
                          {r.retiredAt ? new Date(r.retiredAt).toLocaleDateString() : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default UrediVloge;
