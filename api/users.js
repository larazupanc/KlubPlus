import express from "express";
import cors from "cors";
import userRoutes from "../src/routes/users.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.text());

app.use("/api/users", userRoutes);

export default app;
