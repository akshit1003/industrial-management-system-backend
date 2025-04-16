// controllers/authController.js
const { db, auth: adminAuth } = require('../config/firebase');
const { initializeApp } = require('firebase/app');
const { 
  getAuth, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword 
} = require('firebase/auth');
require('dotenv').config();


// Initialize Firebase client SDK
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

const clientApp = initializeApp(firebaseConfig, 'clientApp');
const clientAuth = getAuth(clientApp);


exports.register = async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email, password, and name are required' 
      });
    }

    // Create user with Firebase client SDK
    const userCredential = await createUserWithEmailAndPassword(clientAuth, email, password);
    const user = userCredential.user;
    
    // Update profile display name
    await adminAuth.updateUser(user.uid, {
      displayName: name
    });

    // Store additional user data in Firestore
    await db.collection('users').doc(user.uid).set({
      email,
      name,
      role: role || 'customer',
      createdAt: new Date()
    });

    // Get ID token
    const idToken = await user.getIdToken();

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        uid: user.uid,
        email: user.email,
        name,
        role: role || 'customer'
      },
      token: idToken
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to register user'
    });
  }
};

/**
 * Login user with email and password
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }

    // Sign in with Firebase client SDK
    const userCredential = await signInWithEmailAndPassword(clientAuth, email, password);
    const user = userCredential.user;
    
    // Get user data from Firestore
    const userDoc = await db.collection('users').doc(user.uid).get();
    let userData = {};
    
    if (userDoc.exists) {
      userData = userDoc.data();
    } else {
      // Create user document if it doesn't exist
      userData = { 
        email: user.email,
        name: user.displayName || email.split('@')[0],
        role: 'customer',
        createdAt: new Date()
      };
      
      await db.collection('users').doc(user.uid).set(userData);
    }

    // Get ID token
    const idToken = await user.getIdToken();
    
    // Set custom claims if needed (for role-based auth)
    if (userData.role === 'admin' && (!user.customClaims || !user.customClaims.admin)) {
      await adminAuth.setCustomUserClaims(user.uid, { admin: true, role: 'admin' });
    }

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        uid: user.uid,
        email: user.email,
        name: userData.name,
        role: userData.role
      },
      token: idToken
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }
};

/**
 * Get user profile information
 */
exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.user.uid;
    
    // Get user data from Firestore
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const userData = userDoc.data();
    
    return res.status(200).json({
      success: true,
      user: {
        uid: userId,
        email: userData.email,
        name: userData.name,
        role: userData.role || 'user',
        ...userData
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve user profile'
    });
  }
};

/**
 * Update user profile information
 */
exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { name, phone, address } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;
    
    // Update user in Firestore
    await db.collection('users').doc(userId).update({
      ...updateData,
      updatedAt: new Date()
    });
    
    // If name is updated, also update in Firebase Auth
    if (name) {
      await adminAuth.updateUser(userId, {
        displayName: name
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update user profile'
    });
  }
};