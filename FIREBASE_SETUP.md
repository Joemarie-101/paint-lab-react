# Firebase Setup Guide

## Error: auth/configuration-not-found

This error occurs when Firebase Authentication is not properly configured in your Firebase Console.

## Steps to Fix:

### 1. Enable Firebase Authentication

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **joe-s-paint-lab**
3. Click on **Authentication** in the left sidebar
4. Click on **Get Started** (if you haven't enabled Auth yet)
5. Click on the **Sign-in method** tab

### 2. Enable Email/Password Authentication

1. In the Sign-in method tab, find **Email/Password**
2. Click on **Email/Password**
3. **Enable** the Email/Password provider:
   - Toggle "Enable" to ON
   - Optionally enable "Email link (passwordless sign-in)" if desired
4. Click **Save**

### 3. Verify Your Firebase Configuration

Make sure your `src/firebase/config.js` has the correct configuration:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyChAlrhbUYP2L0gEyqV9PyyYN9PC2eQmeM",
  authDomain: "joe-s-paint-lab.firebaseapp.com",
  projectId: "joe-s-paint-lab",
  storageBucket: "joe-s-paint-lab.firebasestorage.app",
  messagingSenderId: "218713066693",
  appId: "1:218713066693:web:18748abd1fd153f4c2b4ac"
};
```

### 4. Test the Connection

After enabling Email/Password authentication:

1. Restart your React app (`npm start`)
2. Try registering a new user
3. Try logging in with an existing user

## Additional Setup (Optional)

### Enable Firestore Database

1. Go to **Firestore Database** in Firebase Console
2. Click **Create database**
3. Start in **test mode** (for development)
4. Select a location for your database
5. Click **Enable**

### Set Up Firestore Security Rules

For development, you can use these rules (update later for production):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read/write their own color data
    match /colorMix/{colorId} {
      allow read, write: if request.auth != null && 
        request.resource.data.userId == request.auth.uid;
    }
    
    // Allow users to read brand colors
    match /brandColors/{brandId} {
      allow read: if request.auth != null;
    }
  }
}
```

## Troubleshooting

### Still Getting Errors?

1. **Clear browser cache** and restart the app
2. **Check browser console** for detailed error messages
3. **Verify** that Email/Password is enabled in Firebase Console
4. **Check** that your Firebase project ID matches in the config
5. **Ensure** you're using the correct Firebase project

### Common Issues

- **"auth/configuration-not-found"**: Email/Password not enabled in Firebase Console
- **"auth/operation-not-allowed"**: Email/Password provider is disabled
- **"auth/invalid-api-key"**: Check your Firebase config values
- **"auth/network-request-failed"**: Check your internet connection

## Need Help?

If you're still experiencing issues:
1. Check the browser console for detailed error messages
2. Verify all steps above are completed
3. Make sure your Firebase project is active and billing is enabled (if required)

