// components/AdminSetup.jsx (temporary - use once then remove)
import { useState } from 'react';
import { auth, db } from '../firebase/config';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

export default function AdminSetup() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const createAdminUser = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const email = 'admin@joespaintlab.com';
      const password = 'Admin123!';
      
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Create user document with admin role
      await setDoc(doc(db, 'users', user.uid), {
        email: email,
        displayName: 'Administrator',
        role: 'admin',
        createdAt: new Date()
      });
      
      setMessage('✅ Admin user created successfully! You can now login with admin@joespaintlab.com / Admin123!');
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        setMessage('ℹ️ Admin user already exists. Updating role to admin...');
        
        // If user exists but not admin, update their role
        const user = auth.currentUser;
        if (user && user.email === 'admin@joespaintlab.com') {
          await setDoc(doc(db, 'users', user.uid), {
            role: 'admin'
          }, { merge: true });
          setMessage('✅ Existing user updated to admin role');
        }
      } else {
        setMessage('❌ Error creating admin: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '50px auto', textAlign: 'center' }}>
      <h2>Admin Setup</h2>
      <p>Click the button below to create an admin user.</p>
      <button 
        onClick={createAdminUser} 
        disabled={loading}
        style={{ padding: '10px 20px', fontSize: '16px' }}
      >
        {loading ? 'Creating...' : 'Create Admin User'}
      </button>
      {message && (
        <div style={{ 
          marginTop: '20px', 
          padding: '10px', 
          backgroundColor: message.includes('✅') ? '#d4edda' : '#f8d7da',
          border: message.includes('✅') ? '1px solid #c3e6cb' : '1px solid #f5c6cb',
          borderRadius: '4px'
        }}>
          {message}
        </div>
      )}
    </div>
  );
}