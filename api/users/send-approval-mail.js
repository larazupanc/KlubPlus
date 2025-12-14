import { sendApprovalMail } from "../../src/services/mailService";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, name } = req.body;

  if (!email || !name) {
    return res.status(400).json({ error: "Missing email or name" });
  }

  try {
    await sendApprovalMail(email, name);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Mail error:", err);
    return res.status(500).json({ error: "Mail failed" });
  }
}
