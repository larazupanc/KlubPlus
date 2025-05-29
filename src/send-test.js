const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "zupanclara03@gmail.com",
    pass: "izxl vqiq rjwv fnip",
  },
});

const today = new Date();
const twoDaysFromNow = new Date(today);
twoDaysFromNow.setDate(today.getDate() + 1);
const twoDaysString = twoDaysFromNow.toISOString().split("T")[0];

db.collection("rezervacije")
  .where("date", "==", twoDaysString)
  .get()
  .then((snapshot) => {
    if (snapshot.empty) {
      console.log("Ni vv naslednjih dneh nobene.");
      return;
    }

    snapshot.forEach((doc) => {
      const data = doc.data();

      if (!data.email) {
        console.warn(`Ni :`, data);
        return; 
      }

      const mailOptions = {
        from: "zupanclara03@gmail.com",
        to: data.email,
        subject: "📅 Opomnik: Uradne ure čez 1 dan",
        text: `
Pozdravljeni ${data.name},

To je opomnik, da ste na vrsti za uradne ure čez 1 dan:

📅 Datum: ${data.date}  
🕒 Termin: ${data.slot}

Če na termin ne morete priti, nujno prej sporočite.

Lep pozdrav,  
Ekipa društva LAK
        `,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error(`Napaka pri pošiljanju e-pošte ${data.email}:`, error);
        } else {
          console.log(`E-pošta poslana na ${data.email}:`, info.response);
        }
      });
    });
  })
  .catch((err) => {
    console.error("Napaka pri branju iz fs:", err);
  });
