const admin = require("firebase-admin");

if (!admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } catch (error) {
    console.error("Firebase initialization error:", error);
  }
}

const smartMessages = [
  'ব্যালেন্স মেলালেন তো?! না মেলালে পরে পস্তাতে হবে কিন্তু 😅',
  'আজকের খরচের হিসাব Ledger অ্যাপে টুকে রেখেছেন তো?',
  'টুকটাক যা খরচ হয়েছে মনে করে এখনই এন্ট্রি করে নিন!',
  'আপনার ফিনান্সিয়াল ট্র্যাকিংয়ে আজকে গ্যাপ পড়লো! হিসাব মিলিয়ে নিন 🧐',
  'টাকা কি গাছের পাতা? হিসাব না রাখলে কিন্তু বিপদ! 💸'
];

export default async function handler(req, res) {
  // We only allow GET requests (which Vercel's Cron triggers)
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const db = admin.firestore();
  const options = { timeZone: 'Asia/Dhaka', year: 'numeric', month: '2-digit', day: '2-digit' };
  const formatter = new Intl.DateTimeFormat('en-CA', options); 
  const todayStr = formatter.format(new Date());

  try {
    const usersSnapshot = await db.collection("users").get();
    const notifications = [];

    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      const uid = userDoc.id;
      const token = userData.fcmToken;

      if (!token) continue;

      const txnsSnapshot = await db
        .collection("transactions")
        .where("uid", "==", uid)
        .where("date", "==", todayStr)
        .limit(1)
        .get();

      if (txnsSnapshot.empty) {
        const randomMsg = smartMessages[Math.floor(Math.random() * smartMessages.length)];
        const payload = {
          token: token,
          notification: {
            title: "Ledger Reminder 📅",
            body: randomMsg,
          }
        };
        notifications.push(admin.messaging().send(payload));
      }
    }

    if (notifications.length > 0) {
      await Promise.allSettled(notifications);
    }

    return res.status(200).json({ success: true, sent: notifications.length });
  } catch (error) {
    console.error("Cron Error:", error);
    return res.status(500).json({ error: error.message });
  }
}