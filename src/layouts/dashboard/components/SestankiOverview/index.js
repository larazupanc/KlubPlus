import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "firebaseConfig";

import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import Button from "@mui/material/Button";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import TimelineItem from "examples/Timeline/TimelineItem";

function SestankiOverview() {
  const [sestanki, setSestanki] = useState([]);
  const [sortOrderAsc, setSortOrderAsc] = useState(true);

  useEffect(() => {
    const fetchSestanki = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "sestanki"));
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSestanki(data);
      } catch (err) {
        console.error("Napaka pri branju sestankov:", err);
      }
    };

    fetchSestanki();
  }, []);

  const getColorByTopic = (topic) => {
    const lower = (topic || "").toLowerCase();
    if (lower.includes("šport") || lower.includes("sport")) return "success"; // green
    if (lower.includes("zabava")) return "error"; // pink
    if (lower.includes("izobrazevanje")) return "info"; // blue
    if (lower.includes("dobrodelnost")) return "warning"; // orange
    return "secondary"; // yellow/other
  };

  const parseDateTime = (date, time) => {
    const d = date || "1970-01-01";
    const t = time || "00:00";
    return new Date(`${d}T${t}`);
  };

  const sortedSestanki = [...sestanki].sort((a, b) => {
    const aDate = parseDateTime(a.date, a.startTime);
    const bDate = parseDateTime(b.date, b.startTime);
    return sortOrderAsc ? aDate - bDate : bDate - aDate;
  });

  const toggleSortOrder = () => {
    setSortOrderAsc(!sortOrderAsc);
  };

  return (
    <Card sx={{ height: "100%" }}>
      <MDBox pt={3} px={3} display="flex" justifyContent="space-between" alignItems="center">
        <MDTypography variant="h6" fontWeight="medium">
          Pregled sestankov
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
            {sestanki.length}
          </MDTypography>{" "}
          sestankov
        </MDTypography>
      </MDBox>
      <MDBox p={2}>
        {sortedSestanki.map((sestanek, index) => (
          <TimelineItem
            key={sestanek.id}
            color={getColorByTopic(sestanek.topic)}
            icon="event"
            title={sestanek.title || "Brez naslova"}
            dateTime={`${sestanek.date || "Neznan datum"} ${sestanek.startTime || ""}`}
            lastItem={index === sortedSestanki.length - 1}
          />
        ))}
      </MDBox>
    </Card>
  );
}

export default SestankiOverview;
