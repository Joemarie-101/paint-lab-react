// AuthContext.js - UPDATED
import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase/config'; 
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Firebase Auth login function with admin role check
  const login = async (email, password) => {
    try {
      if (!auth) {
        throw new Error('Firebase Auth is not initialized. Please check your Firebase configuration.');
      }
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Check if user has admin role in Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      let userData = {};
      
      if (userDoc.exists()) {
        userData = userDoc.data();
        console.log('User role from Firestore:', userData.role);
        
        // CHECK IF USER IS DELETED OR DISABLED
        if (userData.deleted || userData.disabled) {
          // Sign out the user immediately
          await signOut(auth);
          console.log('❌ Login blocked: User account is deleted or disabled');
          return { 
            success: false, 
            error: 'This account has been deleted or disabled by an administrator. You cannot log in.'
          };
        }
      } else {
        // Create user document if it doesn't exist (for regular users)
        await setDoc(doc(db, 'users', user.uid), {
          email: user.email,
          displayName: user.displayName || user.email.split('@')[0],
          role: 'user', // Default role
          createdAt: new Date()
        });
        userData.role = 'user';
      }
      
      // Store user data including role
      const userWithRole = {
        uid: user.uid,
        email: user.email,
        displayName: userData.displayName || user.email.split('@')[0],
        role: userData.role || 'user' // Ensure role is always set
      };
      
      setCurrentUser(userWithRole);
      return { success: true, user: userWithRole };
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = 'Failed to log in. Please check your credentials.';
      
      // Provide user-friendly error messages
      if (error.code === 'auth/configuration-not-found') {
        errorMessage = 'Firebase Authentication is not configured. Please enable Email/Password authentication in Firebase Console.';
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return { 
        success: false, 
        error: errorMessage
      };
    }
  };

  // Firebase Auth register function
  const register = async (email, password, displayName) => {
    try {
      if (!auth) {
        throw new Error('Firebase Auth is not initialized. Please check your Firebase configuration.');
      }
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Create user document in Firestore with default 'user' role
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        displayName: displayName || user.email.split('@')[0],
        role: 'user', // Default role for new users
        createdAt: new Date()
      });
      
      const userWithRole = {
        uid: user.uid,
        email: user.email,
        displayName: displayName || user.email.split('@')[0],
        role: 'user' // Explicitly set role
      };
      
      setCurrentUser(userWithRole);
      return { success: true, user: userWithRole };
    } catch (error) {
      console.error('Registration error:', error);
      let errorMessage = 'Failed to register. Please try again.';
      
      // Provide user-friendly error messages
      if (error.code === 'auth/configuration-not-found') {
        errorMessage = 'Firebase Authentication is not configured. Please enable Email/Password authentication in Firebase Console under Authentication > Sign-in method.';
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists. Please log in instead.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please use at least 6 characters.';
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = 'Email/Password authentication is not enabled. Please enable it in Firebase Console.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return { 
        success: false, 
        error: errorMessage
      };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  useEffect(() => {
    // Check if auth is available before subscribing
    if (!auth) {
      console.error('Firebase Auth is not initialized');
      setLoading(false);
      return;
    }

    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          // Check user role in Firestore
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          let userData = {};
          
          if (userDoc.exists()) {
            userData = userDoc.data();
            console.log('Auth state change - User role:', userData.role);
            
            // CHECK IF USER IS DELETED OR DISABLED
            if (userData.deleted || userData.disabled) {
              console.log('🚫 User is deleted or disabled, signing out...');
              // Sign out the user immediately
              await signOut(auth);
              setCurrentUser(null);
              setLoading(false);
              return;
            }
          }
          
          setCurrentUser({
            uid: user.uid,
            email: user.email,
            displayName: userData.displayName || user.displayName || user.email?.split('@')[0] || 'User',
            role: userData.role || 'user' // Ensure role is always set
          });
        } else {
          setCurrentUser(null);
        }
      } catch (error) {
        console.error('Error processing auth state:', error);
        // Set a default user even if there's an error
        if (user) {
          setCurrentUser({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || user.email?.split('@')[0] || 'User',
            role: 'user' // Default role
          });
        }
      } finally {
        setLoading(false);
      }
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  const value = {
    currentUser,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};