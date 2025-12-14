import Mailjet from "node-mailjet";

const mailjet = Mailjet.apiConnect(process.env.MJ_APIKEY_PUBLIC, process.env.MJ_APIKEY_PRIVATE);

if (!process.env.MJ_APIKEY_PUBLIC || !process.env.MJ_APIKEY_PRIVATE) {
  console.error("Mailjet API keys are missing");
}

export const sendApprovalMail = async (userEmail, userName) => {
  try {
    await mailjet.post("send", { version: "v3.1" }).request({
      Messages: [
        {
          From: {
            Email: "drustvo.lak@gmail.com",
            Name: "KlubPlus",
          },
          To: [
            {
              Email: userEmail,
              Name: userName,
            },
          ],
          Subject: "Tvoja prijava je odobrena",
          HTMLPart: `
            <h3>Pozdravljen ${userName}</h3>
            <p>Tvoja prijava v aplikacijo je bila uspešno odobrena!</p>
            <p>Lep pozdrav,<br>Ekipa LAK-a</p>
          `,
        },
      ],
    });

    console.log("Approval mail sent to:", userEmail);
  } catch (err) {
    console.error("Mailjet approval error:", err);
  }
};

export const sendRejectionMail = async (userEmail, userName) => {
  try {
    await mailjet.post("send", { version: "v3.1" }).request({
      Messages: [
        {
          From: {
            Email: "drustvo.lak@gmail.com",
            Name: "KlubPlus",
          },
          To: [
            {
              Email: userEmail,
              Name: userName,
            },
          ],
          Subject: "Tvoja prijava je zavrnjena",
          HTMLPart: `
            <h3>Pozdravljen ${userName}</h3>
            <p>Žal tvoja prijava v aplikacijo ni bila odobrena.</p>
            <p>Če želiš več informacij, nas lahko kontaktiraš.</p>
            <p>Lep pozdrav,<br>Ekipa LAK-a</p>
          `,
        },
      ],
    });

    console.log("Rejection mail sent to:", userEmail);
  } catch (err) {
    console.error("Mailjet rejection error:", err);
  }
};
