import { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";

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

const couponList = [
  { id: 0, name: "Pivnica Savinja", image: img1, maxQuantity: 1 },
  { id: 1, name: "Pica", image: img2, maxQuantity: 2 },
  { id: 2, name: "Kava", image: img3, maxQuantity: 2 },
  { id: 3, name: "Kosilo", image: img4, maxQuantity: 1 },
  { id: 4, name: "Sok", image: img5, maxQuantity: 2 },
  { id: 5, name: "Sladoled", image: img6, maxQuantity: 2 },
];

function UradneUre() {
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [couponDialogOpen, setCouponDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [selectedCoupons, setSelectedCoupons] = useState({});
  const [customerUsage, setCustomerUsage] = useState({});
  const [couponCheckDone, setCouponCheckDone] = useState(false);

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

  const handleStartClick = () => {
    const now = new Date().toISOString();
    setStartTime(now);
    setElapsedTime(0);
  };

  const handleEndClick = () => setOpenDialog(true);

  const handleDialogClose = async () => {
    if (!name.trim()) return;
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
    setOpenDialog(false);
    setName("");
  };

  const checkCustomerCoupons = async () => {
    if (!customerName.trim() || couponCheckDone) return;

    try {
      const now = new Date();
      const kuponiRef = collection(db, "kuponi");
      const q = query(kuponiRef, where("customerName", "==", customerName.trim()));
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
        issuedBy: name || "neznano",
        time: new Date().toISOString(),
        coupons: selectedDetails,
      });

      setCustomerName("");
      setSelectedCoupons({});
      setCustomerUsage({});
      setCouponDialogOpen(false);
      setCouponCheckDone(false);
    } catch (err) {
      console.error("Napaka pri shranjevanju kuponov:", err);
    }
  };

  const formatTime = (seconds) => {
    const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox mt={6} mb={3}>
        <Grid container justifyContent="center">
          <Grid item xs={12} md={8} lg={6}>
            <Card>
              <MDBox p={3} textAlign="center">
                <MDTypography variant="h4" gutterBottom>
                  URADNE URE
                </MDTypography>

                {startTime ? (
                  <>
                    <MDTypography variant="h6" mt={2}>
                      Aktivno: {formatTime(elapsedTime)}
                    </MDTypography>

                    <MDButton
                      variant="outlined"
                      color="info"
                      onClick={() => setCouponDialogOpen(true)}
                      sx={{ mt: 2, mb: 2 }}
                    >
                      Izdaj kupone
                    </MDButton>

                    <MDButton
                      variant="outlined"
                      color="error"
                      onClick={handleEndClick}
                      sx={{ mb: 3 }}
                    >
                      Končaj uradne ure
                    </MDButton>
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

      {/* Zaključek ure dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Zaključi uradne ure</DialogTitle>
        <DialogContent>
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
          <Button onClick={() => setOpenDialog(false)}>Prekliči</Button>
          <Button onClick={handleDialogClose}>Potrdi</Button>
        </DialogActions>
      </Dialog>

      {/* Kuponi dialog */}
      <Dialog
        open={couponDialogOpen}
        onClose={() => setCouponDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Izdaj kupone</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Ime stranke"
            margin="dense"
            value={customerName}
            onChange={(e) => {
              setCustomerName(e.target.value);
              setCouponCheckDone(false);
            }}
            onBlur={checkCustomerCoupons}
          />
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
                    title={
                      maxReached
                        ? `Stranka je že dosegla mesečno mejo za "${coupon.name}"`
                        : `Klikni za dodajanje "${coupon.name}"`
                    }
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
    </DashboardLayout>
  );
}

export default UradneUre;
