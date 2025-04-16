// controllers/authController.js
const { auth, db } = require('../config/firebase');

exports.register = async (req, res) => {
  try {
    const { email, password, name, phone, role = 'customer' } = req.body;
    
    // Create user in Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name,
    });
    
    // Store additional user data in Firestore
    await db.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      name,
      email,
      phone,
      role,
      createdAt: new Date().toISOString(),
    });
    
    res.status(201).json({ message: 'User registered successfully', userId: userRecord.uid });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(400).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  // Note: Actual authentication is handled by Firebase client SDK
  // This endpoint can be used for custom token creation if needed
  try {
    const { email, password } = req.body;
    
    // For custom token creation:
    // const userRecord = await auth.getUserByEmail(email);
    // const customToken = await auth.createCustomToken(userRecord.uid);
    
    res.status(200).json({ 
      message: 'Login endpoint - Authentication should be handled by Firebase client SDK'
    });
  } catch (error) {
    console.error('Error in login endpoint:', error);
    res.status(400).json({ error: error.message });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.user.uid;
    
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const userData = userDoc.data();
    delete userData.password; // Ensure password is not sent to client
    
    res.status(200).json(userData);
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { name, phone } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    
    await db.collection('users').doc(userId).update({
      ...updateData,
      updatedAt: new Date().toISOString()
    });
    
    res.status(200).json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: error.message });
  }
};
