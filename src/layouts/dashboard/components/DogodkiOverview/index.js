import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "firebaseConfig";

import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import Button from "@mui/material/Button";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import TimelineItem from "examples/Timeline/TimelineItem";

function ProjektiOverview() {
  const [projekti, setProjekti] = useState([]);
  const [sortOrderAsc, setSortOrderAsc] = useState(true);

  useEffect(() => {
    const fetchProjekti = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "projekti"));
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProjekti(data);
      } catch (err) {
        console.error("Napaka pri branju projektov:", err);
      }
    };

    fetchProjekti();
  }, []);

  const getColorByPodrocje = (podrocje) => {
    const lower = (podrocje || "").toLowerCase();
    if (lower.includes("šport") || lower.includes("sport")) return "success"; // green
    if (lower.includes("zabava")) return "error"; // pink/red
    if (lower.includes("izobrazevanje")) return "info"; // blue
    if (lower.includes("dobrodelnost")) return "warning"; // orange
    return "secondary"; // yellow for other
  };

  const parseDateTime = (datum, ura) => {
    const d = datum || "1970-01-01";
    const t = ura || "00:00";
    return new Date(`${d}T${t}`);
  };

  const sortedProjekti = [...projekti].sort((a, b) => {
    const aDate = parseDateTime(a.datum, a.ura);
    const bDate = parseDateTime(b.datum, b.ura);
    return sortOrderAsc ? aDate - bDate : bDate - aDate;
  });

  const toggleSortOrder = () => {
    setSortOrderAsc(!sortOrderAsc);
  };

  return (
    <Card sx={{ height: "100%" }}>
      <MDBox pt={3} px={3} display="flex" justifyContent="space-between" alignItems="center">
        <MDTypography variant="h6" fontWeight="medium">
          Pregled projektov
        </MDTypography>
        <Button variant="outlined" size="small" onClick={toggleSortOrder}>
          sortirano časovno {sortOrderAsc ? "↑" : "↓"}
        </Button>
      </MDBox>
      <MDBox px={3} mb={2}>
        <MDTypography variant="button" color="text" fontWeight="regular">
          <MDTypography display="inline" variant="body2" verticalAlign="middle">
            <Icon sx={{ color: ({ palette: { success } }) => success.main }}>arrow_upward</Icon>
          </MDTypography>
          &nbsp;
          <MDTypography variant="button" color="text" fontWeight="medium">
            {projekti.length}
          </MDTypography>{" "}
          projektov
        </MDTypography>
      </MDBox>
      <MDBox p={2}>
        {sortedProjekti.map((projekt, index) => (
          <TimelineItem
            key={projekt.id}
            color={getColorByPodrocje(projekt.podrocje)}
            icon="event"
            title={projekt.naziv || "Brez naslova"}
            dateTime={`${projekt.datum || "Neznan datum"} ${projekt.ura || ""}`}
            lastItem={index === sortedProjekti.length - 1}
          />
        ))}
      </MDBox>
    </Card>
  );
}

export default ProjektiOverview;
