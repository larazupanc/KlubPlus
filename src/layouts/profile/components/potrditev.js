import { useState, useEffect } from "react";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "firebaseConfig";
import Card from "@mui/material/Card";
import Switch from "@mui/material/Switch";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import MDTypography from "components/MDTypography";
import MDBox from "components/MDBox";

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

  const handleApprovalToggle = async (userId, currentStatus) => {
    await updateDoc(doc(db, "uporabniki", userId), {
      approved: !currentStatus,
    });

    setUsers((prevUsers) =>
      prevUsers.map((user) => (user.id === userId ? { ...user, approved: !currentStatus } : user))
    );
  };

  return (
    <Card sx={{ mt: 4, p: 2 }}>
      <MDTypography variant="h6" gutterBottom>
        Upravljanje uporabnikov
      </MDTypography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Ime</TableCell>
            <TableCell>E-pošta</TableCell>
            <TableCell>Odobren</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Switch
                  checked={user.approved || false}
                  onChange={() => handleApprovalToggle(user.id, user.approved)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
export default UserApprovalPanel;
