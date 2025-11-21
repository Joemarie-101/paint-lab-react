import { 
  db,
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc, 
  updateDoc,
  addDoc
} from './config';

// Admin Collections
const ADMIN_COLLECTIONS = {
  USERS: 'users',
  BRAND_COLORS: 'brandColors',
  PAINT_FORMULAS: 'paintFormulas',
  COLOR_MIXES: 'colorMixes',
  BRAND_SELECTIONS: 'brandSelections',
  SYSTEM_SETTINGS: 'systemSettings'
};

// Check if user is admin
export const isUserAdmin = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, ADMIN_COLLECTIONS.USERS, userId));
    return userDoc.exists() && userDoc.data().role === 'admin';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

// User Management
export const getAllUsers = async () => {
  try {
    const usersRef = collection(db, ADMIN_COLLECTIONS.USERS);
    const snapshot = await getDocs(usersRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const updateUserRole = async (userId, role) => {
  try {
    await updateDoc(doc(db, ADMIN_COLLECTIONS.USERS, userId), { role });
    return { success: true };
  } catch (error) {
    console.error('Error updating user role:', error);
    return { success: false, error: error.message };
  }
};

export const deleteUser = async (userId) => {
  try {
    // Mark user as deleted in Firestore first
    const userRef = doc(db, ADMIN_COLLECTIONS.USERS, userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return { success: false, error: 'User not found' };
    }
    
    // Update user document to mark as deleted and disabled
    await updateDoc(userRef, {
      deleted: true,
      disabled: true,
      deletedAt: new Date().toISOString(),
      disabledAt: new Date().toISOString()
    });
    
    console.log('✅ User marked as deleted in Firestore');
    return { success: true };
  } catch (error) {
    console.error('Error deleting user:', error);
    return { success: false, error: error.message };
  }
};

export const disableUser = async (userId) => {
  try {
    await updateDoc(doc(db, ADMIN_COLLECTIONS.USERS, userId), { 
      disabled: true,
      disabledAt: new Date().toISOString()
    });
    return { success: true };
  } catch (error) {
    console.error('Error disabling user:', error);
    return { success: false, error: error.message };
  }
};

export const enableUser = async (userId) => {
  try {
    await updateDoc(doc(db, ADMIN_COLLECTIONS.USERS, userId), { 
      disabled: false,
      disabledAt: null
    });
    return { success: true };
  } catch (error) {
    console.error('Error enabling user:', error);
    return { success: false, error: error.message };
  }
};

// Brand Colors Management
export const getAllBrandColors = async () => {
  try {
    const brandColorsRef = collection(db, ADMIN_COLLECTIONS.BRAND_COLORS);
    const snapshot = await getDocs(brandColorsRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching brand colors:', error);
    throw error;
  }
};

export const addBrandColor = async (brandColorData) => {
  try {
    const docRef = await addDoc(collection(db, ADMIN_COLLECTIONS.BRAND_COLORS), {
      ...brandColorData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error adding brand color:', error);
    return { success: false, error: error.message };
  }
};

export const updateBrandColor = async (colorId, updateData) => {
  try {
    const colorRef = doc(db, ADMIN_COLLECTIONS.BRAND_COLORS, colorId);
    
    // Check if document exists before updating
    const colorDoc = await getDoc(colorRef);
    if (!colorDoc.exists()) {
      return { success: false, error: 'Brand color document not found' };
    }
    
    await updateDoc(colorRef, {
      ...updateData,
      updatedAt: new Date()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating brand color:', error);
    return { success: false, error: error.message };
  }
};

export const deleteBrandColor = async (colorId) => {
  try {
    const colorRef = doc(db, ADMIN_COLLECTIONS.BRAND_COLORS, colorId);
    
    // Check if document exists before deleting
    const colorDoc = await getDoc(colorRef);
    if (!colorDoc.exists()) {
      return { success: false, error: 'Brand color document not found' };
    }
    
    await deleteDoc(colorRef);
    return { success: true };
  } catch (error) {
    console.error('Error deleting brand color:', error);
    return { success: false, error: error.message };
  }
};

// Paint Formulas Management
export const getAllPaintFormulas = async () => {
  try {
    const formulasRef = collection(db, ADMIN_COLLECTIONS.PAINT_FORMULAS);
    const snapshot = await getDocs(formulasRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching paint formulas:', error);
    throw error;
  }
};

export const deletePaintFormula = async (formulaId) => {
  try {
    await deleteDoc(doc(db, ADMIN_COLLECTIONS.PAINT_FORMULAS, formulaId));
    return { success: true };
  } catch (error) {
    console.error('Error deleting paint formula:', error);
    return { success: false, error: error.message };
  }
};

// Color Mixes Management
export const getAllColorMixes = async () => {
  try {
    const colorMixesRef = collection(db, ADMIN_COLLECTIONS.COLOR_MIXES);
    const snapshot = await getDocs(colorMixesRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching color mixes:', error);
    throw error;
  }
};

export const deleteColorMix = async (mixId) => {
  try {
    await deleteDoc(doc(db, ADMIN_COLLECTIONS.COLOR_MIXES, mixId));
    return { success: true };
  } catch (error) {
    console.error('Error deleting color mix:', error);
    return { success: false, error: error.message };
  }
};

// System Statistics
export const getSystemStats = async () => {
  try {
    const [
      usersSnapshot,
      brandColorsSnapshot,
      formulasSnapshot,
      colorMixesSnapshot,
      userColorsSnapshot
    ] = await Promise.all([
      getDocs(collection(db, ADMIN_COLLECTIONS.USERS)),
      getDocs(collection(db, ADMIN_COLLECTIONS.BRAND_COLORS)),
      getDocs(collection(db, ADMIN_COLLECTIONS.PAINT_FORMULAS)),
      getDocs(collection(db, ADMIN_COLLECTIONS.COLOR_MIXES)),
      getDocs(collection(db, 'colorHistory'))
    ]);

    return {
      totalUsers: usersSnapshot.size,
      brandColors: brandColorsSnapshot.size,
      totalFormulas: formulasSnapshot.size,
      totalColorMixes: colorMixesSnapshot.size,
      userColors: userColorsSnapshot.size,
      recentActivity: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching system stats:', error);
    throw error;
  }
};

// User Color History Management
export const getAllUserColors = async () => {
  try {
    const colorHistoryRef = collection(db, 'colorHistory');
    const snapshot = await getDocs(colorHistoryRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching user colors:', error);
    throw error;
  }
};

export const updateUserColor = async (colorId, updateData) => {
  try {
    console.log('🔄 Admin updating user color:', { colorId, updateData });
    let colorRef = doc(db, 'colorHistory', colorId);
    
    // Check if document exists before updating
    let colorDoc = await getDoc(colorRef);
    
    // If document doesn't exist, try to find it by searching all colors
    if (!colorDoc.exists()) {
      console.warn('⚠️ Document not found with ID, searching all colors...', colorId);
      
      // Try to find the color by searching all user colors
      const colorsRef = collection(db, 'colorHistory');
      const querySnapshot = await getDocs(colorsRef);
      
      // Find color that might match - check both document ID and stored ID field
      const matchingDoc = querySnapshot.docs.find(doc => {
        const data = doc.data();
        // Check if this might be the color we're looking for
        // This handles cases where old colors had timestamp IDs stored in data
        return doc.id === colorId || data.id === colorId;
      });
      
      if (matchingDoc) {
        console.log('✅ Found color by search, using Firestore ID:', matchingDoc.id);
        colorDoc = matchingDoc;
        colorRef = doc(db, 'colorHistory', matchingDoc.id);
      } else {
        console.error('❌ Color document not found:', colorId);
        return { success: false, error: `No document to update: projects/joe-s-paint-lab/databases/(default)/documents/colorHistory/${colorId}. The color may have been deleted or the ID is invalid.` };
      }
    }
    
    // Remove id from updateData if it exists (shouldn't update document ID)
    const { id, ...safeUpdateData } = updateData;
    
    await updateDoc(colorRef, {
      ...safeUpdateData,
      updatedAt: new Date().toISOString()
    });
    
    console.log('✅ Color updated successfully with ID:', colorDoc.id);
    return { success: true, actualId: colorDoc.id };
  } catch (error) {
    console.error('Error updating user color:', error);
    return { success: false, error: error.message };
  }
};

export const deleteUserColor = async (colorId) => {
  try {
    console.log('🗑️ Admin deleting user color:', colorId);
    let colorRef = doc(db, 'colorHistory', colorId);
    
    // Check if document exists before deleting
    let colorDoc = await getDoc(colorRef);
    
    // If document doesn't exist, try to find it by searching all colors
    if (!colorDoc.exists()) {
      console.warn('⚠️ Document not found with ID, searching all colors...', colorId);
      
      // Try to find the color by searching all user colors
      const colorsRef = collection(db, 'colorHistory');
      const querySnapshot = await getDocs(colorsRef);
      
      // Find color that might match - check both document ID and stored ID field
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
        console.error('❌ Color document not found:', colorId);
        return { success: false, error: `No document to delete: projects/joe-s-paint-lab/databases/(default)/documents/colorHistory/${colorId}. The color may have already been deleted or the ID is invalid.` };
      }
    }
    
    await deleteDoc(colorRef);
    console.log('✅ Color deleted successfully with ID:', colorDoc.id);
    return { success: true, actualId: colorDoc.id };
  } catch (error) {
    console.error('Error deleting user color:', error);
    return { success: false, error: error.message };
  }
};

// System Settings
export const getSystemSettings = async () => {
  try {
    const settingsDoc = await getDoc(doc(db, ADMIN_COLLECTIONS.SYSTEM_SETTINGS, 'global'));
    return settingsDoc.exists() ? settingsDoc.data() : {};
  } catch (error) {
    console.error('Error fetching system settings:', error);
    throw error;
  }
};

export const updateSystemSettings = async (settings) => {
  try {
    await setDoc(doc(db, ADMIN_COLLECTIONS.SYSTEM_SETTINGS, 'global'), {
      ...settings,
      updatedAt: new Date()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating system settings:', error);
    return { success: false, error: error.message };
  }
};