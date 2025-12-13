import Mailjet from "node-mailjet";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

console.log("PUBLIC:", process.env.MJ_APIKEY_PUBLIC);
console.log("PRIVATE:", process.env.MJ_APIKEY_PRIVATE);

const mailjet = Mailjet.apiConnect(process.env.MJ_APIKEY_PUBLIC, process.env.MJ_APIKEY_PRIVATE);

export const sendApprovalMail = async (userEmail, userName) => {
  console.log("Posiljam mail na:", userEmail, userName);
  try {
    const result = await mailjet.post("send", { version: "v3.1" }).request({
      Messages: [
        {
          From: { Email: "drustvo.lak@gmail.com", Name: "KlubPlus" },
          To: [{ Email: userEmail, Name: userName }],
          Subject: "Tvoja prijava je odobrena",
          HTMLPart: `<h3>Pozdravljen ${userName} </h3>
                       <p>Tvoja prijava v aplikacijo je bila uspešno odobrena!</p>
                       <p>Lep pozdrav,<br>Ekipa LAK-a</p>`,
        },
      ],
    });
    console.log("Mail poslan:", result.body);
  } catch (err) {
    console.error("Napaka pri pošiljanju e-pošte:", err.message);
  }
};
export const sendRejectionMail = async (userEmail, userName) => {
  console.log("Pošiljam ZAVRNITEV na:", userEmail, userName);
  try {
    const result = await mailjet.post("send", { version: "v3.1" }).request({
      Messages: [
        {
          From: { Email: "drustvo.lak@gmail.com", Name: "KlubPlus" },
          To: [{ Email: userEmail, Name: userName }],
          Subject: "Tvoja prijava je zavrnjena",
          HTMLPart: `<h3>Pozdravljen ${userName}</h3>
                       <p>Žal tvoja prijava v aplikacijo ni bila odobrena.</p>
                       <p>Če želiš več informacij, nas lahko kontaktiraš.</p>
                       <p>Lep pozdrav,<br>Ekipa LAK-a</p>`,
        },
      ],
    });

    console.log("Zavrnitev poslana:", result.body);
  } catch (err) {
    console.error("Napaka pri pošiljanju zavrnitve:", err.message);
  }
};
