// AdminContext.js - COMPLETE FIXED VERSION
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import * as adminService from '../firebase/adminService';

const AdminContext = createContext();

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

export const AdminProvider = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminLoading, setAdminLoading] = useState(true);
  const [systemStats, setSystemStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [brandColors, setBrandColors] = useState([]);
  const [paintFormulas, setPaintFormulas] = useState([]);
  const [colorMixes, setColorMixes] = useState([]);
  const [userColors, setUserColors] = useState([]);
  const [systemSettings, setSystemSettings] = useState({});

  const { currentUser } = useAuth();

  const loadSystemData = useCallback(async () => {
    try {
      console.log('Loading system data for admin...');
      const [
        stats,
        usersData,
        brandColorsData,
        formulasData,
        colorMixesData,
        userColorsData,
        settings
      ] = await Promise.all([
        adminService.getSystemStats(),
        adminService.getAllUsers(),
        adminService.getAllBrandColors(),
        adminService.getAllPaintFormulas(),
        adminService.getAllColorMixes(),
        adminService.getAllUserColors(),
        adminService.getSystemSettings()
      ]);

      setSystemStats(stats);
      setUsers(usersData);
      setBrandColors(brandColorsData);
      setPaintFormulas(formulasData);
      setColorMixes(colorMixesData);
      setUserColors(userColorsData);
      setSystemSettings(settings);
      console.log('System data loaded successfully');
    } catch (error) {
      console.error('Error loading system data:', error);
    }
  }, []);

  // Check if current user is admin - SAFE VERSION
  useEffect(() => {
    if (currentUser && currentUser.role) {
      // Use the role from AuthContext
      const adminStatus = currentUser.role === 'admin';
      setIsAdmin(adminStatus);
      console.log('Admin status check:', { 
        email: currentUser.email, 
        role: currentUser.role, 
        isAdmin: adminStatus 
      });
    } else {
      // If no role or no user, not admin
      setIsAdmin(false);
      console.log('Admin status: No user or role undefined', currentUser);
    }
    setAdminLoading(false);
  }, [currentUser]);

  // Load system data if admin
  useEffect(() => {
    if (isAdmin && currentUser) {
      console.log('Loading admin data for user:', currentUser.email);
      loadSystemData();
    } else {
      // Clear admin data if not admin
      setSystemStats(null);
      setUsers([]);
      setBrandColors([]);
      setPaintFormulas([]);
      setColorMixes([]);
      setUserColors([]);
      setSystemSettings({});
    }
  }, [isAdmin, currentUser, loadSystemData]);

  // User Management
  const updateUser = async (userId, updates) => {
    try {
      const result = await adminService.updateUserRole(userId, updates.role);
      if (result.success) {
        setUsers(prev => prev.map(user => 
          user.id === userId ? { ...user, ...updates } : user
        ));
      }
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const removeUser = async (userId) => {
    try {
      const result = await adminService.deleteUser(userId);
      if (result.success) {
        setUsers(prev => prev.filter(user => user.id !== userId));
      }
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const disableUser = async (userId) => {
    try {
      const result = await adminService.disableUser(userId);
      if (result.success) {
        setUsers(prev => prev.map(user => 
          user.id === userId ? { ...user, disabled: true, disabledAt: new Date().toISOString() } : user
        ));
      }
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const enableUser = async (userId) => {
    try {
      const result = await adminService.enableUser(userId);
      if (result.success) {
        setUsers(prev => prev.map(user => 
          user.id === userId ? { ...user, disabled: false, disabledAt: null } : user
        ));
      }
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Brand Colors Management
  const addBrandColor = async (colorData) => {
    try {
      const result = await adminService.addBrandColor(colorData);
      if (result.success) {
        const newColor = { id: result.id, ...colorData };
        setBrandColors(prev => [...prev, newColor]);
      }
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const updateBrandColor = async (colorId, updates) => {
    try {
      const result = await adminService.updateBrandColor(colorId, updates);
      if (result.success) {
        setBrandColors(prev => prev.map(color => 
          color.id === colorId ? { ...color, ...updates } : color
        ));
      }
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const removeBrandColor = async (colorId) => {
    try {
      const result = await adminService.deleteBrandColor(colorId);
      if (result.success) {
        setBrandColors(prev => prev.filter(color => color.id !== colorId));
      }
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Data Management
  const removePaintFormula = async (formulaId) => {
    try {
      const result = await adminService.deletePaintFormula(formulaId);
      if (result.success) {
        setPaintFormulas(prev => prev.filter(formula => formula.id !== formulaId));
      }
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const removeColorMix = async (mixId) => {
    try {
      const result = await adminService.deleteColorMix(mixId);
      if (result.success) {
        setColorMixes(prev => prev.filter(mix => mix.id !== mixId));
      }
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // User Color Management
  const updateUserColor = async (colorId, updates) => {
    try {
      const result = await adminService.updateUserColor(colorId, updates);
      if (result.success) {
        setUserColors(prev => prev.map(color => 
          color.id === colorId ? { ...color, ...updates } : color
        ));
      }
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const deleteUserColor = async (colorId) => {
    try {
      const result = await adminService.deleteUserColor(colorId);
      if (result.success) {
        setUserColors(prev => prev.filter(color => color.id !== colorId));
      }
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // System Settings
  const updateSettings = async (newSettings) => {
    try {
      const result = await adminService.updateSystemSettings(newSettings);
      if (result.success) {
        setSystemSettings(newSettings);
      }
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const value = {
    isAdmin,
    adminLoading,
    systemStats,
    users,
    brandColors,
    paintFormulas,
    colorMixes,
    userColors,
    systemSettings,
    refreshData: loadSystemData,
    updateUser,
    removeUser,
    disableUser,
    enableUser,
    addBrandColor,
    updateBrandColor,
    removeBrandColor,
    removePaintFormula,
    removeColorMix,
    updateUserColor,
    deleteUserColor,
    updateSettings
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};