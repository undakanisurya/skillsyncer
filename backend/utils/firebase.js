const admin = require('firebase-admin');

// Initialize Firebase Admin SDK only once
if (!admin.apps.length) {
  try {
    let credential;

    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      // Option 1: Full service account JSON in env var
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      credential = admin.credential.cert(serviceAccount);
    } else if (
      process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY
    ) {
      // Option 2: Individual fields provided via env vars
      const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
      credential = admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey,
      });
    } else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
      // Option 3: Load service account JSON from a file path
      try {
        const fs = require('fs');
        const path = require('path');
        const saPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
        const resolvedPath = path.resolve(saPath);
        const content = JSON.parse(fs.readFileSync(resolvedPath, 'utf8'));
        credential = admin.credential.cert(content);
        console.log(`✅ Loaded Firebase service account from file: ${resolvedPath}`);
      } catch (e) {
        console.error('❌ Failed reading FIREBASE_SERVICE_ACCOUNT_PATH:', e.message);
      }
    } else {
      console.warn('⚠️ Firebase Admin not fully configured. Set FIREBASE_SERVICE_ACCOUNT or FIREBASE_* vars.');
    }

    if (credential) {
      admin.initializeApp({ credential });
      console.log('✅ Firebase Admin initialized');
    }
  } catch (err) {
    console.error('❌ Failed to initialize Firebase Admin:', err.message);
  }
}

module.exports = admin;