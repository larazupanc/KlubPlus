import express from "express";
import cors from "cors";
import userRoutes from "./src/routes/users.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.text());

app.use("/api/users", userRoutes);

app.listen(5000, () => console.log("Server teče na http://localhost:5000"));
