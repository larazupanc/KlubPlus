import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC--7URBv6q3dIMchfnz5S6e1fA4XJ-m3w",
  authDomain: "klubplusonline.firebaseapp.com",
  projectId: "klubplusonline",
  storageBucket: "klubplusonline.appspot.com",
  messagingSenderId: "301589391630",
  appId: "1:301589391630:web:b25e37e0cea38f1b2c0f5f",
  measurementId: "G-2LM1VFX5KM",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

const analytics = getAnalytics(app);
const db = getFirestore(app);
export { db };
