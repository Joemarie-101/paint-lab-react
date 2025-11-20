// ColorHistoryContext.js - UPDATED
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from './AuthContext';

const ColorHistoryContext = createContext();

export const useColorHistory = () => {
  const context = useContext(ColorHistoryContext);
  if (!context) {
    throw new Error('useColorHistory must be used within a ColorHistoryProvider');
  }
  return context;
};

export const ColorHistoryProvider = ({ children }) => {
  const [savedColors, setSavedColors] = useState([]);
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();

  const loadUserColors = useCallback(async () => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      const colorsRef = collection(db, 'colorHistory');
      const q = query(colorsRef, where('userId', '==', currentUser.uid));
      const querySnapshot = await getDocs(q);
      
      const colors = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      setSavedColors(colors);
    } catch (error) {
      console.error('Error loading user colors:', error);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Load only current user's colors
  useEffect(() => {
    if (currentUser) {
      loadUserColors();
    } else {
      setSavedColors([]);
    }
  }, [currentUser, loadUserColors]);

  const addColorToHistory = async (colorData) => {
    if (!currentUser) {
      throw new Error('User must be logged in to save colors');
    }

    try {
      const colorWithUser = {
        ...colorData,
        userId: currentUser.uid,
        userEmail: currentUser.email,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'colorHistory'), colorWithUser);
      
      const newColor = {
        id: docRef.id,
        ...colorWithUser
      };
      
      setSavedColors(prev => [newColor, ...prev]);
      return newColor;
    } catch (error) {
      console.error('Error adding color to history:', error);
      throw error;
    }
  };

  const updateColor = async (colorId, updates) => {
    if (!currentUser) {
      throw new Error('User must be logged in to update colors');
    }

    try {
      console.log('🔄 Updating color:', { colorId, userId: currentUser.uid, role: currentUser.role });
      let colorRef = doc(db, 'colorHistory', colorId);
      
      // Check if document exists before updating
      let colorDoc = await getDoc(colorRef);
      
      // If document doesn't exist, try to find it by searching user's colors
      if (!colorDoc.exists()) {
        console.warn('⚠️ Document not found with ID, searching user colors...', colorId);
        
        // Try to find the color in the current user's saved colors
        const colorsRef = collection(db, 'colorHistory');
        const q = query(colorsRef, where('userId', '==', currentUser.uid));
        const querySnapshot = await getDocs(q);
        
        // Find color that might match by name or other fields
        const matchingDoc = querySnapshot.docs.find(doc => {
          const data = doc.data();
          // Check if this might be the color we're looking for
          // This handles cases where old colors had timestamp IDs stored in data
          return doc.id === colorId || data.id === colorId;
        });
        
        if (matchingDoc) {
          console.log('✅ Found color by search, using Firestore ID:', matchingDoc.id);
          colorDoc = matchingDoc;
          // Update the colorRef to use the correct Firestore document ID
          colorRef = doc(db, 'colorHistory', matchingDoc.id);
        } else {
          // If still not found, refresh colors and throw error
          await loadUserColors();
          throw new Error(`Color not found. It may have been deleted or the ID is invalid. Please refresh the page.`);
        }
      }
      
      // Verify the color belongs to the current user (unless admin)
      const colorData = colorDoc.data();
      console.log('📄 Color data:', { colorId, actualDocId: colorDoc.id, colorData, currentUserId: currentUser.uid, isAdmin: currentUser.role === 'admin' });
      
      // Allow admin to update any color, or user to update their own colors
      if (colorData.userId !== currentUser.uid && currentUser.role !== 'admin') {
        throw new Error('You can only update your own colors');
      }
      
      // Use the correct document reference (might be different from colorId)
      const actualColorRef = colorRef;
      
      // Only send the fields that should be updated, not the entire color object
      const updateFields = {
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      // Remove id from updates if it exists (shouldn't update document ID)
      delete updateFields.id;
      
      await updateDoc(actualColorRef, updateFields);

      // Update local state with correct ID
      setSavedColors(prev => 
        prev.map(color => 
          (color.id === colorId || color.id === colorDoc.id)
            ? { ...color, ...updateFields, id: colorDoc.id } 
            : color
        )
      );
      
      return { success: true };
    } catch (error) {
      console.error('Error updating color:', error);
      // Refresh colors to sync with Firestore
      if (currentUser) {
        await loadUserColors();
      }
      throw error;
    }
  };

  const deleteColor = async (colorId) => {
    if (!currentUser) return;

    try {
      console.log('🗑️ Deleting color:', { colorId, userId: currentUser.uid, role: currentUser.role });
      let colorRef = doc(db, 'colorHistory', colorId);
      
      // Check if document exists before deleting
      let colorDoc = await getDoc(colorRef);
      
      // If document doesn't exist, try to find it by searching user's colors
      if (!colorDoc.exists()) {
        console.warn('⚠️ Document not found with ID, searching user colors...', colorId);
        
        // Try to find the color in the current user's saved colors
        const colorsRef = collection(db, 'colorHistory');
        const q = query(colorsRef, where('userId', '==', currentUser.uid));
        const querySnapshot = await getDocs(q);
        
        // Find color that might match by name or other fields
        const matchingDoc = querySnapshot.docs.find(doc => {
          const data = doc.data();
          // Check if this might be the color we're looking for
          return doc.id === colorId || data.id === colorId;
        });
        
        if (matchingDoc) {
          console.log('✅ Found color by search, using Firestore ID:', matchingDoc.id);
          colorDoc = matchingDoc;
          colorRef = doc(db, 'colorHistory', matchingDoc.id);
        } else {
          // If still not found, refresh colors and throw error
          await loadUserColors();
          throw new Error(`Color not found. It may have been deleted or the ID is invalid. Please refresh the page.`);
        }
      }
      
      // Verify the color belongs to the current user (unless admin)
      const colorData = colorDoc.data();
      console.log('📄 Color data to delete:', { colorId, actualDocId: colorDoc.id, colorData });
      
      if (colorData.userId !== currentUser.uid && currentUser.role !== 'admin') {
        throw new Error('You can only delete your own colors');
      }

      // Use the correct document reference
      const actualColorRef = colorRef;
      await deleteDoc(actualColorRef);
      
      // Remove from local state using both possible IDs
      setSavedColors(prev => prev.filter(color => color.id !== colorId && color.id !== colorDoc.id));
    } catch (error) {
      console.error(`Error deleting color ${colorId}:`, error);
      // Refresh colors to sync with Firestore
      if (currentUser) {
        await loadUserColors();
      }
      throw error;
    }
  };

  const value = {
    savedColors,
    loading,
    addColorToHistory,
    updateColor,
    deleteColor,
    refreshColors: loadUserColors
  };

  return (
    <ColorHistoryContext.Provider value={value}>
      {children}
    </ColorHistoryContext.Provider>
  );
};