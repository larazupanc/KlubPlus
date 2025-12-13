import express from "express";
import { sendApprovalMail, sendRejectionMail } from "../services/mailService.js";

const router = express.Router();

router.post("/send-approval-mail", async (req, res) => {
  let body = req.body;

  try {
    if (typeof body === "string") {
      body = JSON.parse(body);
    }
  } catch {
    return res.status(400).json({ error: "Invalid JSON body" });
  }

  console.log("🧩 req.body:", body);
  const { email, name } = body;

  console.log("📨 Pošiljam ODOBRITEV na:", email, name);
  try {
    await sendApprovalMail(email, name);
    res.json({ success: true });
  } catch (error) {
    console.error("Napaka pri pošiljanju aprovation maila:", error);
    res.status(500).json({ error: "Napaka pri pošiljanju e-pošte" });
  }
});

// ❌ ZAVRNITEV UPORABNIKA
router.post("/send-rejection-mail", async (req, res) => {
  let body = req.body;

  try {
    if (typeof body === "string") {
      body = JSON.parse(body);
    }
  } catch {
    return res.status(400).json({ error: "Invalid JSON body" });
  }

  const { email, name } = body;
  console.log("📨 Pošiljam ZAVRNITEV na:", email, name);

  try {
    await sendRejectionMail(email, name);
    res.json({ success: true });
  } catch (error) {
    console.error("Napaka pri pošiljanju REJECTION maila:", error);
    res.status(500).json({ error: "Napaka pri pošiljanju zavrnitvene e-pošte" });
  }
});

export default router;
