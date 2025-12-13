import { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { useNavigate } from "react-router-dom";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

import { db } from "firebaseConfig";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { parseISO, isSameMonth } from "date-fns";

import img1 from "assets/images/1.png";
import img2 from "assets/images/2.png";
import img3 from "assets/images/3.png";
import img4 from "assets/images/4.png";
import img5 from "assets/images/5.png";
import img6 from "assets/images/6.png";
import img7 from "assets/images/7.png";
import img8 from "assets/images/8.png";
import img9 from "assets/images/9.png";
import img10 from "assets/images/10.png";

const couponList = [
  { id: 0, name: "Pivnica Savinja", image: img1, maxQuantity: 2 },
  { id: 1, name: "Picerija Špica Laško", image: img2, maxQuantity: 2 },
  { id: 2, name: "As bar Debro", image: img3, maxQuantity: 2 },
  { id: 3, name: "Karting Center Celje", image: img4, maxQuantity: 2 },
  { id: 4, name: "Vezava diplomske/magisterske naloge", image: img5, maxQuantity: 1 },
  { id: 5, name: "Cepljenje proti Klopnemu meningitisu", image: img6, maxQuantity: 1 },
  { id: 6, name: "Smučarska karta", image: img7, maxQuantity: 2 },
  { id: 7, name: "Cineplexx Celje", image: img8, maxQuantity: 2 },
  { id: 8, name: "Smučarska karta", image: img9, maxQuantity: 2 },
  { id: 9, name: "Smučarska karta", image: img10, maxQuantity: 2 },
];

function UradneUre() {
  const backgroundStyle = {
    backgroundImage:
      'url("https://drustvo-lak.si/wp-content/uploads/2018/06/30442526_1872977382722054_2501685945883951104_o.jpg")',
    backgroundSize: "cover",
    backgroundPosition: "center",
    minHeight: "100vh",
    width: "100%",
    position: "fixed",
    opacity: 0.1,
    top: 0,
    left: 0,
    zIndex: -1,
  };
  const [startTime, setStartTime] = useState(null);
  const navigate = useNavigate();

  const [elapsedTime, setElapsedTime] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [couponDialogOpen, setCouponDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [selectedCoupons, setSelectedCoupons] = useState({});
  const [customerUsage, setCustomerUsage] = useState({});
  const [couponCheckDone, setCouponCheckDone] = useState(false);
  const [showCustomerNameDialog, setShowCustomerNameDialog] = useState(false);
  const [issuedCouponsLog, setIssuedCouponsLog] = useState([]);
  const [note, setNote] = useState("");
  const [showSummaryDialog, setShowSummaryDialog] = useState(false);

  useEffect(() => {
    let interval;
    if (startTime) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - new Date(startTime)) / 1000));
      }, 1000);
      setTimerInterval(interval);
    }
    return () => clearInterval(interval);
  }, [startTime]);

  const handleStartClick = () => setOpenDialog(true);

  const handleDialogClose = async () => {
    if (!name.trim()) return;

    if (!startTime) {
      const now = new Date().toISOString();
      setStartTime(now);
      setElapsedTime(0);
    } else {
      const endTime = new Date().toISOString();
      const lengthInSeconds = Math.floor((new Date(endTime) - new Date(startTime)) / 1000);

      try {
        await addDoc(collection(db, "uradneUre"), {
          userName: name.trim(),
          startTime,
          endTime,
          lengthInSeconds,
          date: startTime.split("T")[0],
        });
      } catch (err) {
        console.error("Napaka pri shranjevanju:", err);
      }

      clearInterval(timerInterval);
      setStartTime(null);
      setElapsedTime(0);
      setIssuedCouponsLog([]);
    }

    setOpenDialog(false);
    setName("");
  };

  const handleCouponStart = () => {
    setCustomerName("");
    setCustomerUsage({});
    setSelectedCoupons({});
    setCouponCheckDone(false);
    setShowCustomerNameDialog(true);
  };

  const handleCustomerNameSubmit = () => {
    if (!customerName.trim()) return;
    checkCustomerCoupons();
    setCouponDialogOpen(true);
    setShowCustomerNameDialog(false);
  };

  const checkCustomerCoupons = async () => {
    if (!customerName.trim() || couponCheckDone) return;

    try {
      const now = new Date();
      const kuponiRef = collection(db, "kuponi");
      const q = query(
        kuponiRef,
        where("customerNameLower", "==", customerName.trim().toLowerCase())
      );
      const snapshot = await getDocs(q);

      const usage = {};
      snapshot.forEach((doc) => {
        const data = doc.data();
        const time = parseISO(data.time);

        if (isSameMonth(time, now)) {
          data.coupons.forEach((couponStr) => {
            const [name, qtyStr] = couponStr.split(" x");
            const qty = parseInt(qtyStr || "1", 10);
            usage[name.trim()] = (usage[name.trim()] || 0) + qty;
          });
        }
      });

      setCustomerUsage(usage);
      setCouponCheckDone(true);
    } catch (err) {
      console.error("Napaka pri preverjanju kuponov:", err);
    }
  };

  const handleCouponClick = (id) => {
    const coupon = couponList.find((c) => c.id === id);
    const currentQty = selectedCoupons[id] || 0;
    const alreadyUsed = customerUsage[coupon.name] || 0;

    if (alreadyUsed + currentQty < coupon.maxQuantity) {
      setSelectedCoupons({ ...selectedCoupons, [id]: currentQty + 1 });
    }
  };

  const handleSubmitCoupons = async () => {
    if (!customerName.trim() || Object.keys(selectedCoupons).length === 0) return;

    const selectedDetails = Object.entries(selectedCoupons).map(([id, qty]) => {
      const coupon = couponList.find((c) => c.id === parseInt(id));
      return `${coupon.name} x${qty}`;
    });

    try {
      await addDoc(collection(db, "kuponi"), {
        customerName: customerName.trim(),
        customerNameLower: customerName.trim().toLowerCase(),
        issuedBy: name || "neznano",
        time: new Date().toISOString(),
        coupons: selectedDetails,
      });

      setIssuedCouponsLog((prev) => [
        ...prev,
        { customer: customerName.trim(), coupons: selectedDetails },
      ]);

      setCustomerName("");
      setSelectedCoupons({});
      setCustomerUsage({});
      setCouponDialogOpen(false);
      setCouponCheckDone(false);
    } catch (err) {
      console.error("Napaka pri shranjevanju kuponov:", err);
    }
  };

  const handleEndClick = () => {
    setShowSummaryDialog(true);
  };

  const formatTime = (seconds) => {
    const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  return (
    <DashboardLayout>
      <div style={backgroundStyle} />

      <DashboardNavbar />
      <MDBox mt={6} mb={3}>
        <MDBox mt={4} mx={3}>
          <MDTypography variant="h4" fontWeight="bold" gutterBottom>
            Uradne ure
          </MDTypography>
          <MDTypography variant="body2" color="textPrimary" gutterBottom>
            Uradne ure potekajo vsak petek od 18:30 do 20:30 in v soboto od 10:00 do 12:00. Pred
            začetkom uradnih ur preveri, če so v pedalu vsi kupončki. Vsakemu članu na mesec
            pripada: 2 kupončka za špico, 2 za pivnico, 2 za kino, 2 za AS bar, 2 za Karting center
            Celje. Na leto pa: 30€ povračila za cepljenje proti klopnemu meningitisu, ter 30€ za
            vezavo diplomske/magistrske naloge.
          </MDTypography>
          <MDTypography variant="body2" color="textSecondary" mt={1} gutterBottom>
            Uradne ure začneš tako, da klikneš spodnji gumb.
          </MDTypography>
        </MDBox>

        <Grid container justifyContent="center">
          <Grid item xs={12} md={8} lg={6}>
            <Card>
              <MDBox p={3} textAlign="center">
                <MDTypography variant="h4" gutterBottom>
                  URADNE URE
                </MDTypography>

                {startTime ? (
                  <>
                    <MDTypography variant="h6" mt={2} mb={4}>
                      Aktivno: {formatTime(elapsedTime)}
                    </MDTypography>

                    <MDBox mt={4} position="relative" minHeight="120px">
                      <MDBox display="flex" justifyContent="center">
                        <MDButton
                          variant="contained"
                          color="info"
                          size="large"
                          onClick={handleCouponStart}
                          sx={{ px: 5, py: 2, fontSize: "1.1rem" }}
                        >
                          Izdaj kupone
                        </MDButton>
                      </MDBox>

                      <MDBox position="absolute" bottom={0} right={0} pr={2} pb={1}>
                        <MDButton
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={handleEndClick}
                        >
                          Končaj uradne ure
                        </MDButton>
                      </MDBox>
                    </MDBox>
                  </>
                ) : (
                  <MDButton variant="gradient" color="info" onClick={handleStartClick}>
                    Začni uradne ure
                  </MDButton>
                )}
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />

      {}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>{startTime ? "Zaključi uradne ure" : "Začni uradne ure"}</DialogTitle>
        <DialogContent>
          <MDTypography variant="body2" color="textSecondary" mb={2}>
            Tukaj vpiši svoje ime in priimek. Preveri dvakrat, če si vpisal pravilno. To se bo
            shranilo kot evidenca o uradnih urah. <br />
            <br />
            Med uradnimi urami za vsako stranko klikni <strong>Izdaj kupone</strong>, vpiši celotno
            ime stranke (ime in priimek) in izberi ustrezne kupone.
          </MDTypography>

          <TextField
            autoFocus
            margin="dense"
            label="Vaše ime"
            fullWidth
            variant="standard"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenDialog(false);
              setShowCustomerNameDialog(false);
              setCustomerName("");
              setCustomerUsage({});
              setSelectedCoupons({});
              setCouponCheckDone(false);
            }}
          >
            Prekliči
          </Button>

          <Button onClick={handleDialogClose}>Potrdi</Button>
        </DialogActions>
      </Dialog>

      {}
      <Dialog open={showCustomerNameDialog} onClose={() => setShowCustomerNameDialog(false)}>
        <DialogTitle>Vnesi ime stranke</DialogTitle>
        <DialogContent>
          <MDTypography variant="body2" color="textSecondary" mb={2}>
            Tukaj vpiši ime in priimek stranke. Preveri dvakrat, če si vpisal pravilno. Najprej ime
            potem priimek!
          </MDTypography>
          <TextField
            autoFocus
            margin="dense"
            label="Ime in priimek stranke"
            fullWidth
            variant="standard"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCustomerNameDialog(false)}>Prekliči</Button>
          <Button onClick={handleCustomerNameSubmit}>Naprej</Button>
        </DialogActions>
      </Dialog>

      {}
      <Dialog
        open={couponDialogOpen}
        onClose={() => setCouponDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Izdaj kupone</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 2 }}>
            {couponList.map((coupon) => {
              const alreadyUsed = customerUsage[coupon.name] || 0;
              const maxReached = alreadyUsed >= coupon.maxQuantity;

              return (
                <Grid item xs={6} key={coupon.id}>
                  <MDBox
                    component="button"
                    onClick={() => !maxReached && handleCouponClick(coupon.id)}
                    sx={{
                      width: "100%",
                      height: "120px",
                      backgroundColor: maxReached ? "#ddd" : "#f0f0f0",
                      backgroundImage: `url(${coupon.image})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      border: selectedCoupons[coupon.id] ? "4px solid #1976d2" : "none",
                      borderRadius: "12px",
                      cursor: maxReached ? "not-allowed" : "pointer",
                      opacity: maxReached ? 0.5 : 1,
                      boxShadow: 2,
                    }}
                  />
                  <MDTypography align="center" variant="body2" sx={{ mt: 1 }}>
                    {coupon.name}{" "}
                    {selectedCoupons[coupon.id] ? `x${selectedCoupons[coupon.id]}` : ""}
                  </MDTypography>
                </Grid>
              );
            })}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCouponDialogOpen(false)}>Prekliči</Button>
          <Button onClick={handleSubmitCoupons}>Shrani</Button>
        </DialogActions>
      </Dialog>

      {}
      <Dialog
        open={showSummaryDialog}
        onClose={() => setShowSummaryDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Povzetek izdanih kuponov</DialogTitle>
        <DialogContent dividers>
          {issuedCouponsLog.length === 0 ? (
            <MDTypography>Ni izdanih kuponov.</MDTypography>
          ) : (
            issuedCouponsLog.map((entry, idx) => (
              <MDBox key={idx} mb={3} p={2} border="1px solid #e0e0e0" borderRadius="12px">
                <MDTypography variant="h6" gutterBottom>
                  {entry.customer}
                </MDTypography>
                <MDBox component="ul" sx={{ pl: 3, mt: 1 }}>
                  {entry.coupons.map((c, i) => (
                    <li key={i}>
                      <MDTypography variant="body2">{c}</MDTypography>
                    </li>
                  ))}
                </MDBox>
              </MDBox>
            ))
          )}

          <MDBox mt={3}>
            <TextField
              label="Opomba"
              multiline
              rows={3}
              fullWidth
              variant="outlined"
              placeholder="Dodaj opombo..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </MDBox>
        </DialogContent>

        <DialogActions>
          <Button
            variant="contained"
            color="error"
            onClick={async () => {
              if (startTime) {
                const endTime = new Date().toISOString();
                const lengthInSeconds = Math.floor(
                  (new Date(endTime) - new Date(startTime)) / 1000
                );

                try {
                  await addDoc(collection(db, "uradneUre"), {
                    userName: name.trim(),
                    startTime,
                    endTime,
                    lengthInSeconds,
                    date: startTime.split("T")[0],
                    note,
                    issuedCoupons: issuedCouponsLog,
                  });
                } catch (err) {
                  console.error("Napaka pri shranjevanju:", err);
                }

                clearInterval(timerInterval);
                setStartTime(null);
                setElapsedTime(0);
                setIssuedCouponsLog([]);
                setNote("");
              }

              setShowSummaryDialog(false);
            }}
          >
            Zaključi uradne ure
          </Button>
        </DialogActions>
      </Dialog>
      <MDBox mt={3}>
        <MDButton variant="gradient" color="info" onClick={() => navigate("/zgodovinaUradnihUr")}>
          Zgodovina uradnih ur
        </MDButton>
      </MDBox>
    </DashboardLayout>
  );
}

export default UradneUre;
