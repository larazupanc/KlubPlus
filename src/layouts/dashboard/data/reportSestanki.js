import { collection, getDocs } from "firebase/firestore";
import { db } from "firebaseConfig";

const reportSestanki = async () => {
  const thisYear = new Date().getFullYear();
  const monthlyMeetings = Array(12).fill(null);

  const snapshot = await getDocs(collection(db, "sestanki"));

  snapshot.docs.forEach((doc) => {
    const data = doc.data();
    const date = data.date?.toDate?.() || new Date(data.date);
    if (date.getFullYear() === thisYear) {
      const month = date.getMonth();
      monthlyMeetings[month] = (monthlyMeetings[month] || 0) + 1;
    }
  });

  return {
    labels: ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"],
    datasets: [
      {
        label: "Sestanki mesečno",
        data: monthlyMeetings,
      },
    ],
  };
};

export default reportSestanki;
