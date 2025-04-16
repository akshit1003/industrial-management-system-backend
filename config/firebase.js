const admin = require("firebase-admin");
const dotenv = require("dotenv");

dotenv.config();

let app, db, auth, storage;

try {
  // Parse the service account key from the environment variable
  const rawServiceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}');

  if (rawServiceAccount.private_key && rawServiceAccount.private_key.includes("\\n")) {
    rawServiceAccount.private_key = rawServiceAccount.private_key.replace(/\\n/g, "\n");
  }

  // Initialize Firebase Admin
  app = admin.initializeApp({
    credential: admin.credential.cert(rawServiceAccount),
    storageBucket: `${rawServiceAccount.project_id}.appspot.com`,
  });

  console.log("Firebase Admin initialized successfully");

  // Initialize Firebase services
  db = admin.firestore();
  auth = admin.auth();
  storage = admin.storage();

} catch (error) {
  console.error("Error loading service account or initializing Firebase:", error);
  throw error;
}

module.exports = { app, db, auth, storage };
