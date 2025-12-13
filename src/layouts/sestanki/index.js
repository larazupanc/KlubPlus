import { useState, useMemo } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import AddIcon from "@mui/icons-material/Add";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Box from "@mui/material/Box";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

import useSestankiData from "./data/sestankiData";
import SestankiForm from "./components/SestankiForm";

function Sestanki() {
  const backgroundStyle = {
    backgroundImage:
      'url("https://drustvo-lak.si/wp-content/uploads/2023/10/VOLITVE2324-scaled.jpg")',
    backgroundSize: "cover",
    backgroundPosition: "center",
    minHeight: "100vh",
    width: "100%",
    position: "fixed",
    opacity: 0.2,
    top: 0,
    left: 0,
    zIndex: -1,
  };

  const [refreshKey, setRefreshKey] = useState(0);
  const [editingMeeting, setEditingMeeting] = useState(null);
  const [openForm, setOpenForm] = useState(false);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState("asc");
  const [filterYear, setFilterYear] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterLeader, setFilterLeader] = useState("");
  const [filterPlace, setFilterPlace] = useState("");
  const [filterTitle, setFilterTitle] = useState("");

  const handleAddMeeting = () => {
    setEditingMeeting(null);
    setRefreshKey((prev) => prev + 1);
    setOpenForm(false);
  };

  const handleEditMeeting = (meeting) => {
    setEditingMeeting(meeting);
    setOpenForm(true);
  };

  const {
    columns: originalColumns,
    rows: allRows,
    filters: dynamicFilters,
    actionsMenu,
  } = useSestankiData(refreshKey, handleEditMeeting, {
    filterYear,
    filterMonth,
    filterLeader,
    filterPlace,
    filterTitle,
  });

  const { years = [], months = [], leaders = [], places = [], titles = [] } = dynamicFilters || {};
  const searchedRows = useMemo(() => {
    if (!searchText) return allRows;
    const q = searchText.toLowerCase();
    return allRows.filter((row) =>
      Object.values(row).some((val) => String(val).toLowerCase().includes(q))
    );
  }, [allRows, searchText]);

  const sortedRows = useMemo(() => {
    const copy = [...searchedRows];
    const getNumber = (str) => {
      const match = String(str).match(/^\d+/);
      return match ? parseInt(match[0], 10) : 0;
    };

    copy.sort((a, b) => {
      const aNum = getNumber(a.title || "");
      const bNum = getNumber(b.title || "");
      return sortOrder === "asc" ? aNum - bNum : bNum - aNum;
    });

    return copy;
  }, [searchedRows, sortOrder]);

  const pageCount = Math.max(1, Math.ceil(sortedRows.length / entriesPerPage));
  const paginatedRows = sortedRows.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );

  const handlePageChange = (_, value) => {
    setCurrentPage(value);
  };

  const columns = originalColumns.map((col) => {
    if (
      col.accessor === "title" ||
      col.accessor === "naziv" ||
      col.Header?.toLowerCase?.() === "naziv"
    ) {
      return {
        ...col,
        Header: (
          <MDButton
            variant="text"
            color="inherit"
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            sx={{ fontWeight: "bold" }}
          >
            Naziv {sortOrder === "asc" ? "↑" : "↓"}
          </MDButton>
        ),
      };
    }
    return col;
  });

  return (
    <DashboardLayout>
      <div style={backgroundStyle} />
      <DashboardNavbar />
      <Button
        variant="contained"
        color="info"
        onClick={() =>
          window.open(
            "https://drive.google.com/drive/folders/1JhrreQM3fF9CJDTHk-dB_JVpKPFYCoLX",
            "_blank"
          )
        }
        style={{ margin: "16px" }}
      >
        Pojdi na Google Drive
      </Button>

      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <MDBox
                mx={2}
                mt={-3}
                py={3}
                px={2}
                variant="gradient"
                bgColor="info"
                borderRadius="lg"
                coloredShadow="info"
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                flexWrap="wrap"
                gap={2}
              >
                <MDTypography variant="h6" color="white">
                  Tabela sestankov
                </MDTypography>

                <MDBox display="flex" gap={1} alignItems="center">
                  <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                    <Select
                      size="small"
                      value={filterYear}
                      onChange={(e) => {
                        setFilterYear(e.target.value);
                        setCurrentPage(1);
                      }}
                      displayEmpty
                      sx={{ background: "white", borderRadius: 1, minWidth: 100, minHeight: 35 }}
                    >
                      <MenuItem value="">Vsa leta</MenuItem>
                      {years.map((y) => (
                        <MenuItem key={y} value={y}>
                          {y}
                        </MenuItem>
                      ))}
                    </Select>

                    <Select
                      size="small"
                      value={filterMonth}
                      onChange={(e) => {
                        setFilterMonth(e.target.value);
                        setCurrentPage(1);
                      }}
                      displayEmpty
                      sx={{ background: "white", borderRadius: 1, minWidth: 100, minHeight: 35 }}
                    >
                      <MenuItem value="">Vsi meseci</MenuItem>
                      {months.map((m) => (
                        <MenuItem key={m.value} value={m.value}>
                          {m.label}
                        </MenuItem>
                      ))}
                    </Select>

                    <Select
                      size="small"
                      value={filterLeader}
                      onChange={(e) => {
                        setFilterLeader(e.target.value);
                        setCurrentPage(1);
                      }}
                      displayEmpty
                      sx={{ background: "white", borderRadius: 1, minWidth: 100, minHeight: 35 }}
                    >
                      <MenuItem value="">Vse vodje</MenuItem>
                      {leaders.map((l) => (
                        <MenuItem key={l} value={l}>
                          {l}
                        </MenuItem>
                      ))}
                    </Select>

                    <Select
                      size="small"
                      value={filterPlace}
                      onChange={(e) => {
                        setFilterPlace(e.target.value);
                        setCurrentPage(1);
                      }}
                      displayEmpty
                      sx={{ background: "white", borderRadius: 1, minWidth: 100, minHeight: 35 }}
                    >
                      <MenuItem value="">Vse lokacije</MenuItem>
                      {places.map((p) => (
                        <MenuItem key={p} value={p}>
                          {p}
                        </MenuItem>
                      ))}
                    </Select>

                    <Select
                      size="small"
                      value={filterTitle}
                      onChange={(e) => {
                        setFilterTitle(e.target.value);
                        setCurrentPage(1);
                      }}
                      displayEmpty
                      sx={{ background: "white", borderRadius: 1, minWidth: 100, minHeight: 35 }}
                    >
                      <MenuItem value="">Vsi nazivi</MenuItem>
                      {titles.map((t) => (
                        <MenuItem key={t} value={t}>
                          {t}
                        </MenuItem>
                      ))}
                    </Select>

                    <TextField
                      size="small"
                      placeholder="Išči..."
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      sx={{
                        borderRadius: 1,
                        height: "34px",
                        "& .MuiInputBase-input": { padding: "8px 8px" },
                        minWidth: 180,
                        background: "white",
                      }}
                    />
                  </Box>

                  <MDButton
                    variant="outlined"
                    color="white"
                    size="small"
                    onClick={() => setOpenForm(true)}
                    startIcon={<AddIcon />}
                  >
                    Dodaj sestanek
                  </MDButton>
                </MDBox>
              </MDBox>

              <MDBox pt={3}>
                <DataTable
                  table={{ columns, rows: paginatedRows }}
                  isSorted={false}
                  entriesPerPage={false}
                  showTotalEntries={false}
                  noEndBorder
                />
                {actionsMenu}
              </MDBox>

              <MDBox pb={3} display="flex" justifyContent="center" alignItems="center" gap={2}>
                <Box>
                  <label style={{ marginRight: 8, fontSize: "12px" }}>Sestankov na strani:</label>
                  <Select
                    size="small"
                    value={entriesPerPage}
                    onChange={(e) => {
                      setEntriesPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    sx={{ background: "white", borderRadius: 1, minWidth: 80 }}
                  >
                    <MenuItem value={5}>5</MenuItem>
                    <MenuItem value={10}>10</MenuItem>
                    <MenuItem value={25}>25</MenuItem>
                    <MenuItem value={50}>50</MenuItem>
                  </Select>
                </Box>

                {pageCount > 1 && (
                  <Stack spacing={2}>
                    <Pagination
                      count={pageCount}
                      page={currentPage}
                      onChange={handlePageChange}
                      color="secondary"
                    />
                  </Stack>
                )}
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>

      <Dialog open={openForm} onClose={() => setOpenForm(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingMeeting ? "" : ""}</DialogTitle>
        <DialogContent>
          <SestankiForm onAdd={handleAddMeeting} editingMeeting={editingMeeting} />
        </DialogContent>
      </Dialog>

      <Footer />
    </DashboardLayout>
  );
}

export default Sestanki;
