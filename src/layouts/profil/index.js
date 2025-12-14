import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Card, Button } from "@mui/material";

import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "firebaseConfig";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

import breakpoints from "assets/theme/base/breakpoints";
import backgroundImage from "assets/images/ozadje.jpg";

function Header({ children }) {
  const [tabsOrientation, setTabsOrientation] = useState("horizontal");

  useEffect(() => {
    function handleTabsOrientation() {
      return window.innerWidth < breakpoints.values.sm
        ? setTabsOrientation("vertical")
        : setTabsOrientation("horizontal");
    }

    window.addEventListener("resize", handleTabsOrientation);
    handleTabsOrientation();
    return () => window.removeEventListener("resize", handleTabsOrientation);
  }, []);

  return (
    <MDBox position="relative" mb={5}>
      <MDBox
        display="flex"
        alignItems="center"
        position="relative"
        minHeight="18.75rem"
        borderRadius="xl"
        sx={{
          backgroundImage: ({ functions: { rgba, linearGradient }, palette: { gradients } }) =>
            `${linearGradient(
              rgba(gradients.info.main, 0.6),
              rgba(gradients.info.state, 0.6)
            )}, url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "50%",
          overflow: "hidden",
        }}
      />
      <Card>{children}</Card>
    </MDBox>
  );
}
Header.defaultProps = { children: "" };
Header.propTypes = { children: PropTypes.node };

function UserApprovalPanel() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const querySnapshot = await getDocs(collection(db, "uporabniki"));
      const userList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(userList);
    };

    fetchUsers();
  }, []);

  const handleUserAction = async (userId, newStatus, email, name) => {
    await updateDoc(doc(db, "uporabniki", userId), { status: newStatus });

    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u)));

    const endpoint =
      newStatus === "approved" ? "/api/users/send-approval-mail" : "/api/users/send-rejection-mail";

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
    } catch (err) {
      console.error("Napaka pri pošiljanju maila:", err);
    }
  };

  const columns = [
    { Header: "Ime", accessor: "name" },
    { Header: "E-pošta", accessor: "email" },
    { Header: "Dejanja", accessor: "actions" },
  ];

  const rows = users.map((user) => ({
    name: user.name,
    email: user.email,
    actions: (
      <>
        <Button
          variant="contained"
          color="success"
          size="small"
          onClick={() => handleUserAction(user.id, "approved", user.email, user.name)}
          disabled={user.status === "approved"}
          style={{ marginRight: "8px" }}
        >
          Odobri
        </Button>
        <Button
          variant="contained"
          color="error"
          size="small"
          onClick={() => handleUserAction(user.id, "rejected", user.email, user.name)}
          disabled={user.status === "rejected"}
        >
          Zavrni
        </Button>
      </>
    ),
  }));

  return (
    <Card sx={{ mt: 4, p: 2 }}>
      <MDTypography variant="h6" gutterBottom>
        Upravljanje uporabnikov
      </MDTypography>

      <DataTable
        table={{ columns, rows }}
        isSorted={false}
        entriesPerPage={false}
        showTotalEntries={false}
        noEndBorder
      />
    </Card>
  );
}

function Overview() {
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox mb={2} />
      <Header>
        <MDBox />
        <MDBox px={2} lineHeight={1.25}>
          <UserApprovalPanel />
        </MDBox>
        <MDBox p={2} />
      </Header>
      <Footer />
    </DashboardLayout>
  );
}

export default Overview;
