import { collection, getDocs } from "firebase/firestore";
import { db } from "firebaseConfig";

const reportDogodki = async () => {
  const thisYear = new Date().getFullYear();
  const monthlyEvents = Array(12).fill(0);

  const snapshot = await getDocs(collection(db, "projekti"));

  snapshot.docs.forEach((doc) => {
    const data = doc.data();
    const date = data.datum?.toDate?.() || new Date(data.datum);
    if (date.getFullYear() === thisYear) {
      monthlyEvents[date.getMonth()]++;
    }
  });

  return {
    labels: ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"],
    datasets: [
      {
        label: "Dogodki na mesec",
        data: monthlyEvents,
        fill: false,
        borderColor: "#4caf50",
        tension: 0.4,
      },
    ],
  };
};

export default reportDogodki;
