import { admin, db } from "../lib/firebaseAdmin.js";

async function addUser() {
  try {
    console.log("🚀 Adding user aditya@gmail.com...");

    // Create user in Firebase Auth
    const userRecord = await admin.auth().createUser({
      email: "aditya@gmail.com",
      password: "pass123456",
      displayName: "Aditya",
    });

    console.log("✅ Auth user created:", userRecord.uid);

    // Add user to Firestore
    const userData = {
      userId: userRecord.uid,
      email: "aditya@gmail.com",
      displayName: "Aditya",
      balance: 5000,
      phoneNumber: "+919876543210",
      isAdmin: false,
      bookingHistory: [],
      createdAt: new Date(),
    };

    await db.collection("users").doc(userRecord.uid).set(userData);
    console.log("✅ User added to Firestore:", userRecord.uid);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

addUser();
