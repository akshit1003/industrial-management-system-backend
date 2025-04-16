const path = require("path");
const admin = require("firebase-admin");

// Log the paths to help with debugging
// console.log("Service Account Path:", path.resolve(__dirname, "../ServiceAccountKey.json"));
// console.log("Current Working Directory:", process.cwd());

// Initialize Firebase Admin
let app, db, auth, storage;

try {
  // Load the service account file
  const serviceAccount = require(path.resolve(__dirname, "../ServiceAccountKey.json"));
  console.log("Service Account loaded successfully");
  console.log("Project ID:", serviceAccount.project_id);

  // Initialize Firebase Admin
  app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "industrial-management-sy-6b3fd.appspot.com",
  });
  console.log("Firebase Admin initialized successfully");

  // Initialize Firestore
  db = admin.firestore();

  // Initialize Firebase Auth
  auth = admin.auth();

  // Initialize Firebase Storage
  storage = admin.storage();
} catch (error) {
  console.error(
    "Error loading service account or initializing Firebase:",
    error
  );
  // You might want to throw the error here to prevent the app from continuing
  // with uninitialized Firebase services
  throw error;
}

module.exports = { app, db, auth, storage };
